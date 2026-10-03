import assert from "node:assert/strict";
import test from "node:test";

import { RecommendationRuntimeService } from "./RecommendationRuntimeService.ts";

test("chaînage runtime spots -> type -> compatibilité -> score -> moteur", async () => {
  const service = new RecommendationRuntimeService({
    spotsRepository: {
      async getCandidateSpots() {
        return [
          {
            id: "spot-1",
            name: "Dune du Pilat",
            slug: "dune-du-pilat",
            latitude: 44.5889775,
            longitude: -1.2142045,
            distanceKm: 12.5,
            spotTypeId: "type-dune",
            spotTypeSlug: "dune",
          },
        ];
      },
    },
    referenceRepository: {
      async getSpotTypeReferences() {
        return [
          {
            id: "type-dune",
            slug: "dune",
            name: "Dune",
            parentSlug: "littoral",
            parentName: "Littoral",
            compatibilities: {
              landscape: 1,
              sunrise: 0.95,
              sunset: 1,
              storm: 0.85,
              astro: 0.7,
            },
          },
        ];
      },
    },
    dependencies: {
      async getPhotoConditions() {
        return [
          {
            latitude: 44.5889775,
            longitude: -1.2142045,
            observedAt: "2026-10-01T10:00:00.000Z",
            total: 32,
            low: 10,
            mid: 15,
            high: 20,
            precipitationMm: 0,
            rainMm: 0,
            windSpeedKmh: 12,
            visibilityMeters: 18000,
            weatherCode: 1,
          },
        ];
      },
      calculateAstronomy() {
        return {
          calculatedAt: "2026-10-01T10:00:00.000Z",
          location: { latitude: 44.5889775, longitude: -1.2142045, elevationMeters: 0 },
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
            twilight: {
              civil: { morning: { start: null, end: null }, evening: { start: null, end: null } },
              nautical: { morning: { start: null, end: null }, evening: { start: null, end: null } },
              astronomical: { morning: { start: null, end: null }, evening: { start: null, end: null } },
            },
            astronomicalNight: { start: "2026-10-01T20:30:00.000Z", end: "2026-10-02T04:50:00.000Z" },
          },
          moon: {
            rise: null,
            set: null,
            phaseAngle: 0,
            illuminatedFraction: 10,
            phaseName: "Premier croissant",
          },
          milkyWay: {
            visible: true,
            core: {
              position: { azimuth: 180, altitude: 20, cardinalDirection: "S", aboveHorizon: true },
              rise: null,
              set: null,
              transit: "2026-10-01T23:30:00.000Z",
              transitAltitude: 30,
            },
            antiCenter: { azimuth: 0, altitude: 10, cardinalDirection: "N", aboveHorizon: true },
          },
        };
      },
      calculatePhotoScore() {
        return {
          calculatedAt: "2026-10-01T10:00:00.000Z",
          recommendations: [
            {
              kind: "sunset",
              title: "Coucher de soleil",
              score: 84,
              stars: 4,
              summary: "Très bonnes conditions",
              explanation: "Conditions favorables",
              strengths: [],
              cautions: [],
              recommendedTime: "2026-10-01T18:45:00.000Z",
              departureTime: "2026-10-01T18:00:00.000Z",
              confidence: "complète",
            },
          ],
          rankedRecommendations: [],
          timeline: [],
          bestRecommendation: {
            kind: "sunset",
            title: "Coucher de soleil",
            score: 84,
            stars: 4,
            summary: "Très bonnes conditions",
            explanation: "Conditions favorables",
            strengths: [],
            cautions: [],
            recommendedTime: "2026-10-01T18:45:00.000Z",
            departureTime: "2026-10-01T18:00:00.000Z",
            confidence: "complète",
          },
        };
      },
    },
  });

  const result = await service.prepare({
    latitude: 44.6360982,
    longitude: -1.0714014,
    radiusKm: 25,
    analyzedAt: new Date("2026-10-01T10:00:00.000Z"),
  });

  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0]?.spot.spotTypeId, "type-dune");
  assert.equal(result.candidates[0]?.compatibilityScore, 1);
  assert.equal(result.recommendation.primaryOpportunity?.spot.slug, "dune-du-pilat");
  assert.equal(result.recommendation.primaryOpportunity?.photoType.slug, "sunset");
  assert.ok(
    result.missingData.some((entry) =>
      entry.includes("Règle d'exclusion astro non finalisable"),
    ),
  );
});