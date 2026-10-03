import { Camera, Crown } from "lucide-react";

import { PlaceDashboardSection } from "@/features/place-details/components/PlaceDashboardSection";

import type { PhotoRecommendation } from "../types";

import { ScoreIndicator } from "./ScoreIndicator";

const EMOJI: Record<PhotoRecommendation["kind"], string> = {
  astro: "🌌",
  sunrise: "🌅",
  sunset: "🌇",
  landscape: "🏞️",
  storms: "⚡",
};

export function DailyRecommendationCard({
  recommendations,
}: {
  recommendations: PhotoRecommendation[];
}) {
  const best = recommendations[0];
  if (!best) return null;

  return (
    <PlaceDashboardSection
      title="Recommandation du jour"
      icon={Camera}
      status="Assistant photo"
      className="border-primary/30 from-primary/15 via-card to-card bg-gradient-to-br shadow-lg"
    >
      <div className="border-warning/35 bg-warning/10 flex items-center gap-4 rounded-2xl border p-4">
        <span className="bg-warning/15 grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl">
          {EMOJI[best.kind]}
        </span>
        <div className="min-w-0">
          <p className="text-warning flex items-center gap-2 text-sm font-black tracking-[0.12em] uppercase">
            <Crown className="h-4 w-4" aria-hidden="true" /> Meilleure opportunité
          </p>
          <p className="text-foreground mt-1 text-2xl font-black">{best.title}</p>
          <p className="text-muted-foreground mt-1 text-base">{best.summary}</p>
        </div>
        <div className="ml-auto hidden sm:block">
          <ScoreIndicator score={best.score} compact />
        </div>
      </div>
    </PlaceDashboardSection>
  );
}
