import assert from "node:assert/strict";
import test from "node:test";

import { RecommendationEngine } from "./RecommendationEngine.ts";

const analyzedAt = "2026-10-01T10:00:00.000Z";

function candidate(input: {
  slug: string;
  conditionScore: number;
  compatibilityScore: number;
  distanceKm: number;
  idealTime: string | null;
  photoType?: "landscape" | "sunrise" | "sunset" | "storm" | "astro";
  photoTypeName?: string;
  spotTypeSlug?: string;
  isEligible?: boolean;
  exclusionReason?: string | null;
  safetyLevel?: "normal" | "caution" | "danger";
  safetyWarning?: string | null;
}) {
  return {
    spot: {
      name: input.slug,
      slug: input.slug,
      spotTypeSlug: input.spotTypeSlug ?? "beach",
      distanceKm: input.distanceKm,
    },
    photoType: {
      slug: input.photoType ?? "landscape",
      name: input.photoTypeName ?? "Paysage",
    },
    timing: {
      start: input.idealTime,
      end: input.idealTime,
      idealTime: input.idealTime,
    },
    conditionScore: input.conditionScore,
    compatibilityScore: input.compatibilityScore,
    isEligible: input.isEligible ?? true,
    exclusionReason: input.exclusionReason ?? null,
    safetyLevel: input.safetyLevel ?? "normal",
    safetyWarning: input.safetyWarning ?? null,
  };
}

test("80 proche / 90 éloigné", () => {
  const engine = new RecommendationEngine();
  const result = engine.rank({
    analyzedAt,
    candidates: [
      candidate({ slug: "near", conditionScore: 80, compatibilityScore: 0.9, distanceKm: 3, idealTime: "2026-10-01T11:00:00.000Z" }),
      candidate({ slug: "far", conditionScore: 90, compatibilityScore: 0.9, distanceKm: 20, idealTime: "2026-10-01T18:00:00.000Z" }),
    ],
  });
  assert.equal(result.primaryOpportunity?.spot.slug, "far");
});

test("90 compatibilité 1.00 / 95 compatibilité 0.70", () => {
  const engine = new RecommendationEngine();
  const result = engine.rank({
    analyzedAt,
    candidates: [
      candidate({ slug: "a", conditionScore: 90, compatibilityScore: 1, distanceKm: 10, idealTime: "2026-10-01T12:00:00.000Z" }),
      candidate({ slug: "b", conditionScore: 95, compatibilityScore: 0.7, distanceKm: 10, idealTime: "2026-10-01T12:05:00.000Z" }),
    ],
  });
  assert.equal(result.primaryOpportunity?.spot.slug, "a");
});

test("82 proche / 94 à 40 km", () => {
  const engine = new RecommendationEngine();
  const result = engine.rank({
    analyzedAt,
    candidates: [
      candidate({ slug: "close", conditionScore: 82, compatibilityScore: 0.9, distanceKm: 3, idealTime: "2026-10-01T12:00:00.000Z" }),
      candidate({ slug: "far", conditionScore: 94, compatibilityScore: 1, distanceKm: 40, idealTime: "2026-10-01T17:00:00.000Z" }),
    ],
  });
  assert.equal(result.primaryOpportunity?.spot.slug, "far");
});

test("condition 30 / compatibilité 1.00 / 2 km", () => {
  const engine = new RecommendationEngine();
  const result = engine.rank({
    analyzedAt,
    candidates: [candidate({ slug: "low", conditionScore: 30, compatibilityScore: 1, distanceKm: 2, idealTime: "2026-10-01T11:00:00.000Z" })],
  });
  assert.equal(result.primaryOpportunity, null);
  assert.equal(result.topOpportunities[0]?.opportunityScore, 30);
});

test("maintenant 72 / ce soir 80", () => {
  const engine = new RecommendationEngine();
  const result = engine.rank({
    analyzedAt,
    candidates: [
      candidate({ slug: "now", conditionScore: 72, compatibilityScore: 1, distanceKm: 3, idealTime: "2026-10-01T10:30:00.000Z" }),
      candidate({ slug: "later", conditionScore: 80, compatibilityScore: 1, distanceKm: 3, idealTime: "2026-10-01T19:00:00.000Z" }),
    ],
  });
  assert.equal(result.primaryOpportunity?.spot.slug, "later");
  assert.equal(result.currentOpportunity?.spot.slug, "now");
});

