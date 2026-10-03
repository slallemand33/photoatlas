import type { AstronomySnapshot } from "@/features/astronomy/types";
import type { PhotoRecommendation, PhotoScoreResult } from "@/features/photo-score/types";
import type { LightningActivity } from "@/features/weather/lightning";
import type { PhotoWeatherSnapshot } from "@/features/weather/types";

import type {
  OpportunityCandidateInput,
  RecommendationAssemblyInput,
  RecommendationAssemblyResult,
  RecommendationEngineResult,
  RecommendationReferenceEntry,
  RecommendationReferenceRepository,
  RecommendationSpotEvaluationInput,
  RecommendationSourcePhotoKind,
  RecommendationSpotCandidate,
  RecommendationTiming,
} from "../types";
import { getRecommendationPhotoType } from "../utils/photoTypes.ts";

import { recommendationEngine } from "./RecommendationEngine.ts";

function buildTiming(
  kind: RecommendationSourcePhotoKind,
  recommendation: RecommendationAssemblyInput["recommendations"][number],
  astronomy: RecommendationAssemblyInput["astronomy"],
): RecommendationTiming {
  if (kind === "sunrise") {
    return {
      start: astronomy.sun.blueHour.morning.start ?? astronomy.sun.goldenHour.morning.start,
      end: astronomy.sun.goldenHour.morning.end ?? astronomy.sun.rise,
      idealTime: recommendation.recommendedTime,
    };
  }

  if (kind === "sunset") {
    return {
      start: astronomy.sun.goldenHour.evening.start ?? astronomy.sun.set,
      end: astronomy.sun.blueHour.evening.end ?? astronomy.sun.goldenHour.evening.end,
      idealTime: recommendation.recommendedTime,
    };
  }

  if (kind === "astro") {
    return {
      start: astronomy.sun.astronomicalNight.start,
      end: astronomy.sun.astronomicalNight.end,
      idealTime: recommendation.recommendedTime ?? astronomy.milkyWay.core.transit,
    };
  }

  if (kind === "storm" || kind === "storms") {
    return {
      start: recommendation.recommendedTime,
      end: null,
      idealTime: recommendation.recommendedTime,
    };
  }

  return {
    start: recommendation.departureTime,
    end: recommendation.recommendedTime,
    idealTime: recommendation.recommendedTime,
  };
}

function normalizeRecommendations(
  recommendations: RecommendationAssemblyInput["recommendations"],
): Map<RecommendationSourcePhotoKind, RecommendationAssemblyInput["recommendations"][number]> {
  return new Map(recommendations.map((recommendation) => [recommendation.kind, recommendation]));
}

function buildSafety(lightning?: RecommendationAssemblyInput["lightning"]) {
  if (lightning?.level === "high" && lightning.nearbyStrikeCount > 0) {
    return {
      safetyLevel: "danger" as const,
      safetyWarning: "Conditions orageuses fortes : prudence",
    };
  }

  return {
    safetyLevel: "normal" as const,
    safetyWarning: null,
  };
}

function buildAstroEligibility() {
  return {
    isEligible: true,
    exclusionReason: null,
  };
}

function resolveReferenceForSpot(
  spot: RecommendationSpotCandidate,
  references: RecommendationReferenceEntry[],
): RecommendationReferenceEntry | null {
  if (spot.spotTypeId) {
    const byId = references.find((reference) => reference.id === spot.spotTypeId);
    if (byId) return byId;
  }

  if (spot.spotTypeSlug) {
    const bySlug = references.find((reference) => reference.slug === spot.spotTypeSlug);
    if (bySlug) return bySlug;
  }

  return null;
}

export interface AssembleFromPhotoScoreInput {
  analyzedAt: string;
  spots: RecommendationSpotCandidate[];
  photoScore: PhotoScoreResult;
  astronomy: AstronomySnapshot;
  weather: PhotoWeatherSnapshot;
  lightning?: LightningActivity;
}

function toCandidateInput(args: {
  spot: RecommendationSpotCandidate;
  reference: RecommendationReferenceEntry;
  kind: RecommendationSourcePhotoKind;
  recommendation: RecommendationAssemblyInput["recommendations"][number];
  astronomy: RecommendationAssemblyInput["astronomy"];
  weather: RecommendationAssemblyInput["weather"];
  lightning?: RecommendationAssemblyInput["lightning"];
}): OpportunityCandidateInput {
  const photoType =
    args.kind === "storms"
      ? getRecommendationPhotoType("storm")
      : getRecommendationPhotoType(args.kind);
  const safety = buildSafety(args.lightning);
  const eligibility =
    photoType.slug === "astro"
      ? buildAstroEligibility()
      : { isEligible: true, exclusionReason: null };

  return {
    spot: {
      id: args.spot.id,
      name: args.spot.name,
      slug: args.spot.slug,
      latitude: args.spot.latitude,
      longitude: args.spot.longitude,
        spotTypeId: args.spot.spotTypeId ?? null,
      spotTypeSlug: args.reference.slug,
      spotTypeName: args.reference.name,
      parentTypeSlug: args.reference.parentSlug,
      parentTypeName: args.reference.parentName,
      distanceKm: args.spot.distanceKm,
    },
    photoType,
    timing: buildTiming(args.kind, args.recommendation, args.astronomy),
    conditionScore: args.recommendation.score,
    compatibilityScore: args.reference.compatibilities[photoType.slug] ?? 0,
    isEligible: eligibility.isEligible,
    exclusionReason: eligibility.exclusionReason,
    safetyLevel: photoType.slug === "storm" ? safety.safetyLevel : "normal",
    safetyWarning: photoType.slug === "storm" ? safety.safetyWarning : null,
    conditionSummary: args.recommendation.summary,
    conditionExplanation: args.recommendation.explanation,
  };
}

