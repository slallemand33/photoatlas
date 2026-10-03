import assert from "node:assert/strict";
import test from "node:test";

import { RecommendationAssemblyService } from "./RecommendationAssemblyService.ts";

const mockRepository = {
  async getSpotTypeReferences() {
    return [
      {
        id: "type-dune",
        slug: "dune",
        name: "Dune",
        parentSlug: "littoral",
        parentName: "Littoral",
        compatibilities: { landscape: 1, sunrise: 0.95, sunset: 1, storm: 0.85, astro: 0.7 },
      },
      {
        id: "type-observatory",
        slug: "observatory",
        name: "Observatoire",
        parentSlug: "observation",
        parentName: "Observation",
        compatibilities: { landscape: 0.7, sunrise: 0.65, sunset: 0.65, storm: 0.5, astro: 0.9 },
      },
      {
        id: "type-harbour",
        slug: "harbour",
        name: "Port",
        parentSlug: "maritime",
        parentName: "Maritime",
        compatibilities: { landscape: 0.75, sunrise: 0.7, sunset: 0.8, storm: 0.7, astro: 0.3 },
      },
    ];
  },
};

function createEvaluation(spot: {
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  spotTypeSlug?: string;
  spotTypeId?: string | null;
}) {
  return {
    spot,
    recommendations: [
      {
        kind: "sunset" as const,
        score: 84,
        summary: "Très bonnes conditions",
        explanation: "Conditions favorables",
        recommendedTime: "2026-10-01T18:45:00.000Z",
        departureTime: "2026-10-01T18:00:00.000Z",
      },
      {
        kind: "astro" as const,
        score: 66,
        summary: "Conditions correctes",
        explanation: "Lecture astro disponible",
        recommendedTime: "2026-10-01T22:30:00.000Z",
        departureTime: "2026-10-01T21:30:00.000Z",
      },
    ],
    astronomy: {
      sun: {
        rise: "2026-10-02T06:00:00.000Z",
        set: "2026-10-01T18:40:00.000Z",
        goldenHour: {
          morning: { start: "2026-10-02T05:10:00.000Z", end: "2026-10-02T06:30:00.000Z" },
          evening: { start: "2026-10-01T17:30:00.000Z", end: "2026-10-01T18:40:00.000Z" },
        },
        blueHour: {
          morning: { start: "2026-10-02T04:40:00.000Z", end: "2026-10-02T05:10:00.000Z" },
          evening: { start: "2026-10-01T18:40:00.000Z", end: "2026-10-01T19:10:00.000Z" },
        },
        astronomicalNight: { start: "2026-10-01T20:30:00.000Z", end: "2026-10-02T04:50:00.000Z" },
      },
      milkyWay: {
        core: { transit: "2026-10-01T23:30:00.000Z" },
      },
    },
    weather: { total: 45 },
    lightning: { level: "none" as const, nearbyStrikeCount: 0 },
  };
}

const evaluations = [
  createEvaluation({
    name: "Dune du Pilat",
    slug: "dune-du-pilat",
    latitude: 44.5889775,
    longitude: -1.2142045,
    distanceKm: 12.5,
    spotTypeSlug: "dune",
  }),
  createEvaluation({
    name: "Observatoire Sainte-Cécile",
    slug: "observatoire-sainte-cecile",
    latitude: 44.6593442,
    longitude: -1.1753685,
    distanceKm: 8.6,
    spotTypeSlug: "observatory",
  }),
  createEvaluation({
    name: "Port de Larros",
    slug: "port-de-larros",
    latitude: 44.6438004,
    longitude: -1.0718774,
    distanceKm: 0.9,
    spotTypeSlug: "harbour",
  }),
];

test("Dune + sunset = 1.00, Observatoire + astro = 0.90, Port + astro = 0.30", async () => {
  const service = new RecommendationAssemblyService(mockRepository);
  const result = await service.assembleSpotEvaluations(evaluations);
  const duneSunset = result.candidates.find((candidate) => candidate.spot.slug === "dune-du-pilat" && candidate.photoType.slug === "sunset");
  const observatoryAstro = result.candidates.find((candidate) => candidate.spot.slug === "observatoire-sainte-cecile" && candidate.photoType.slug === "astro");
  const harbourAstro = result.candidates.find((candidate) => candidate.spot.slug === "port-de-larros" && candidate.photoType.slug === "astro");
  assert.equal(duneSunset?.compatibilityScore, 1);
  assert.equal(observatoryAstro?.compatibilityScore, 0.9);
  assert.equal(harbourAstro?.compatibilityScore, 0.3);
});

test("sans donnée fiable d'exclusion astro, l'opportunité reste éligible", async () => {
  const service = new RecommendationAssemblyService(mockRepository);
  const result = await service.assembleSpotEvaluations(
    evaluations.map((evaluation) => ({
      ...evaluation,
      weather: { total: 100 },
    })),
  );
  const astroCandidates = result.candidates.filter((candidate) => candidate.photoType.slug === "astro");
  assert.ok(astroCandidates.every((candidate) => candidate.isEligible === true));
});

test("orages activité forte -> safetyWarning transmis sans exclure", async () => {
  const service = new RecommendationAssemblyService(mockRepository);
  const result = await service.assembleSpotEvaluations(
    evaluations.map((evaluation) => ({
      ...evaluation,
      recommendations: [
        ...evaluation.recommendations,
        {
          kind: "storms" as const,
          score: 85,
          summary: "Orages possibles",
          explanation: "Activité à surveiller",
          recommendedTime: "2026-10-01T16:00:00.000Z",
          departureTime: null,
        },
      ],
      lightning: { level: "high" as const, nearbyStrikeCount: 4 },
    })),
  );
  const stormCandidates = result.candidates.filter((candidate) => candidate.photoType.slug === "storm");
  assert.ok(stormCandidates.every((candidate) => candidate.isEligible === true));
  assert.ok(stormCandidates.every((candidate) => candidate.safetyWarning === "Conditions orageuses fortes : prudence"));
});

test("spot sans type -> missingData et aucun candidat", async () => {
  const service = new RecommendationAssemblyService(mockRepository);
  const result = await service.assembleSpotEvaluations([
    createEvaluation({
      name: "Sans type",
      slug: "sans-type",
      latitude: 44.6,
      longitude: -1.1,
      distanceKm: 5,
    }),
  ]);
  assert.equal(result.candidates.length, 0);
  assert.ok(result.missingData.some((entry) => entry.includes("sans-type")));
});

test("type sans compatibilité -> missingData", async () => {
  const service = new RecommendationAssemblyService({
    async getSpotTypeReferences() {
      return [
        {
          id: "type-incomplete",
          slug: "dune",
          name: "Dune",
          parentSlug: "littoral",
          parentName: "Littoral",
          compatibilities: { landscape: 1 },
        },
      ];
    },
  });
  const result = await service.assembleSpotEvaluations([
    createEvaluation({
      name: "Dune du Pilat",
      slug: "dune-du-pilat",
      latitude: 44.5889775,
      longitude: -1.2142045,
      distanceKm: 12.5,
      spotTypeSlug: "dune",
    }),
  ]);
  assert.ok(result.missingData.some((entry) => entry.includes("Compatibilité manquante")));
});