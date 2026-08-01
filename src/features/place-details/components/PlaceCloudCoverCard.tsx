"use client";

import { Cloud, CloudSun, LoaderCircle, Star } from "lucide-react";

import { useLayerStore } from "@/features/layers/store/useLayerStore";
import type { SearchResult } from "@/features/search/types/search.types";
import { getCloudPhotoQuality, useCloudCover } from "@/features/weather";

import { PlaceDashboardSection } from "./PlaceDashboardSection";

interface PlaceCloudCoverCardProps {
  place: SearchResult;
}

function CloudGauge({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-muted-foreground/70 text-[11px] font-medium">{label}</span>
        <span className="text-foreground/85 font-mono text-xs font-semibold tabular-nums">
          {value}%
        </span>
      </div>
      <div
        className="bg-muted/35 h-2 overflow-hidden rounded-full"
        role="progressbar"
        aria-label={`${label} : ${value} %`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500/55 via-sky-200/80 to-white transition-[width] duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function PhotoQuality({ cloudCover }: { cloudCover: number }) {
  const quality = getCloudPhotoQuality(cloudCover);

  return (
    <div className="border-border/25 bg-background/35 flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
      <div>
        <p className="text-muted-foreground/55 text-[10px] font-semibold tracking-wider uppercase">
          Potentiel ciel dégagé
        </p>
        <p className="text-foreground/90 mt-0.5 text-sm font-bold">{quality.label}</p>
      </div>
      <div className="flex gap-0.5" aria-label={`${quality.stars} étoiles sur 5`}>
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            className={
              index < quality.stars
                ? "h-4 w-4 fill-amber-400 text-amber-400"
                : "text-muted-foreground/20 h-4 w-4"
            }
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}

export function PlaceCloudCoverCard({ place }: PlaceCloudCoverCardProps) {
  const isActive = useLayerStore((state) => state.layers["cloud-cover"]?.visible ?? false);
  const { data, isFetching, isError } = useCloudCover(place, isActive);

  if (!isActive) {
    return (
      <PlaceDashboardSection title="Couverture nuageuse" icon={CloudSun} status="Couche inactive">
        <div className="flex items-center gap-3">
          <span className="bg-muted/35 text-muted-foreground/45 grid h-10 w-10 shrink-0 place-items-center rounded-xl">
            <Cloud className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-foreground/75 text-sm font-medium">Lecture photo des nuages</p>
            <p className="text-muted-foreground/55 mt-0.5 text-xs leading-relaxed">
              Activez la couche Nuages pour analyser ce lieu.
            </p>
          </div>
        </div>
      </PlaceDashboardSection>
    );
  }

  return (
    <PlaceDashboardSection
      title="Couverture nuageuse"
      icon={CloudSun}
      status={isFetching ? "Actualisation…" : "Maintenant"}
      className="via-background/40 border-sky-300/20 bg-gradient-to-br from-sky-400/8 to-slate-300/5"
    >
      {isFetching && !data ? (
        <div className="text-muted-foreground/65 flex min-h-28 items-center justify-center gap-2 text-xs">
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          Analyse des nuages au-dessus du lieu…
        </div>
      ) : isError || !data ? (
        <p className="text-destructive/80 py-4 text-center text-xs">
          Les données nuageuses sont momentanément indisponibles.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="border-border/25 bg-background/35 rounded-xl border p-3">
            <CloudGauge label="Couverture totale" value={data.total} />
          </div>

          <div className="grid gap-3">
            <CloudGauge label="Nuages bas · 0–3 km" value={data.low} />
            <CloudGauge label="Nuages moyens · 3–8 km" value={data.mid} />
            <CloudGauge label="Nuages hauts · +8 km" value={data.high} />
          </div>

          <PhotoQuality cloudCover={data.total} />

          <p className="text-muted-foreground/45 text-[9px] leading-relaxed">
            Prévision Open-Meteo aux coordonnées du lieu · score indicatif orienté ciel dégagé.
          </p>
        </div>
      )}
    </PlaceDashboardSection>
  );
}
