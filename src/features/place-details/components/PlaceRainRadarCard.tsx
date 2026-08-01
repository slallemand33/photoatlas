"use client";

import { CloudRain, Droplets, LoaderCircle, PlayCircle } from "lucide-react";

import { useLayerStore } from "@/features/layers/store/useLayerStore";
import type { SearchResult } from "@/features/search/types/search.types";
import {
  formatRadarTime,
  useRadarStore,
  useRadarTimeline,
  useRainAtLocation,
} from "@/features/weather/radar";
import type { RainIntensity } from "@/features/weather/radar";
import { cn } from "@/lib/utils";

import { PlaceDashboardSection } from "./PlaceDashboardSection";

const INTENSITY_STYLES: Record<RainIntensity, string> = {
  none: "border-emerald-300/20 bg-emerald-400/8 text-emerald-600 dark:text-emerald-300",
  light: "border-sky-300/25 bg-sky-400/10 text-sky-600 dark:text-sky-300",
  moderate: "border-amber-300/25 bg-amber-400/10 text-amber-650 dark:text-amber-300",
  heavy: "border-rose-300/25 bg-rose-400/10 text-rose-600 dark:text-rose-300",
};

export function PlaceRainRadarCard({ place }: { place: SearchResult }) {
  const isActive = useLayerStore((state) => state.layers["rain-radar"]?.visible ?? false);
  const timelineQuery = useRadarTimeline(isActive);
  const timeline = useRadarStore((state) => state.timeline);
  const currentIndex = useRadarStore((state) => state.currentIndex);
  const currentFrame = timeline?.frames[currentIndex];
  const latestFrame = timeline?.frames.at(-1);
  const rainQuery = useRainAtLocation(place, isActive);

  if (!isActive) {
    return (
      <PlaceDashboardSection title="Radar pluie" icon={CloudRain} status="Couche inactive">
        <div className="flex items-center gap-3">
          <span className="bg-muted/35 text-muted-foreground/45 grid h-10 w-10 shrink-0 place-items-center rounded-xl">
            <CloudRain className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-foreground/75 text-sm font-medium">Précipitations observées</p>
            <p className="text-muted-foreground/55 mt-0.5 text-xs leading-relaxed">
              Activez Radar pluie pour analyser la dernière image sur ce lieu.
            </p>
          </div>
        </div>
      </PlaceDashboardSection>
    );
  }

  const loading =
    (timelineQuery.isLoading && !timeline) || (rainQuery.isFetching && !rainQuery.data);

  return (
    <PlaceDashboardSection
      title="Radar pluie"
      icon={CloudRain}
      status={currentFrame ? formatRadarTime(currentFrame.time) : "Chargement…"}
      className="via-background/40 border-sky-300/20 bg-gradient-to-br from-sky-500/8 to-indigo-400/5"
    >
      {loading ? (
        <div className="text-muted-foreground/65 flex min-h-24 items-center justify-center gap-2 text-xs">
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          Analyse de l’image radar…
        </div>
      ) : timelineQuery.isError || rainQuery.isError || !rainQuery.data ? (
        <p className="text-destructive/80 py-4 text-center text-xs">
          Les images radar sont momentanément indisponibles.
        </p>
      ) : (
        <div className="space-y-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3 py-3",
              INTENSITY_STYLES[rainQuery.data.intensity],
            )}
          >
            <span className="bg-background/45 grid h-10 w-10 shrink-0 place-items-center rounded-full">
              <Droplets className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-semibold tracking-wider uppercase">Image affichée</p>
              <p className="mt-0.5 text-base font-black">{rainQuery.data.label}</p>
            </div>
          </div>

          <div className="border-border/25 bg-background/35 grid grid-cols-2 gap-2 rounded-lg border p-3 text-xs">
            <span className="text-muted-foreground/60">Dernière image</span>
            <span className="text-foreground/85 text-right font-mono font-semibold tabular-nums">
              {formatRadarTime(latestFrame?.time)}
            </span>
            <span className="text-muted-foreground/60">Animation disponible</span>
            <span className="text-foreground/85 flex items-center justify-end gap-1 font-semibold">
              <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {timeline && timeline.frames.length > 1 ? "Oui" : "Non"}
            </span>
          </div>

          <p className="text-muted-foreground/45 text-[9px] leading-relaxed">
            Observation radar RainViewer · estimation visuelle indicative, sans prévision.
          </p>
        </div>
      )}
    </PlaceDashboardSection>
  );
}
