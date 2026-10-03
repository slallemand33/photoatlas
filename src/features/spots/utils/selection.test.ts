import assert from "node:assert/strict";
import test from "node:test";

import type { SearchResult } from "@/features/search/types/search.types";

import type { NearbySpot } from "../types/spot.types";

import { getRenderableNearbySpots } from "./selection.ts";

function buildPlace(input: { slug: string; name?: string }): SearchResult {
  return {
    id: `spot/${input.slug}`,
    name: input.name ?? input.slug,
    displayName: input.name ?? input.slug,
    type: "spot",
    class: "spot",
    latitude: 44.64,
    longitude: -1.08,
    country: "FR",
    region: "Nouvelle-Aquitaine",
    department: "",
    locality: "",
    importance: 0.8,
  };
}

function buildSpot(index: number): NearbySpot {
  return {
    id: `spot-${index}`,
    name: `Spot ${index}`,
    slug: `spot-${index}`,
    spotType: "harbour",
    latitude: 44.64 + index * 0.001,
    longitude: -1.08 - index * 0.001,
    distanceKm: index + 1,
    countryCode: "FR",
    region: "Nouvelle-Aquitaine",
    locality: null,
    description: null,
    potentials: {
      landscape: null,
      sunrise: null,
      sunset: null,
      astro: null,
    },
  };
}

test("5 km: la carte peut afficher tous les nearbySpots moins le spot courant si présent", () => {
  const place = buildPlace({ slug: "spot-0", name: "Spot 0" });
  const spots = Array.from({ length: 5 }, (_, index) => buildSpot(index));

  const renderable = getRenderableNearbySpots(place, spots);

  assert.equal(renderable.length, 4);
  assert.ok(renderable.every((spot) => spot.slug !== "spot-0"));
});

test("10 km: la carte peut afficher tous les nearbySpots quand le spot courant n'est pas dans la liste", () => {
  const place = buildPlace({ slug: "selected-place", name: "Selected Place" });
  const spots = Array.from({ length: 10 }, (_, index) => buildSpot(index));

  const renderable = getRenderableNearbySpots(place, spots);

  assert.equal(renderable.length, 10);
});

test("25 km: aucun spot secondaire n'est tronqué", () => {
  const place = buildPlace({ slug: "selected-place", name: "Selected Place" });
  const spots = Array.from({ length: 25 }, (_, index) => buildSpot(index));

  const renderable = getRenderableNearbySpots(place, spots);

  assert.equal(renderable.length, 25);
  assert.deepEqual(
    renderable.map((spot) => spot.slug),
    spots.map((spot) => spot.slug),
  );
});

test("50 km: aucun spot secondaire n'est tronqué", () => {
  const place = buildPlace({ slug: "selected-place", name: "Selected Place" });
  const spots = Array.from({ length: 50 }, (_, index) => buildSpot(index));

  const renderable = getRenderableNearbySpots(place, spots);

  assert.equal(renderable.length, 50);
});

test("changement de lieu: le spot courant est recalculé sans laisser de marker fantôme logique", () => {
  const andernos = buildPlace({ slug: "spot-0", name: "Andernos-les-Bains" });
  const arcachon = buildPlace({ slug: "spot-1", name: "Arcachon" });
  const spots = Array.from({ length: 3 }, (_, index) => buildSpot(index));

  const renderableFromAndernos = getRenderableNearbySpots(andernos, spots);
  const renderableFromArcachon = getRenderableNearbySpots(arcachon, spots);

  assert.deepEqual(renderableFromAndernos.map((spot) => spot.slug), ["spot-1", "spot-2"]);
  assert.deepEqual(renderableFromArcachon.map((spot) => spot.slug), ["spot-0", "spot-2"]);
});

test("empty state: 0 nearbySpots produit 0 marker secondaire logique", () => {
  const place = buildPlace({ slug: "selected-place", name: "Selected Place" });

  const renderable = getRenderableNearbySpots(place, []);

  assert.equal(renderable.length, 0);
});