test("ce soir 82 / demain matin 90", () => {
  const engine = new RecommendationEngine();
  const result = engine.rank({
    analyzedAt,
    candidates: [
      candidate({ slug: "tonight", conditionScore: 82, compatibilityScore: 0.95, distanceKm: 5, idealTime: "2026-10-01T18:30:00.000Z" }),
      candidate({ slug: "tomorrow", conditionScore: 90, compatibilityScore: 0.9, distanceKm: 5, idealTime: "2026-10-02T06:30:00.000Z" }),
    ],
  });
  assert.equal(result.primaryOpportunity?.spot.slug, "tomorrow");
  assert.equal(result.currentOpportunity?.spot.slug, "tonight");
});

test("fenêtre temporelle stricte 24h", () => {
  const engine = new RecommendationEngine();
  const result = engine.rank({
    analyzedAt: "2026-10-01T19:15:00.000Z",
    candidates: [
      candidate({
        slug: "past",
        conditionScore: 85,
        compatibilityScore: 1,
        distanceKm: 5,
        idealTime: "2026-10-01T17:45:00.000Z",
      }),
      candidate({
        slug: "within",
        conditionScore: 84,
        compatibilityScore: 1,
        distanceKm: 5,
        idealTime: "2026-10-01T20:00:00.000Z",
      }),
      candidate({
        slug: "boundary",
        conditionScore: 83,
        compatibilityScore: 1,
        distanceKm: 5,
        idealTime: "2026-10-02T19:15:00.000Z",
      }),
      candidate({
        slug: "outside",
        conditionScore: 82,
        compatibilityScore: 1,
        distanceKm: 5,
        idealTime: "2026-10-02T19:16:00.000Z",
      }),
    ],
  });

  assert.deepEqual(
    result.topOpportunities.map((item) => item.spot.slug),
    ["within", "boundary"],
  );
  assert.ok(result.excludedOpportunities.some((item) => item.spot.slug === "past"));
  assert.ok(result.excludedOpportunities.some((item) => item.spot.slug === "outside"));
  assert.equal(
    result.excludedOpportunities.find((item) => item.spot.slug === "past")?.exclusionReason,
    "Moment photographique déjà passé.",
  );
  assert.equal(
    result.excludedOpportunities.find((item) => item.spot.slug === "outside")?.exclusionReason,
    "Hors fenêtre de 24 heures.",
  );
});

test("astro incompatible", () => {
  const engine = new RecommendationEngine();
  const result = engine.rank({
    analyzedAt,
    candidates: [
      candidate({
        slug: "astro",
        conditionScore: 85,
        compatibilityScore: 0.9,
        distanceKm: 10,
        idealTime: "2026-10-01T22:00:00.000Z",
        photoType: "astro",
        photoTypeName: "Astro",
        isEligible: false,
        exclusionReason: "Ciel totalement couvert pour une opportunité astro.",
      }),
    ],
  });
  assert.equal(result.primaryOpportunity, null);
  assert.equal(result.excludedOpportunities.length, 1);
});

test("orages activité incertaine", () => {
  const engine = new RecommendationEngine();
  const result = engine.rank({
    analyzedAt,
    candidates: [
      candidate({
        slug: "storm",
        conditionScore: 85,
        compatibilityScore: 0.9,
        distanceKm: 12,
        idealTime: "2026-10-01T16:00:00.000Z",
        photoType: "storm",
        photoTypeName: "Orages",
      }),
    ],
  });
  assert.equal(result.primaryOpportunity?.spot.slug, "storm");
});

test("journée moyenne", () => {
  const engine = new RecommendationEngine();
  const result = engine.rank({
    analyzedAt,
    candidates: [
      candidate({ slug: "landscape", conditionScore: 55, compatibilityScore: 0.9, distanceKm: 3, idealTime: "2026-10-01T11:00:00.000Z" }),
      candidate({ slug: "sunset", conditionScore: 58, compatibilityScore: 0.95, distanceKm: 3, idealTime: "2026-10-01T19:00:00.000Z", photoType: "sunset", photoTypeName: "Coucher de soleil" }),
    ],
  });
  assert.equal(result.primaryOpportunity, null);
  assert.equal(result.editorialSummary, "Conditions correctes aujourd'hui.");
});

