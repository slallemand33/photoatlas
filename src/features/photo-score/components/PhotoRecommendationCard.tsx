import {
  Binoculars,
  Check,
  Clock3,
  CloudLightning,
  Image as ImageIcon,
  Sunset,
  Sunrise,
  Telescope,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import { PlaceDashboardSection } from "@/features/place-details/components/PlaceDashboardSection";

import type { PhotoRecommendation, PhotoRecommendationKind } from "../types";

import { ScoreIndicator } from "./ScoreIndicator";

const ICONS: Record<PhotoRecommendationKind, LucideIcon> = {
  astro: Telescope,
  sunrise: Sunrise,
  sunset: Sunset,
  landscape: ImageIcon,
  storms: CloudLightning,
};

function formatTime(value: string | null): string {
  if (!value) return "À préciser";
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(value),
  );
}

export function PhotoRecommendationCard({
  recommendation,
}: {
  recommendation: PhotoRecommendation;
}) {
  const Icon = ICONS[recommendation.kind];

  return (
    <PlaceDashboardSection
      title={`Conditions ${recommendation.title}`}
      icon={Icon}
      status={`${recommendation.score}/100`}
      className="photo-score-card"
    >
      <div className="space-y-5" data-category={recommendation.kind}>
        <div className="flex items-center gap-4">
          <ScoreIndicator score={recommendation.score} />
          <div className="min-w-0">
            <p className="text-foreground text-xl leading-tight font-black">
              {recommendation.summary}
            </p>
            <p className="text-muted-foreground mt-2 text-base leading-relaxed">
              {recommendation.explanation}
            </p>
          </div>
        </div>

        <div className="border-border bg-background/40 space-y-3 rounded-xl border p-4">
          {recommendation.strengths.slice(0, 3).map((item) => (
            <p key={item} className="text-success flex items-start gap-3 text-sm font-medium">
              <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{item}</span>
            </p>
          ))}
          {recommendation.cautions.slice(0, 2).map((item) => (
            <p key={item} className="text-muted-foreground flex items-start gap-3 text-sm">
              <TriangleAlert className="text-warning mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{item}</span>
            </p>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="border-border bg-background/55 rounded-xl border p-4">
            <p className="text-muted-foreground flex items-center gap-2 text-sm font-bold tracking-wide uppercase">
              <Clock3 className="text-info h-5 w-5" aria-hidden="true" /> Heure conseillée
            </p>
            <p className="text-foreground mt-2 font-mono text-2xl font-black tabular-nums">
              {formatTime(recommendation.recommendedTime)}
            </p>
          </div>
          <div className="border-border bg-background/55 rounded-xl border p-4">
            <p className="text-muted-foreground flex items-center gap-2 text-sm font-bold tracking-wide uppercase">
              <Binoculars className="text-info h-5 w-5" aria-hidden="true" /> Départ conseillé
            </p>
            <p className="text-foreground mt-2 font-mono text-2xl font-black tabular-nums">
              {formatTime(recommendation.departureTime)}
            </p>
          </div>
        </div>
      </div>
    </PlaceDashboardSection>
  );
}
