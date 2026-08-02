import { Camera, Crown } from "lucide-react";

import { PlaceDashboardSection } from "@/features/place-details/components/PlaceDashboardSection";

import type { PhotoRecommendation } from "../types";

import { ScoreBar, ScoreIndicator } from "./ScoreIndicator";

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
      <div className="border-warning/35 bg-warning/10 mb-5 flex items-center gap-4 rounded-2xl border p-5">
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

      <div className="space-y-3">
        {recommendations.map((item, index) => (
          <div
            key={item.kind}
            className="border-border bg-background/40 grid grid-cols-[auto_auto_1fr_auto] items-center gap-3 rounded-xl border p-3.5"
          >
            <span className="text-muted-foreground w-5 font-mono text-sm font-bold">
              {index + 1}
            </span>
            <span className="text-xl" aria-hidden="true">
              {EMOJI[item.kind]}
            </span>
            <div className="min-w-0">
              <span className="text-foreground block truncate text-base font-bold">
                {item.title}
              </span>
              <div className="mt-2">
                <ScoreBar score={item.score} />
              </div>
            </div>
            <span className="text-foreground w-10 text-right font-mono text-base font-black tabular-nums">
              {item.score}
            </span>
          </div>
        ))}
      </div>
    </PlaceDashboardSection>
  );
}