test("aucune opportunité éligible", () => {
  const engine = new RecommendationEngine();
  const result = engine.rank({
    analyzedAt,
    candidates: [candidate({ slug: "none", conditionScore: 80, compatibilityScore: 1, distanceKm: 5, idealTime: "2026-10-01T12:00:00.000Z", isEligible: false, exclusionReason: "Exclue" })],
  });
  assert.equal(result.primaryOpportunity, null);
  assert.equal(result.topOpportunities.length, 0);
});

test("écart exactement 10 points", () => {
  const engine = new RecommendationEngine();
  const result = engine.rank({
    analyzedAt,
    candidates: [
      candidate({ slug: "best", conditionScore: 80, compatibilityScore: 1, distanceKm: 3, idealTime: "2026-10-01T20:00:00.000Z" }),
      candidate({ slug: "current", conditionScore: 70, compatibilityScore: 1, distanceKm: 3, idealTime: "2026-10-01T10:15:00.000Z" }),
    ],
  });
  assert.equal(result.currentOpportunity?.spot.slug, "current");
});

test("écart de 11 points", () => {
  const engine = new RecommendationEngine();
  const result = engine.rank({
    analyzedAt,
    candidates: [
      candidate({ slug: "best", conditionScore: 81, compatibilityScore: 1, distanceKm: 3, idealTime: "2026-10-01T20:00:00.000Z" }),
      candidate({ slug: "current", conditionScore: 70, compatibilityScore: 1, distanceKm: 3, idealTime: "2026-10-01T10:15:00.000Z" }),
    ],
  });
  assert.equal(result.currentOpportunity, null);
});

test("top 3 avec 1, 2, 3 et plus de 3 résultats", () => {
  const engine = new RecommendationEngine();
  const one = engine.rank({ analyzedAt, candidates: [candidate({ slug: "one", conditionScore: 80, compatibilityScore: 1, distanceKm: 3, idealTime: "2026-10-01T12:00:00.000Z" })] });
  const two = engine.rank({ analyzedAt, candidates: [candidate({ slug: "one", conditionScore: 80, compatibilityScore: 1, distanceKm: 3, idealTime: "2026-10-01T12:00:00.000Z" }), candidate({ slug: "two", conditionScore: 79, compatibilityScore: 1, distanceKm: 3, idealTime: "2026-10-01T13:00:00.000Z" })] });
  const four = engine.rank({ analyzedAt, candidates: [
    candidate({ slug: "one", conditionScore: 90, compatibilityScore: 1, distanceKm: 3, idealTime: "2026-10-01T12:00:00.000Z" }),
    candidate({ slug: "two", conditionScore: 89, compatibilityScore: 1, distanceKm: 3, idealTime: "2026-10-01T13:00:00.000Z" }),
    candidate({ slug: "three", conditionScore: 88, compatibilityScore: 1, distanceKm: 3, idealTime: "2026-10-01T14:00:00.000Z" }),
    candidate({ slug: "four", conditionScore: 87, compatibilityScore: 1, distanceKm: 3, idealTime: "2026-10-01T15:00:00.000Z" }),
  ] });
  assert.equal(one.topOpportunities.length, 1);
  assert.equal(two.topOpportunities.length, 2);
  assert.equal(four.topOpportunities.length, 3);
});

test("distance 5, 15, 25, 40, 50 km", () => {
  const engine = new RecommendationEngine();
  const result = engine.rank({
    analyzedAt,
    candidates: [5, 15, 25, 40, 50].map((distanceKm, index) =>
      candidate({
        slug: `spot-${index}`,
        conditionScore: 80,
        compatibilityScore: 1,
        distanceKm,
        idealTime: `2026-10-01T1${index}:00:00.000Z`,
      }),
    ),
  });
  assert.deepEqual(result.topOpportunities.map((item) => item.distanceFactor), [1, 0.95, 0.88]);
});

test("score 0 et score 100", () => {
  const engine = new RecommendationEngine();
  const result = engine.rank({
    analyzedAt,
    candidates: [
      candidate({ slug: "zero", conditionScore: 0, compatibilityScore: 1, distanceKm: 3, idealTime: "2026-10-01T11:00:00.000Z" }),
      candidate({ slug: "max", conditionScore: 100, compatibilityScore: 1, distanceKm: 3, idealTime: "2026-10-01T12:00:00.000Z" }),
    ],
  });
  const zero = [...result.topOpportunities, ...(result.secondaryOpportunity ? [result.secondaryOpportunity] : [])].find((entry) => entry.spot.slug === "zero");
  assert.equal(result.primaryOpportunity?.opportunityScore, 100);
  assert.equal(zero?.opportunityScore, 0);
});