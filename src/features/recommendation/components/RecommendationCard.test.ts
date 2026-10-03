import assert from "node:assert/strict";
import test from "node:test";

import React from "react";
import TestRenderer, { act } from "react-test-renderer";

import type { RecommendationEngineResult } from "../types";

import { RecommendationCardView } from "./RecommendationCardView.tsx";

type RecommendationCardTestRenderer = {
  root: {
    findAllByType: (type: string) => Array<{
      props: {
        children: unknown;
        onClick?: () => void;
      };
    }>;
    findAllByProps: (props: Record<string, unknown>) => Array<unknown>;
    findByProps: (props: Record<string, unknown>) => Array<unknown>;
  };
};

function buildResult(input?: {
  currentOpportunity?: RecommendationEngineResult["currentOpportunity"];
  primaryOpportunity?: RecommendationEngineResult["primaryOpportunity"];
  topOpportunities?: RecommendationEngineResult["topOpportunities"];
  excludedOpportunities?: RecommendationEngineResult["excludedOpportunities"];
}): RecommendationEngineResult {
  const primaryOpportunity =
    input?.primaryOpportunity ??
    null;
  const currentOpportunity = input?.currentOpportunity ?? null;
  const topOpportunities =
    input?.topOpportunities ??
    (primaryOpportunity ? [primaryOpportunity] : []);

  return {
    analyzedAt: "2026-10-01T19:15:00.000Z",
    windowHours: 24,
    qualityWindowPoints: 10,
    editorialSummary: "Conditions favorables.",
    primaryOpportunity,
    currentOpportunity,
    topOpportunities,
    secondaryOpportunity: topOpportunities[1] ?? null,
    excludedOpportunities: input?.excludedOpportunities ?? [],
  };
}

function opportunity(overrides: Partial<NonNullable<RecommendationEngineResult["primaryOpportunity"]>> & {
  slug: string;
  name: string;
  photoTypeSlug: "landscape" | "sunrise" | "sunset" | "storm" | "astro";
  score: number;
  distanceKm?: number;
}) {
  return {
    spot: {
      id: `spot/${overrides.slug}`,
      name: overrides.name,
      slug: overrides.slug,
      latitude: 44.6,
      longitude: -1.1,
      spotTypeId: "type-id",
      spotTypeSlug: "harbour",
      distanceKm: overrides.distanceKm ?? 5,
    },
    photoType: {
      slug: overrides.photoTypeSlug,
      name: overrides.photoTypeSlug,
    },
    timing: {
      start: "2026-10-01T19:00:00.000Z",
      end: "2026-10-01T20:00:00.000Z",
      idealTime: "2026-10-01T19:45:00.000Z",
    },
    conditionScore: overrides.conditionScore ?? 80,
    compatibilityScore: overrides.compatibilityScore ?? 0.8,
    distanceFactor: overrides.distanceFactor ?? 1,
    opportunityScore: overrides.score,
    editorialMessage: overrides.editorialMessage ?? "Ça vaut le déplacement.",
    distanceMessage: overrides.distanceMessage ?? "Un peu plus loin, mais intéressant.",
    explanation: overrides.explanation ?? "Explication",
    safetyWarning: overrides.safetyWarning ?? null,
    safetyLevel: overrides.safetyLevel ?? "normal",
    isEligible: true,
    exclusionReason: null,
    isWithinWindow: true,
    resolvedTime: overrides.resolvedTime ?? "2026-10-01T19:45:00.000Z",
    scoreDeltaFromBest: null,
  } as NonNullable<RecommendationEngineResult["primaryOpportunity"]>;
}

function renderView(props: React.ComponentProps<typeof RecommendationCardView>) {
  let renderer: RecommendationCardTestRenderer | undefined;

  act(() => {
    renderer = TestRenderer.create(React.createElement(RecommendationCardView, props));
  });

  if (!renderer) {
    throw new Error("Impossible de rendre la carte de recommandation.");
  }

  return renderer;
}

test("primaryOpportunity présente", () => {
  const tree = renderView({
    result: buildResult({ primaryOpportunity: opportunity({ slug: "banc-d-arguin", name: "Banc d'Arguin", photoTypeSlug: "sunset", score: 96 }) }),
    analyzedAt: "2026-10-01T19:15:00.000Z",
    onSelectSpot: () => undefined,
    onRetry: () => undefined,
    isLoading: false,
    isError: false,
  });

  assert.ok(tree.root.findAllByType("button").length >= 1);
  assert.ok(
    tree.root
      .findAllByType("p")
      .some((node) => JSON.stringify(node.props.children).includes("96/100")),
  );
});

test("aucune opportunité", () => {
  const tree = renderView({
    result: buildResult({ primaryOpportunity: null, topOpportunities: [] }),
    analyzedAt: "2026-10-01T19:15:00.000Z",
    onSelectSpot: () => undefined,
    onRetry: () => undefined,
    isLoading: false,
    isError: false,
  });

  assert.ok(tree.root.findByProps({ children: "Pas de condition exceptionnelle aujourd'hui." }));
});

