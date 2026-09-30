"use client";

import { Compass, MapPinned } from "lucide-react";
import { useState } from "react";

import { PlaceDashboardSection } from "@/features/place-details/components/PlaceDashboardSection";
import type { SearchResult } from "@/features/search/types/search.types";
import { cn } from "@/lib/utils";

import { useNearbySpots } from "../hooks";
import type { NearbySpot } from "../types/spot.types";

const RADIUS_OPTIONS = [5, 10, 25, 50] as const;
const DEFAULT_RADIUS_KM = 10;
const DEFAULT_LIMIT = 20;
const VISIBLE_SPOTS_COUNT = 3;

const SPOT_TYPE_LABELS: Record<string, string> = {
  dune: "Dune",
  nature: "Nature",
  harbour: "Port",
  architecture: "Architecture",
  beach: "Plage",
  pier: "Jetée",
  lighthouse: "Phare",
};

function formatSpotType(value: string): string {
  return SPOT_TYPE_LABELS[value] ?? "Spot photo";
}

function formatDistance(value: number): string {
  return `${new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)} km`;
}

function LoadingRows() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="border-border bg-background/40 animate-pulse rounded-xl border px-4 py-3"
        >
          <div className="bg-muted h-4 w-2/3 rounded" />
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="bg-muted h-3 w-20 rounded" />
            <div className="bg-muted h-3 w-12 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SpotRow({ spot }: { spot: NearbySpot }) {
  return (
    <div className="border-border bg-background/40 rounded-xl border px-4 py-3">
      <p className="text-foreground line-clamp-2 text-base font-bold leading-snug">{spot.name}</p>
      <div className="mt-2 flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground truncate">{formatSpotType(spot.spotType)}</span>
        <span className="text-foreground shrink-0 font-mono tabular-nums">
          {formatDistance(spot.distanceKm)}
        </span>
      </div>
    </div>
  );
}

export function NearbySpotsSection({ place }: { place: SearchResult }) {
  return <NearbySpotsSectionContent key={place.id} place={place} />;
}

function NearbySpotsSectionContent({ place }: { place: SearchResult }) {
  const [radiusKm, setRadiusKm] = useState<number>(DEFAULT_RADIUS_KM);
  const [expanded, setExpanded] = useState(false);

  const query = useNearbySpots({
    latitude: place.latitude,
    longitude: place.longitude,
    radiusKm,
    limit: DEFAULT_LIMIT,
  });

  const spots = query.data?.spots ?? [];
  const visibleSpots = expanded ? spots : spots.slice(0, VISIBLE_SPOTS_COUNT);

  const hiddenCount = Math.max(0, spots.length - VISIBLE_SPOTS_COUNT);

  return (
    <PlaceDashboardSection
      title="Spots autour"
      icon={MapPinned}
      status={query.data ? String(query.data.count) : undefined}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Choisir le rayon des spots autour">
          {RADIUS_OPTIONS.map((option) => {
            const active = option === radiusKm;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setRadiusKm(option);
                  setExpanded(false);
                }}
                aria-pressed={active}
                className={cn(
                  "border-border min-h-11 rounded-full border px-3 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "bg-background text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                {option} km
              </button>
            );
          })}
        </div>

        {query.isLoading && !query.data ? <LoadingRows /> : null}

        {query.isError ? (
          <div className="border-border bg-background/40 rounded-xl border px-4 py-4">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Impossible de charger les spots autour de ce lieu.
            </p>
            <button
              type="button"
              onClick={() => void query.refetch()}
              className="text-primary hover:bg-accent mt-3 min-h-11 rounded-xl px-3 text-sm font-semibold transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : null}

        {!query.isLoading && !query.isError && spots.length === 0 ? (
          <div className="border-border bg-background/40 rounded-xl border px-4 py-4">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Aucun spot PhotoAtlas trouvé dans un rayon de {radiusKm} km.
            </p>
          </div>
        ) : null}

        {!query.isLoading && !query.isError && spots.length > 0 ? (
          <div className="space-y-3">
            {visibleSpots.map((spot) => (
              <SpotRow key={spot.id} spot={spot} />
            ))}

            {hiddenCount > 0 && !expanded ? (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="text-primary hover:bg-accent flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors"
              >
                <Compass className="h-4 w-4" aria-hidden="true" />
                Voir les {spots.length} spots
              </button>
            ) : null}

            {spots.length > VISIBLE_SPOTS_COUNT && expanded ? (
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="text-primary hover:bg-accent min-h-11 rounded-xl px-3 text-sm font-semibold transition-colors"
              >
                Réduire
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </PlaceDashboardSection>
  );
}