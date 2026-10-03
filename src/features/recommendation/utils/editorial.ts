import type {
  OpportunityBand,
  RankedOpportunity,
  RecommendationPhotoType,
} from "../types/index.ts";

type ExplanationOpportunity = RankedOpportunity & {
  conditionSummary?: string | null;
  conditionExplanation?: string | null;
};

function compatibilityLabel(score: number): string {
  if (score >= 0.9) return "très bien adapté";
  if (score >= 0.75) return "bien adapté";
  if (score >= 0.5) return "plutôt adapté";
  return "peu adapté";
}

export function getOpportunityBand(score: number): OpportunityBand {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "correct";
  return "none";
}

export function getEditorialMessage(score: number): string {
  if (score >= 80) return "Ça vaut le déplacement.";
  if (score >= 60) return "Une belle opportunité se dessine.";
  if (score >= 40) return "Conditions correctes aujourd'hui.";
  return "Pas de condition exceptionnelle aujourd'hui.";
}

export function getPhotoTypeLabel(photoType: RecommendationPhotoType): string {
  return photoType.name;
}

export function buildOpportunityExplanation(opportunity: ExplanationOpportunity): string {
  const parts = [
    `${getPhotoTypeLabel(opportunity.photoType)} ressort avec un score de conditions de ${opportunity.conditionScore}/100.`,
    `Le type de spot ${opportunity.spot.spotTypeName ?? opportunity.spot.spotTypeSlug} est ${compatibilityLabel(opportunity.compatibilityScore)} pour cette pratique.`,
    `La distance est prise en compte avec un facteur de ${opportunity.distanceFactor.toFixed(2)} : ${opportunity.distanceMessage.toLowerCase()}.`,
  ];

  if (opportunity.conditionSummary) {
    parts.push(`Résumé des conditions : ${opportunity.conditionSummary}.`);
  }

  if (opportunity.conditionExplanation) {
    parts.push(opportunity.conditionExplanation);
  }

  if (opportunity.safetyWarning) {
    parts.push(opportunity.safetyWarning);
  }

  if (!opportunity.isEligible && opportunity.exclusionReason) {
    parts.push(`Non retenue comme recommandation principale : ${opportunity.exclusionReason}.`);
  }

  return parts.join(" ");
}