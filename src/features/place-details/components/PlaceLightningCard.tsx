"use client";

import { Activity, Clock3, MapPin, Radio, Zap } from "lucide-react";

import { useLayerStore } from "@/features/layers/store/useLayerStore";
import type { SearchResult } from "@/features/search/types/search.types";
import {
  formatActivityAge,
  useLightningActivity,
  useLightningStore,
} from "@/features/weather/lightning";
import type { LightningActivityLevel } from "@/features/weather/lightning";
import { cn } from "@/lib/utils";

import { PlaceDashboardSection } from "./PlaceDashboardSection";

const ACTIVITY_STYLES: Record<LightningActivityLevel, string> = {
  none: "border-border bg-muted text-muted-foreground",
  low: "border-info/30 bg-info/10 text-info",
  moderate: "border-warning/30 bg-warning/10 text-warning",
  high: "border-destructive/30 bg-destructive/10 text-destructive",
};

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="border-border/25 bg-background/35 rounded-lg border p-2.5">
      <div className="text-muted-foreground/55 flex items-center gap-1.5 text-[9px] font-semibold tracking-wider uppercase">
        <Icon className="h-3 w-3" aria-hidden="true" />
        {label}
      </div>
      <p className="text-foreground/85 mt-1.5 text-xs font-bold">{value}</p>
    </div>
  );
}

export function PlaceLightningCard({ place }: { place: SearchResult }) {
  const isActive = useLayerStore((state) => state.layers.lightning?.visible ?? false);
  const snapshot = useLightningStore((state) => state.snapshot);
  const activity = useLightningActivity(place);

  if (!isActive) {
    return (
      <PlaceDashboardSection title="Activité orageuse" icon={Zap} status="Couche inactive">
        <div className="flex items-center gap-3">
          <span className="bg-muted/35 text-muted-foreground/45 grid h-10 w-10 shrink-0 place-items-center rounded-xl">
            <Zap className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-foreground/75 text-sm font-medium">Assistant de chasse aux orages</p>
            <p className="text-muted-foreground/55 mt-0.5 text-xs leading-relaxed">
              Activez la couche Orages pour analyser l’activité autour de ce lieu.
            </p>
          </div>
        </div>
      </PlaceDashboardSection>
    );
  }

  return (
    <PlaceDashboardSection
      title="Activité orageuse"
      icon={Zap}
      status={snapshot ? "Observations" : "Chargement…"}
      className="border-storm/30 from-storm/10 via-card to-card bg-gradient-to-br"
    >
      {!snapshot ? (
        <div className="text-muted-foreground/60 flex min-h-20 items-center justify-center gap-2 text-xs">
          <Radio className="h-4 w-4 animate-pulse" aria-hidden="true" />
          Initialisation de l’activité orageuse…
        </div>
      ) : (
        <div className="space-y-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3 py-3",
              ACTIVITY_STYLES[activity.level],
            )}
          >
            <span className="bg-background/45 grid h-10 w-10 shrink-0 place-items-center rounded-full">
              <Activity className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-semibold tracking-wider uppercase">
                Niveau d’activité
              </p>
              <p className="mt-0.5 text-base font-black">{activity.label}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Metric
              icon={MapPin}
              label="Dernier impact"
              value={activity.distanceKm === null ? "—" : `${activity.distanceKm} km`}
            />
            <Metric
              icon={Clock3}
              label="Dernière activité"
              value={formatActivityAge(activity.lastActivityAt, snapshot.updatedAt)}
            />
          </div>

          <div className="border-border/25 bg-background/30 flex items-center justify-between rounded-lg border px-3 py-2 text-[10px]">
            <span className="text-muted-foreground/60">Impacts à moins de 100 km</span>
            <span className="text-foreground/85 font-mono font-bold tabular-nums">
              {activity.nearbyStrikeCount}
            </span>
          </div>

          <p className="border-border/25 bg-background/30 text-muted-foreground/55 rounded-md border px-2.5 py-2 text-[9px] leading-relaxed">
            Impacts OpenWeather détectés dans un rayon maximal de 50 km autour du centre de la
            carte. Cette aide ne remplace pas les alertes officielles de sécurité.
          </p>
        </div>
      )}
    </PlaceDashboardSection>
  );
}
