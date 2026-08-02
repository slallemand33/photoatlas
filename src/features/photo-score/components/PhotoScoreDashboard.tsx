"use client";

import { LoaderCircle, Sparkles } from "lucide-react";

import { PlaceDashboardSection } from "@/features/place-details/components/PlaceDashboardSection";
import type { SearchResult } from "@/features/search/types/search.types";

import { usePhotoScore } from "../hooks";

import { DailyRecommendationCard } from "./DailyRecommendationCard";
import { PhotoRecommendationCard } from "./PhotoRecommendationCard";
import { PhotoTimeline } from "./PhotoTimeline";

export function PhotoScoreDashboard({ place }: { place: SearchResult }) {
  const { data, isLoading, isError, isFetching } = usePhotoScore(place);

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
      {data.recommendations.map((recommendation) => (
        <PhotoRecommendationCard key={recommendation.kind} recommendation={recommendation} />
      ))}
      <PhotoTimeline events={data.timeline} />
    </div>
  );
}
