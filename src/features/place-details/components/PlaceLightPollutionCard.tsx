"use client";

import { Lightbulb, LoaderCircle, MapPin, Sparkles } from "lucide-react";

import { useLightPollutionEstimate } from "@/features/layers/light-pollution";
import { useLayerStore } from "@/features/layers/store/useLayerStore";
import type { SearchResult } from "@/features/search/types/search.types";
import { cn } from "@/lib/utils";

import { PlaceDashboardSection } from "./PlaceDashboardSection";

interface PlaceLightPollutionCardProps {
  place: SearchResult;
}

const BORTLE_COLORS = [
  "bg-light-1",
  "bg-light-2",
  "bg-light-3",
  "bg-light-4",
  "bg-light-5",
  "bg-light-6",
  "bg-light-7",
  "bg-light-8",
  "bg-light-9",
] as const;

export function PlaceLightPollutionCard({ place }: PlaceLightPollutionCardProps) {
  const isActive = useLayerStore((state) => state.layers["light-pollution"]?.visible ?? false);
  const { data: estimate, isFetching } = useLightPollutionEstimate(place, isActive);

  if (!isActive) {
    return (
      <PlaceDashboardSection title="Pollution lumineuse" icon={Lightbulb} status="Couche inactive">
        <div className="flex items-center gap-3">
          <span className="bg-muted/35 text-muted-foreground/45 grid h-10 w-10 shrink-0 place-items-center rounded-xl">
            <Lightbulb className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-foreground/75 text-sm font-medium">Analyse du ciel nocturne</p>
            <p className="text-muted-foreground/55 mt-0.5 text-xs leading-relaxed">
              Activez la couche pour estimer la classe Bortle de ce lieu.
            </p>
          </div>
        </div>
      </PlaceDashboardSection>
    );
  }

  return (
    <PlaceDashboardSection
      title="Pollution lumineuse"
      icon={Lightbulb}
      status={isFetching ? "Analyse…" : "Estimation"}
      className="border-warning/30 from-warning/10 via-card to-card bg-gradient-to-br"
    >
      {isFetching || !estimate ? (
        <div className="text-muted-foreground/65 flex min-h-24 items-center justify-center gap-2 text-xs">
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          Lecture de la luminosité nocturne…
        </div>
      ) : (
        <div className="space-y-3.5">
          <div className="flex items-center gap-4">
            <div className="border-border/30 bg-background/55 relative grid h-20 w-20 shrink-0 place-items-center rounded-2xl border shadow-sm">
              <span
                className={cn(
                  "absolute inset-x-2 top-2 h-1 rounded-full",
                  BORTLE_COLORS[estimate.bortleIndex - 1],
                )}
              />
              <div className="pt-1 text-center">
                <span className="text-muted-foreground/55 block text-[10px] font-semibold tracking-wider uppercase">
                  Bortle
                </span>
                <strong className="text-foreground block text-3xl leading-none font-black tabular-nums">
                  {estimate.bortleIndex}
                </strong>
                <span className="text-muted-foreground/50 text-[10px]">sur 9</span>
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-foreground flex items-center gap-1.5 text-base font-bold">
                <Sparkles className="text-warning h-4 w-4" aria-hidden="true" />
                {estimate.comment}
              </div>
              <p className="text-muted-foreground/70 mt-1 text-xs">
                Qualité estimée : <strong className="text-foreground/80">{estimate.quality}</strong>
              </p>
              <p className="text-muted-foreground/50 mt-1 text-[10px]">
                Luminosité locale : {estimate.lightLevel}/100
              </p>
            </div>
          </div>

          <div className="border-border/25 bg-background/35 flex items-start gap-2 rounded-lg border px-2.5 py-2">
            <MapPin
              className="text-muted-foreground/50 mt-0.5 h-3 w-3 shrink-0"
              aria-hidden="true"
            />
            <p className="text-muted-foreground/55 text-[10px] leading-relaxed">
              Estimation indicative d’après la luminosité VIIRS observée autour des coordonnées du
              lieu.
            </p>
          </div>
        </div>
      )}
    </PlaceDashboardSection>
  );
}
