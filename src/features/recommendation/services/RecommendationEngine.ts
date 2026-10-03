import type {
  IRecommendationEngine,
  OpportunityCandidateInput,
  RankedOpportunity,
  RecommendationEngineInput,
  RecommendationEngineResult,
  RecommendationSafetyLevel,
} from "../types";
import { getDistanceFactor, getDistanceMessage } from "../utils/distance.ts";
import { buildOpportunityExplanation, getEditorialMessage } from "../utils/editorial.ts";
import {
  getOpportunityTimeExclusionReason,
  minutesUntil,
  resolveOpportunityTime,
} from "../utils/time.ts";

const DEFAULT_WINDOW_HOURS = 24;
const DEFAULT_QUALITY_WINDOW_POINTS = 10;
const MIN_PRIMARY_SCORE = 60;

function clampOpportunityScore(score: number): number {
  return Math.max(0, Math.min(100, Number(score.toFixed(2))));
}

function safetyRank(level: RecommendationSafetyLevel): number {
  return { normal: 0, caution: 1, danger: 2 }[level];
}

function computeOpportunityScore(input: {
  conditionScore: number;
  compatibilityScore: number;
  distanceFactor: number;
}): number {
  const compatibilityModifier = 0.7 + 0.3 * input.compatibilityScore;
  const distanceModifier = 0.85 + 0.15 * input.distanceFactor;
  return clampOpportunityScore(input.conditionScore * compatibilityModifier * distanceModifier);
}

function normalizeCandidate(
  analyzedAt: string,
  windowHours: number,
  candidate: OpportunityCandidateInput,
): RankedOpportunity {
  const resolvedTime = resolveOpportunityTime(candidate.timing);
  const exclusionReason = getOpportunityTimeExclusionReason(analyzedAt, resolvedTime, windowHours);
  const isWithinWindow = exclusionReason === null;
  const distanceFactor = getDistanceFactor(candidate.spot.distanceKm);
  const opportunityScore = computeOpportunityScore({
    conditionScore: candidate.conditionScore,
    compatibilityScore: candidate.compatibilityScore,
    distanceFactor,
  });

  const normalized: RankedOpportunity = {
    spot: candidate.spot,
    photoType: candidate.photoType,
    timing: candidate.timing,
    conditionScore: Number(candidate.conditionScore.toFixed(2)),
    compatibilityScore: Number(candidate.compatibilityScore.toFixed(2)),
    distanceFactor,
    opportunityScore,
    editorialMessage: getEditorialMessage(opportunityScore),
    distanceMessage: getDistanceMessage(candidate.spot.distanceKm, opportunityScore),
    explanation: "",
    safetyWarning: candidate.safetyWarning ?? null,
    safetyLevel: candidate.safetyLevel ?? "normal",
    isEligible: candidate.isEligible !== false && isWithinWindow && Boolean(resolvedTime),
    exclusionReason:
      candidate.isEligible === false
        ? candidate.exclusionReason ?? "Condition indispensable absente."
        : exclusionReason ?? candidate.exclusionReason ?? null,
    isWithinWindow,
    resolvedTime,
    scoreDeltaFromBest: null,
  };

  normalized.explanation = buildOpportunityExplanation({
    ...normalized,
    conditionSummary: candidate.conditionSummary ?? null,
    conditionExplanation: candidate.conditionExplanation ?? null,
  } as RankedOpportunity & {
    conditionSummary?: string | null;
    conditionExplanation?: string | null;
  });

  return normalized;
}

function compareEligible(
  left: RankedOpportunity,
  right: RankedOpportunity,
): number {
  const safetyComparison = safetyRank(left.safetyLevel) - safetyRank(right.safetyLevel);
  if (safetyComparison !== 0) return safetyComparison;

  const scoreComparison = right.opportunityScore - left.opportunityScore;
  if (scoreComparison !== 0) return scoreComparison;

  const timeComparison =
    new Date(left.resolvedTime ?? "9999-12-31T23:59:59.999Z").getTime() -
    new Date(right.resolvedTime ?? "9999-12-31T23:59:59.999Z").getTime();
  if (timeComparison !== 0) return timeComparison;

  const distanceComparison = left.spot.distanceKm - right.spot.distanceKm;
  if (distanceComparison !== 0) return distanceComparison;

  return left.spot.slug.localeCompare(right.spot.slug);
}

function computeCurrentOpportunity(
  analyzedAt: string,
  primaryOpportunity: RankedOpportunity | null,
  topOpportunities: RankedOpportunity[],
  qualityWindowPoints: number,
): RankedOpportunity | null {
  if (!primaryOpportunity) return null;

  return (
    topOpportunities
      .filter((candidate) => candidate.spot.slug !== primaryOpportunity.spot.slug)
      .filter(
        (candidate) =>
          primaryOpportunity.opportunityScore - candidate.opportunityScore <= qualityWindowPoints,
      )
      .sort((left, right) => {
        const leftMinutes = minutesUntil(analyzedAt, left.resolvedTime);
        const rightMinutes = minutesUntil(analyzedAt, right.resolvedTime);
        if (leftMinutes !== rightMinutes) return leftMinutes - rightMinutes;
        return compareEligible(left, right);
      })[0] ?? null
  );
}

export class RecommendationEngine implements IRecommendationEngine {
  rank(input: RecommendationEngineInput): RecommendationEngineResult {
    const windowHours = input.windowHours ?? DEFAULT_WINDOW_HOURS;
    const qualityWindowPoints = input.qualityWindowPoints ?? DEFAULT_QUALITY_WINDOW_POINTS;

    const normalizedCandidates = input.candidates.map((candidate) =>
      normalizeCandidate(input.analyzedAt, windowHours, candidate),
    );

    const excludedOpportunities = normalizedCandidates.filter((candidate) => !candidate.isEligible);
    const eligibleOpportunities = normalizedCandidates.filter((candidate) => candidate.isEligible);
    const topOpportunities = [...eligibleOpportunities].sort(compareEligible);

    const bestScore = topOpportunities[0]?.opportunityScore ?? null;
    for (const opportunity of topOpportunities) {
      opportunity.scoreDeltaFromBest =
        bestScore === null ? null : Number((bestScore - opportunity.opportunityScore).toFixed(2));
    }

    const primaryOpportunity =
      topOpportunities[0] && topOpportunities[0].opportunityScore >= MIN_PRIMARY_SCORE
        ? topOpportunities[0]
        : null;

    const currentOpportunity = computeCurrentOpportunity(
      input.analyzedAt,
      primaryOpportunity,
      topOpportunities,
      qualityWindowPoints,
    );

    const secondaryOpportunity =
      primaryOpportunity === null ? topOpportunities[0] ?? null : topOpportunities[1] ?? null;

    return {
      analyzedAt: input.analyzedAt,
      windowHours,
      qualityWindowPoints,
      editorialSummary: getEditorialMessage(bestScore ?? 0),
      primaryOpportunity,
      currentOpportunity,
      topOpportunities: topOpportunities.slice(0, 3),
      secondaryOpportunity,
      excludedOpportunities,
    };
  }
}

export const recommendationEngine = new RecommendationEngine();