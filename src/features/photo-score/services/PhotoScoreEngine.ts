import type {
  IPhotoScoreEngine,
  PhotoRecommendation,
  PhotoRecommendationKind,
  PhotoScoreInput,
  PhotoScoreResult,
} from "../types";
import {
  buildPhotoTimeline,
  clampScore,
  idealRangeScore,
  scoreSummary,
  scoreToStars,
  subtractMinutes,
} from "../utils";

const TITLES: Record<PhotoRecommendationKind, string> = {
  astro: "Astro",
  sunrise: "Lever de soleil",
  sunset: "Coucher de soleil",
  landscape: "Paysage",
  storms: "Orages",
};

function nextTime(now: string, candidates: Array<string | null>): string | null {
  const nowMs = new Date(now).getTime();
  return (
    candidates
      .filter((value): value is string => Boolean(value))
      .sort((a, b) => {
        const aTime = new Date(a).getTime();
        const bTime = new Date(b).getTime();
        const aFuture = aTime >= nowMs;
        const bFuture = bTime >= nowMs;
        if (aFuture !== bFuture) return aFuture ? -1 : 1;
        return Math.abs(aTime - nowMs) - Math.abs(bTime - nowMs);
      })[0] ?? null
  );
}

function recommendation(
  kind: PhotoRecommendationKind,
  score: number,
  explanation: string,
  strengths: string[],
  cautions: string[],
  recommendedTime: string | null,
  departureMinutes: number,
  confidence: PhotoRecommendation["confidence"],
): PhotoRecommendation {
  const normalizedScore = clampScore(score);
  return {
    kind,
    title: TITLES[kind],
    score: normalizedScore,
    stars: scoreToStars(normalizedScore),
    summary: scoreSummary(normalizedScore),
    explanation,
    strengths,
    cautions,
    recommendedTime,
    departureTime: subtractMinutes(recommendedTime, departureMinutes),
    confidence,
  };
}

function calculateAstro(input: PhotoScoreInput): PhotoRecommendation {
  const { astronomy, weather, lightPollution, radar } = input;
  const cloudScore = 100 - weather.total;
  const darknessScore = lightPollution ? 100 - lightPollution.lightLevel : 55;
  const moonScore = 100 - astronomy.moon.illuminatedFraction;
  const radarPenalty = radar && radar.intensity !== "none" ? 12 : 0;
  const score = cloudScore * 0.42 + darknessScore * 0.38 + moonScore * 0.2 - radarPenalty;
  const strengths: string[] = [];
  const cautions: string[] = [];

  if (weather.total <= 25) strengths.push("Peu de nuages");
  else cautions.push(`${weather.total}% de couverture nuageuse`);
  if (lightPollution && lightPollution.bortleIndex <= 4)
    strengths.push("Pollution lumineuse faible");
  else if (lightPollution) cautions.push(`Ciel Bortle ${lightPollution.bortleIndex}`);
  else cautions.push("Pollution lumineuse en cours d’analyse");
  if (astronomy.moon.illuminatedFraction <= 25) strengths.push("Lune peu lumineuse");
  else cautions.push(`Lune illuminée à ${astronomy.moon.illuminatedFraction}%`);
  if (astronomy.milkyWay.core.transit) strengths.push("Passage du noyau galactique calculé");

  const recommendedTime = nextTime(input.calculatedAt, [
    astronomy.milkyWay.core.transit,
    astronomy.sun.astronomicalNight.start,
  ]);
  return recommendation(
    "astro",
    score,
    "Le score privilégie un ciel dégagé et sombre, avec une Lune peu gênante.",
    strengths,
    cautions,
    recommendedTime,
    60,
    lightPollution ? "complète" : "bonne",
  );
}

function calculateSunEvent(
  input: PhotoScoreInput,
  kind: "sunrise" | "sunset",
): PhotoRecommendation {
  const { weather, astronomy, radar } = input;
  const cloudTexture = idealRangeScore(weather.total, 42, 48);
  const highCloudBonus = weather.high >= 20 && weather.high <= 70 ? 8 : 0;
  const rainPenalty = Math.min(35, weather.precipitationMm * 24);
  const windPenalty = Math.max(0, weather.windSpeedKmh - 25) * 0.7;
  const visibilityScore = Math.min(100, (weather.visibilityMeters / 20_000) * 100);
  const radarPenalty = radar && radar.intensity !== "none" ? 8 : 0;
  const score =
    cloudTexture * 0.48 +
    visibilityScore * 0.28 +
    24 +
    highCloudBonus -
    rainPenalty -
    windPenalty -
    radarPenalty;
  const strengths: string[] = [];
  const cautions: string[] = [];

  if (weather.total >= 20 && weather.total <= 65) strengths.push("Nuages propices aux couleurs");
  else if (weather.total < 20)
    cautions.push("Ciel très dégagé, couleurs potentiellement discrètes");
  else cautions.push("Couverture nuageuse importante");
  if (weather.high >= 20 && weather.high <= 70) strengths.push("Nuages hauts intéressants");
  if (weather.visibilityMeters >= 10_000) strengths.push("Bonne visibilité");
  else cautions.push("Visibilité réduite");
  if (weather.weatherCode === 45 || weather.weatherCode === 48) {
    cautions.push("Brouillard signalé");
  }
  if (weather.precipitationMm > 0.2) cautions.push("Précipitations en cours");
  if (weather.windSpeedKmh > 30) cautions.push("Vent soutenu");

  const recommendedTime = kind === "sunrise" ? astronomy.sun.rise : astronomy.sun.set;
  return recommendation(
    kind,
    score,
    "Un peu de nuages hauts peut renforcer les couleurs, à condition que pluie et vent restent limités.",
    strengths,
    cautions,
    recommendedTime,
    45,
    "complète",
  );
}

