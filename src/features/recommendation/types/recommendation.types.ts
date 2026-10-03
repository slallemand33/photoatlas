export type RecommendationPhotoTypeSlug =
  | "landscape"
  | "sunrise"
  | "sunset"
  | "storm"
  | "astro";

export type RecommendationSourcePhotoKind =
  | RecommendationPhotoTypeSlug
  | "storms";

export type RecommendationSafetyLevel = "normal" | "caution" | "danger";

export type OpportunityBand =
  | "none"
  | "correct"
  | "good"
  | "excellent";

export interface RecommendationSpotInput {
  id?: string;
  name: string;
  slug: string;
  latitude?: number;
  longitude?: number;
  spotTypeId?: string | null;
  spotTypeSlug: string;
  spotTypeName?: string | null;
  parentTypeSlug?: string | null;
  parentTypeName?: string | null;
  distanceKm: number;
}

export interface RecommendationSpotCandidate {
  id?: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  spotTypeId?: string | null;
  spotTypeSlug?: string | null;
}

export interface RecommendationPhotoType {
  slug: RecommendationPhotoTypeSlug;
  name: string;
}

export interface RecommendationTiming {
  start: string | null;
  end: string | null;
  idealTime: string | null;
}

export interface RecommendationReferenceEntry {
  id: string;
  slug: string;
  name: string;
  parentSlug: string | null;
  parentName: string | null;
  compatibilities: Partial<Record<RecommendationPhotoTypeSlug, number>>;
}

export interface OpportunityCandidateInput {
  spot: RecommendationSpotInput;
  photoType: RecommendationPhotoType;
  timing: RecommendationTiming;
  conditionScore: number;
  compatibilityScore: number;
  isEligible?: boolean;
  exclusionReason?: string | null;
  safetyLevel?: RecommendationSafetyLevel;
  safetyWarning?: string | null;
  conditionSummary?: string | null;
  conditionExplanation?: string | null;
}

export interface RecommendationAssemblyInput {
  analyzedAt: string;
  spots: RecommendationSpotCandidate[];
  recommendations: Array<{
    kind: RecommendationSourcePhotoKind;
    score: number;
    summary: string;
    explanation: string;
    recommendedTime: string | null;
    departureTime: string | null;
  }>;
  astronomy: {
    sun: {
      rise: string | null;
      set: string | null;
      goldenHour: {
        morning: { start: string | null; end: string | null };
        evening: { start: string | null; end: string | null };
      };
      blueHour: {
        morning: { start: string | null; end: string | null };
        evening: { start: string | null; end: string | null };
      };
      astronomicalNight: { start: string | null; end: string | null };
    };
    milkyWay: {
      core: {
        transit: string | null;
      };
    };
  };
  weather: {
    total: number;
  };
  lightning?: {
    level: "none" | "low" | "moderate" | "high";
    nearbyStrikeCount: number;
  };
}

export interface RecommendationAssemblyResult {
  candidates: OpportunityCandidateInput[];
  missingData: string[];
}

export interface RecommendationSpotEvaluationInput {
  spot: RecommendationSpotCandidate;
  recommendations: Array<{
    kind: RecommendationSourcePhotoKind;
    score: number;
    summary: string;
    explanation: string;
    recommendedTime: string | null;
    departureTime: string | null;
  }>;
  astronomy: RecommendationAssemblyInput["astronomy"];
  weather: RecommendationAssemblyInput["weather"];
  lightning?: RecommendationAssemblyInput["lightning"];
}

export interface RecommendationCandidateSpotsInput {
  latitude: number;
  longitude: number;
  radiusKm: number;
  limit?: number;
}

export interface RecommendationCandidateSpotsRepository {
  getCandidateSpots(input: RecommendationCandidateSpotsInput): Promise<RecommendationSpotCandidate[]>;
}

export interface RecommendationRuntimeInput {
  latitude: number;
  longitude: number;
  radiusKm: number;
  limit?: number;
  analyzedAt?: Date;
}

export interface RecommendationRuntimeResult {
  candidates: OpportunityCandidateInput[];
  missingData: string[];
  recommendation: RecommendationEngineResult;
}

export interface RecommendationReferenceRepository {
  getSpotTypeReferences(input: {
    spotTypeIds: string[];
    spotTypeSlugs: string[];
  }): Promise<RecommendationReferenceEntry[]>;
}

export interface RecommendationEngineInput {
  analyzedAt: string;
  windowHours?: number;
  qualityWindowPoints?: number;
  candidates: OpportunityCandidateInput[];
}

export interface RankedOpportunity {
  spot: RecommendationSpotInput;
  photoType: RecommendationPhotoType;
  timing: RecommendationTiming;
  conditionScore: number;
  compatibilityScore: number;
  distanceFactor: number;
  opportunityScore: number;
  editorialMessage: string;
  distanceMessage: string;
  explanation: string;
  safetyWarning: string | null;
  safetyLevel: RecommendationSafetyLevel;
  isEligible: boolean;
  exclusionReason: string | null;
  isWithinWindow: boolean;
  resolvedTime: string | null;
  scoreDeltaFromBest: number | null;
}

export interface RecommendationEngineResult {
  analyzedAt: string;
  windowHours: number;
  qualityWindowPoints: number;
  editorialSummary: string;
  primaryOpportunity: RankedOpportunity | null;
  currentOpportunity: RankedOpportunity | null;
  topOpportunities: RankedOpportunity[];
  secondaryOpportunity: RankedOpportunity | null;
  excludedOpportunities: RankedOpportunity[];
}

export interface IRecommendationEngine {
  rank(input: RecommendationEngineInput): RecommendationEngineResult;
}