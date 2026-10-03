import type { AstronomySnapshot } from "@/features/astronomy/types";
import type { PhotoScoreInput, PhotoScoreResult } from "@/features/photo-score/types";
import type { PhotoWeatherSnapshot, WeatherLocation } from "@/features/weather/types";

import type {
  RecommendationCandidateSpotsRepository,
  RecommendationReferenceRepository,
  RecommendationRuntimeInput,
  RecommendationRuntimeResult,
  RecommendationSpotEvaluationInput,
} from "../types/index.ts";

import { RecommendationAssemblyService } from "./RecommendationAssemblyService.ts";

interface RuntimeDependencies {
  getPhotoConditions: (
    locations: WeatherLocation[],
    signal?: AbortSignal,
  ) => Promise<PhotoWeatherSnapshot[]>;
  calculateAstronomy: (
    location: { latitude: number; longitude: number; elevationMeters?: number },
    date?: Date,
  ) => AstronomySnapshot;
  calculatePhotoScore: (input: PhotoScoreInput) => PhotoScoreResult;
}

export class RecommendationRuntimeService {
  private readonly spotsRepository: RecommendationCandidateSpotsRepository;
  private readonly assemblyService: RecommendationAssemblyService;
  private readonly dependencies: Partial<RuntimeDependencies>;

  constructor(input: {
    spotsRepository: RecommendationCandidateSpotsRepository;
    referenceRepository: RecommendationReferenceRepository;
    dependencies?: Partial<RuntimeDependencies>;
  }) {
    this.spotsRepository = input.spotsRepository;
    this.assemblyService = new RecommendationAssemblyService(input.referenceRepository);
    this.dependencies = input.dependencies ?? {};
  }

  private async resolveGetPhotoConditions(): Promise<RuntimeDependencies["getPhotoConditions"]> {
    if (this.dependencies.getPhotoConditions) return this.dependencies.getPhotoConditions;

    const { weatherProvider } = await import("../../weather/services/openMeteoWeatherProvider.ts");
    return weatherProvider.getPhotoConditions.bind(weatherProvider);
  }

  private async resolveCalculateAstronomy(): Promise<RuntimeDependencies["calculateAstronomy"]> {
    if (this.dependencies.calculateAstronomy) return this.dependencies.calculateAstronomy;

    const { astronomyService } = await import("../../astronomy/services/AstronomyService.ts");
    return astronomyService.calculate.bind(astronomyService);
  }

  private async resolveCalculatePhotoScore(): Promise<RuntimeDependencies["calculatePhotoScore"]> {
    if (this.dependencies.calculatePhotoScore) return this.dependencies.calculatePhotoScore;

    const { photoScoreEngine } = await import("../../photo-score/services/PhotoScoreEngine.ts");
    return photoScoreEngine.calculate.bind(photoScoreEngine);
  }

  async prepare(input: RecommendationRuntimeInput): Promise<RecommendationRuntimeResult> {
    const analyzedAt = (input.analyzedAt ?? new Date()).toISOString();
    const spots = await this.spotsRepository.getCandidateSpots({
      latitude: input.latitude,
      longitude: input.longitude,
      radiusKm: input.radiusKm,
      limit: input.limit,
    });

    if (spots.length === 0) {
      const recommendation = this.assemblyService.recommendFromCandidates(analyzedAt, []);
      return {
        candidates: [],
        missingData: ["Aucun spot candidat dans le rayon courant."],
        recommendation,
      };
    }

    const getPhotoConditions = await this.resolveGetPhotoConditions();
    const calculateAstronomy = await this.resolveCalculateAstronomy();
    const calculatePhotoScore = await this.resolveCalculatePhotoScore();

    const weatherSnapshots = await getPhotoConditions(
      spots.map((spot) => ({ latitude: spot.latitude, longitude: spot.longitude })),
    );

    const evaluations: RecommendationSpotEvaluationInput[] = [];
    const missingData = new Set<string>();

    for (const [index, spot] of spots.entries()) {
      const weather = weatherSnapshots[index];
      if (!weather) {
        missingData.add(`Données météo manquantes pour le spot ${spot.slug}.`);
        continue;
      }

      const astronomy = calculateAstronomy(
        { latitude: spot.latitude, longitude: spot.longitude },
        input.analyzedAt ?? new Date(),
      );
      const photoScore = calculatePhotoScore({
        calculatedAt: astronomy.calculatedAt,
        weather,
        astronomy,
      });

      missingData.add(
        "Estimation de pollution lumineuse non disponible côté serveur actuel : non injectée dans le runtime recommendation.",
      );
      missingData.add(
        "Signal radar non disponible côté serveur actuel : non injecté dans le moteur de recommandation runtime.",
      );
      missingData.add(
        "Activité orageuse temps réel non disponible côté serveur actuel : safetyWarning non renseigné automatiquement.",
      );
      missingData.add(
        "Règle d'exclusion astro non finalisable avec les seules données runtime actuelles : opportunité conservée éligible par défaut.",
      );

      evaluations.push({
        spot,
        recommendations: photoScore.recommendations.map((recommendation) => ({
          kind: recommendation.kind,
          score: recommendation.score,
          summary: recommendation.summary,
          explanation: recommendation.explanation,
          recommendedTime: recommendation.recommendedTime,
          departureTime: recommendation.departureTime,
        })),
        astronomy: {
          sun: {
            rise: astronomy.sun.rise,
            set: astronomy.sun.set,
            goldenHour: astronomy.sun.goldenHour,
            blueHour: astronomy.sun.blueHour,
            astronomicalNight: astronomy.sun.astronomicalNight,
          },
          milkyWay: {
            core: {
              transit: astronomy.milkyWay.core.transit,
            },
          },
        },
        weather: {
          total: weather.total,
        },
      });
    }

    const assembly = await this.assemblyService.assembleSpotEvaluations(evaluations);
    const recommendation = this.assemblyService.recommendFromCandidates(analyzedAt, assembly.candidates);

    return {
      candidates: assembly.candidates,
      missingData: [...new Set([...missingData, ...assembly.missingData])],
      recommendation,
    };
  }
}