function calculateLandscape(input: PhotoScoreInput): PhotoRecommendation {
  const { weather, astronomy, radar } = input;
  const visibilityScore = Math.min(100, (weather.visibilityMeters / 20_000) * 100);
  const cloudScore = idealRangeScore(weather.total, 32, 68);
  const rainPenalty = Math.min(45, weather.precipitationMm * 28);
  const windPenalty = Math.max(0, weather.windSpeedKmh - 18) * 1.15;
  const radarPenalty = radar && radar.intensity !== "none" ? 10 : 0;
  const score =
    visibilityScore * 0.42 + cloudScore * 0.3 + 28 - rainPenalty - windPenalty - radarPenalty;
  const strengths: string[] = [];
  const cautions: string[] = [];

  if (weather.visibilityMeters >= 15_000) strengths.push("Visibilité lointaine");
  else cautions.push(`Visibilité d’environ ${Math.round(weather.visibilityMeters / 1000)} km`);
  if (weather.total >= 15 && weather.total <= 60) strengths.push("Ciel texturé");
  if (weather.precipitationMm === 0) strengths.push("Pas de pluie mesurée");
  else cautions.push("Risque de pluie");
  if (weather.windSpeedKmh <= 20) strengths.push("Vent limité");
  else cautions.push(`Vent à ${Math.round(weather.windSpeedKmh)} km/h`);

  const recommendedTime = nextTime(input.calculatedAt, [
    astronomy.sun.goldenHour.morning.start,
    astronomy.sun.goldenHour.evening.start,
  ]);
  return recommendation(
    "landscape",
    score,
    "La visibilité, un ciel texturé et des conditions sèches favorisent les paysages détaillés.",
    strengths,
    cautions,
    recommendedTime,
    35,
    "complète",
  );
}

function calculateStorms(input: PhotoScoreInput): PhotoRecommendation {
  const { weather, lightning, radar } = input;
  const lightningBase = { none: 8, low: 42, moderate: 72, high: 94 }[lightning?.level ?? "none"];
  const rainSignal = radar?.signal ?? Math.min(100, weather.precipitationMm * 45);
  const convectiveHint = weather.total * 0.16 + Math.min(20, rainSignal * 0.2);
  const score = lightningBase * 0.72 + convectiveHint;
  const strengths: string[] = [];
  const cautions: string[] = [];

  if (lightning && lightning.level !== "none") {
    strengths.push(`${lightning.nearbyStrikeCount} impact(s) détecté(s) à proximité`);
  } else {
    cautions.push("Aucun impact proche détecté");
  }
  if (radar && radar.intensity !== "none") strengths.push(radar.label);
  else if (weather.precipitationMm > 0.2) strengths.push("Précipitations mesurées");
  else cautions.push("Pas de signal pluvieux significatif");
  if (!lightning) cautions.push("Couche Orages inactive : confiance limitée");
  cautions.push("Toujours respecter les alertes officielles et rester à couvert");

  return recommendation(
    "storms",
    score,
    lightning?.level === "high"
      ? "Activité électrique marquée : intérêt photographique élevé, avec prudence maximale."
      : "Le score combine les impacts disponibles, la pluie et la couverture nuageuse.",
    strengths,
    cautions,
    input.calculatedAt,
    0,
    lightning ? "bonne" : "partielle",
  );
}

export class PhotoScoreEngine implements IPhotoScoreEngine {
  calculate(input: PhotoScoreInput): PhotoScoreResult {
    const recommendations = [
      calculateAstro(input),
      calculateSunEvent(input, "sunrise"),
      calculateSunEvent(input, "sunset"),
      calculateLandscape(input),
      calculateStorms(input),
    ];
    const rankedRecommendations = [...recommendations].sort((a, b) => b.score - a.score);

    return {
      calculatedAt: input.calculatedAt,
      recommendations,
      rankedRecommendations,
      timeline: buildPhotoTimeline(input.astronomy, recommendations),
      bestRecommendation: rankedRecommendations[0]!,
    };
  }
}

export const photoScoreEngine = new PhotoScoreEngine();
