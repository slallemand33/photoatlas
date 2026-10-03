"use client";

import { LoaderCircle, Sparkles } from "lucide-react";

import { PlaceDashboardSection } from "@/features/place-details/components/PlaceDashboardSection";
import type { SearchResult } from "@/features/search/types/search.types";

import { usePhotoScore } from "../hooks";
import type { PhotoRecommendation } from "../types";

import { DailyRecommendationCard } from "./DailyRecommendationCard";
import { PhotoRecommendationCard } from "./PhotoRecommendationCard";
import { ScoreBar } from "./ScoreIndicator";

const RECOMMENDATION_ORDER: PhotoRecommendation["kind"][] = [
  "landscape",
  "sunrise",
  "sunset",
  "storms",
  "astro",
];

function PhotoScoreSummaryCard({ recommendations }: { recommendations: PhotoRecommendation[] }) {
  return (
    <PlaceDashboardSection title="Synthèse Photo Score" icon={Sparkles} status="5 catégories">
      <div className="space-y-2.5">
        {recommendations.map((item, index) => (
          <div
            key={item.kind}
            className="border-border bg-background/40 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border px-3 py-2.5"
          >
            <span className="text-muted-foreground w-5 text-xs font-bold">{index + 1}</span>
            <div className="min-w-0">
              <p className="text-foreground truncate text-sm font-bold">{item.title}</p>
              <div className="mt-1.5">
                <ScoreBar score={item.score} />
              </div>
            </div>
            <span className="text-foreground font-mono text-sm font-black tabular-nums">
              {item.score}
            </span>
          </div>
        ))}
      </div>
    </PlaceDashboardSection>
  );
}

export function PhotoScoreDashboard({ place }: { place: SearchResult }) {
  const { data, isLoading, isError, isFetching } = usePhotoScore(place);

  const orderedRecommendations = data
    ? [...data.recommendations].sort(
        (left, right) =>
          RECOMMENDATION_ORDER.indexOf(left.kind) - RECOMMENDATION_ORDER.indexOf(right.kind),
      )
    : [];

  if (isLoading && !data) {
    return (
      <PlaceDashboardSection title="Assistant photo" icon={Sparkles} status="Analyse…">
        <div className="text-muted-foreground flex min-h-28 flex-col items-center justify-center gap-3 text-center text-sm">
          <LoaderCircle className="text-primary h-5 w-5 animate-spin" aria-hidden="true" />
          Croisement de la météo, de la lumière et du ciel…
        </div>
      </PlaceDashboardSection>
    );
  }

  if (isError || !data) {
    return (
      <PlaceDashboardSection title="Assistant photo" icon={Sparkles} status="Indisponible">
        <p className="text-destructive py-4 text-center text-sm">
          Le moteur ne peut pas établir de recommandation pour le moment.
        </p>
      </PlaceDashboardSection>
    );
  }

  return (
    <div className="grid gap-3" aria-live="polite" aria-busy={isFetching}>
      <DailyRecommendationCard recommendations={data.rankedRecommendations} />
      <PhotoScoreSummaryCard recommendations={orderedRecommendations} />
      {orderedRecommendations.map((recommendation) => (
        <PhotoRecommendationCard key={recommendation.kind} recommendation={recommendation} />
      ))}
    </div>
  );
}