export class RecommendationAssemblyService {
  private readonly referenceRepository: RecommendationReferenceRepository;

  constructor(referenceRepository: RecommendationReferenceRepository) {
    this.referenceRepository = referenceRepository;
  }

  async assemble(input: RecommendationAssemblyInput): Promise<RecommendationAssemblyResult> {
    const references = await this.referenceRepository.getSpotTypeReferences({
      spotTypeIds: input.spots
        .map((spot) => spot.spotTypeId)
        .filter((value): value is string => Boolean(value)),
      spotTypeSlugs: input.spots
        .map((spot) => spot.spotTypeSlug)
        .filter((value): value is string => Boolean(value)),
    });

    const byKind = normalizeRecommendations(input.recommendations);
    const candidates: OpportunityCandidateInput[] = [];
    const missingData = new Set<string>();

    for (const spot of input.spots) {
      const reference = resolveReferenceForSpot(spot, references);
      if (!reference) {
        missingData.add(`Référentiel manquant pour le spot ${spot.slug}.`);
        continue;
      }

      for (const [kind, recommendation] of byKind.entries()) {
        const photoType = kind === "storms" ? getRecommendationPhotoType("storm") : getRecommendationPhotoType(kind);
        const compatibilityScore = reference.compatibilities[photoType.slug];
        if (typeof compatibilityScore !== "number") {
          missingData.add(`Compatibilité manquante pour ${reference.slug}/${photoType.slug}.`);
          continue;
        }

        candidates.push(
          toCandidateInput({
            spot,
            reference,
            kind,
            recommendation,
            astronomy: input.astronomy,
            weather: input.weather,
            lightning: input.lightning,
          }),
        );
      }
    }

    return {
      candidates,
      missingData: [...missingData],
    };
  }

  async recommend(input: RecommendationAssemblyInput): Promise<RecommendationEngineResult> {
    const assembly = await this.assemble(input);
    return this.recommendFromCandidates(input.analyzedAt, assembly.candidates);
  }

  async assembleSpotEvaluations(
    evaluations: RecommendationSpotEvaluationInput[],
  ): Promise<RecommendationAssemblyResult> {
    const references = await this.referenceRepository.getSpotTypeReferences({
      spotTypeIds: evaluations
        .map((evaluation) => evaluation.spot.spotTypeId)
        .filter((value): value is string => Boolean(value)),
      spotTypeSlugs: evaluations
        .map((evaluation) => evaluation.spot.spotTypeSlug)
        .filter((value): value is string => Boolean(value)),
    });

    const candidates: OpportunityCandidateInput[] = [];
    const missingData = new Set<string>();

    for (const evaluation of evaluations) {
      const reference = resolveReferenceForSpot(evaluation.spot, references);
      if (!reference) {
        missingData.add(`Référentiel manquant pour le spot ${evaluation.spot.slug}.`);
        continue;
      }

      for (const recommendation of evaluation.recommendations) {
        const photoType =
          recommendation.kind === "storms"
            ? getRecommendationPhotoType("storm")
            : getRecommendationPhotoType(recommendation.kind);
        const compatibilityScore = reference.compatibilities[photoType.slug];
        if (typeof compatibilityScore !== "number") {
          missingData.add(`Compatibilité manquante pour ${reference.slug}/${photoType.slug}.`);
          continue;
        }

        candidates.push(
          toCandidateInput({
            spot: evaluation.spot,
            reference,
            kind: recommendation.kind,
            recommendation,
            astronomy: evaluation.astronomy,
            weather: evaluation.weather,
            lightning: evaluation.lightning,
          }),
        );
      }
    }

    return {
      candidates,
      missingData: [...missingData],
    };
  }

  recommendFromCandidates(
    analyzedAt: string,
    candidates: OpportunityCandidateInput[],
  ): RecommendationEngineResult {
    return recommendationEngine.rank({
      analyzedAt,
      candidates,
    });
  }

  async assembleFromPhotoScore(
    input: AssembleFromPhotoScoreInput,
  ): Promise<RecommendationAssemblyResult> {
    return this.assemble({
      analyzedAt: input.analyzedAt,
      spots: input.spots,
      recommendations: input.photoScore.recommendations.map((recommendation: PhotoRecommendation) => ({
        kind: recommendation.kind,
        score: recommendation.score,
        summary: recommendation.summary,
        explanation: recommendation.explanation,
        recommendedTime: recommendation.recommendedTime,
        departureTime: recommendation.departureTime,
      })),
      astronomy: input.astronomy,
      weather: input.weather,
      lightning: input.lightning
        ? {
            level: input.lightning.level,
            nearbyStrikeCount: input.lightning.nearbyStrikeCount,
          }
        : undefined,
    });
  }
}