test("current + primary et écart <= 10", () => {
  const primary = opportunity({ slug: "banc-d-arguin", name: "Banc d'Arguin", photoTypeSlug: "sunset", score: 96 });
  const current = opportunity({ slug: "plage-du-moulleau", name: "Plage du Moulleau", photoTypeSlug: "landscape", score: 92 });
  const tree = renderView({
    result: buildResult({ primaryOpportunity: primary, currentOpportunity: current, topOpportunities: [primary, current] }),
    analyzedAt: "2026-10-01T19:15:00.000Z",
    onSelectSpot: () => undefined,
    onRetry: () => undefined,
    isLoading: false,
    isError: false,
  });

  assert.ok(tree.root.findAllByProps({ children: "MAINTENANT" }).length >= 1);
  assert.ok(tree.root.findAllByProps({ children: "⭐ MEILLEURE OPPORTUNITÉ" }).length >= 1);
});

test("écart > 10 n'affiche pas le bloc current", () => {
  const primary = opportunity({ slug: "banc-d-arguin", name: "Banc d'Arguin", photoTypeSlug: "sunset", score: 96 });
  const current = opportunity({ slug: "plage-du-moulleau", name: "Plage du Moulleau", photoTypeSlug: "landscape", score: 80 });
  const tree = renderView({
    result: buildResult({ primaryOpportunity: primary, currentOpportunity: current, topOpportunities: [primary, current] }),
    analyzedAt: "2026-10-01T19:15:00.000Z",
    onSelectSpot: () => undefined,
    onRetry: () => undefined,
    isLoading: false,
    isError: false,
  });

  assert.equal(tree.root.findAllByProps({ children: "MAINTENANT" }).length, 0);
});

test("une alternative", () => {
  const primary = opportunity({ slug: "banc-d-arguin", name: "Banc d'Arguin", photoTypeSlug: "sunset", score: 96 });
  const alt = opportunity({ slug: "port-de-larros", name: "Port de Larros", photoTypeSlug: "sunset", score: 79 });
  const tree = renderView({
    result: buildResult({ primaryOpportunity: primary, topOpportunities: [primary, alt] }),
    analyzedAt: "2026-10-01T19:15:00.000Z",
    onSelectSpot: () => undefined,
    onRetry: () => undefined,
    isLoading: false,
    isError: false,
  });

  assert.ok(tree.root.findAllByProps({ children: "Autres possibilités" }).length >= 1);
  assert.ok(tree.root.findAllByProps({ children: "Port de Larros" }).length >= 1);
});

test("deux alternatives", () => {
  const primary = opportunity({ slug: "banc-d-arguin", name: "Banc d'Arguin", photoTypeSlug: "sunset", score: 96 });
  const alt1 = opportunity({ slug: "port-de-larros", name: "Port de Larros", photoTypeSlug: "sunset", score: 79 });
  const alt2 = opportunity({ slug: "dune-du-pilat", name: "Dune du Pilat", photoTypeSlug: "landscape", score: 73 });
  const tree = renderView({
    result: buildResult({ primaryOpportunity: primary, topOpportunities: [primary, alt1, alt2] }),
    analyzedAt: "2026-10-01T19:15:00.000Z",
    onSelectSpot: () => undefined,
    onRetry: () => undefined,
    isLoading: false,
    isError: false,
  });

  assert.ok(tree.root.findAllByProps({ children: "Dune du Pilat" }).length >= 1);
});

test("sécurité présente", () => {
  const primary = opportunity({
    slug: "storm-spot",
    name: "Spot Orageux",
    photoTypeSlug: "storm",
    score: 85,
    safetyWarning: "Conditions orageuses fortes : prudence",
    editorialMessage: "Ça vaut le déplacement.",
  });
  const tree = renderView({
    result: buildResult({ primaryOpportunity: primary }),
    analyzedAt: "2026-10-01T19:15:00.000Z",
    onSelectSpot: () => undefined,
    onRetry: () => undefined,
    isLoading: false,
    isError: false,
  });

  assert.ok(tree.root.findAllByProps({ children: "Conditions orageuses fortes : prudence" }).length >= 1);
  assert.equal(tree.root.findAllByProps({ children: "Ça vaut le déplacement." }).length, 0);
});

test("erreur runtime", () => {
  const tree = renderView({
    result: null,
    analyzedAt: "2026-10-01T19:15:00.000Z",
    onSelectSpot: () => undefined,
    onRetry: () => undefined,
    isLoading: false,
    isError: true,
  });

  assert.ok(tree.root.findAllByProps({ children: "Impossible de calculer la meilleure opportunité." }).length >= 1);
});

test("loading", () => {
  const tree = renderView({
    result: null,
    analyzedAt: null,
    onSelectSpot: () => undefined,
    onRetry: () => undefined,
    isLoading: true,
    isError: false,
  });

  assert.ok(tree.root.findAllByProps({ children: "Meilleure opportunité" }).length >= 1);
});

test("clic sur une recommandation sélectionne le spot", () => {
  let selectedSlug: string | null = null;
  const primary = opportunity({ slug: "banc-d-arguin", name: "Banc d'Arguin", photoTypeSlug: "sunset", score: 96 });
  const tree = renderView({
    result: buildResult({ primaryOpportunity: primary }),
    analyzedAt: "2026-10-01T19:15:00.000Z",
    onSelectSpot: (spot) => {
      selectedSlug = spot.slug;
    },
    onRetry: () => undefined,
    isLoading: false,
    isError: false,
  });

  const buttons = tree.root.findAllByType("button");
  act(() => {
    buttons[0]?.props.onClick?.();
  });

  assert.equal(selectedSlug, "banc-d-arguin");
});