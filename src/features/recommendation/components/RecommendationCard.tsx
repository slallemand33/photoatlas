"use client";

import {
  ArrowRight,
  MapPin,
  Navigation,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { useCallback } from "react";

import { useLocationSelection } from "@/features/location-selection";
import { PlaceDashboardSection } from "@/features/place-details/components/PlaceDashboardSection";
import type { SearchResult } from "@/features/search/types/search.types";
import { useNearbySpotsStore } from "@/features/spots/store";

import { useRecommendationRuntime } from "../hooks/useRecommendationRuntime.ts";
import type { RecommendationEngineResult, RecommendationSpotInput } from "../types";

const TYPE_ICONS: Record<string, string> = {
  astro: "🌌",
  sunrise: "🌅",
  sunset: "🌇",
  landscape: "🏞️",
  storm: "⚡",
};

const SCORE_FORMATTER = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const DISTANCE_FORMATTER = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function formatScore(score: number): string {
  return `${SCORE_FORMATTER.format(Math.round(score))}/100`;
}

function formatDistance(distanceKm: number): string {
  return `${DISTANCE_FORMATTER.format(distanceKm)} km`;
}

function formatTimeLabel(analyzedAt: string, time: string | null, current = false): string {
  if (!time) return "À préciser";

  const analyzed = new Date(analyzedAt);
  const candidate = new Date(time);
  if (Number.isNaN(analyzed.getTime()) || Number.isNaN(candidate.getTime())) return "À préciser";

  const sameDay = analyzed.toDateString() === candidate.toDateString();
  const timeLabel = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(candidate);

  if (current) return `Maintenant · ${timeLabel}`;
  if (sameDay) return `${candidate.getHours() >= 18 ? "Ce soir" : "Aujourd’hui"} · ${timeLabel}`;

  const tomorrow = new Date(analyzed);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (candidate.toDateString() === tomorrow.toDateString()) return `Demain · ${timeLabel}`;

  return `${new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" }).format(candidate)} · ${timeLabel}`;
}

function buildItineraryHref(place: { latitude: number; longitude: number }): string | null {
  if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) {
    return null;
  }

  const url = new URL("https://www.google.com/maps/dir/");
  url.search = new URLSearchParams({
    api: "1",
    destination: `${place.latitude},${place.longitude}`,
    travelmode: "driving",
  }).toString();

  return url.toString();
}

function toSearchResult(spot: RecommendationSpotInput): SearchResult {
  return {
    id: `spot/${spot.slug}`,
    name: spot.name,
    displayName: spot.name,
    type: spot.spotTypeSlug ?? "spot",
    class: "spot",
    latitude: spot.latitude ?? 0,
    longitude: spot.longitude ?? 0,
    country: "",
    region: "",
    department: "",
    locality: "",
    importance: 0.8,
  };
}

function RecommendationSkeleton() {
  return (
    <PlaceDashboardSection title="Meilleure opportunité" icon={Sparkles} status="Analyse…">
      <div className="space-y-3" aria-hidden="true">
        <div className="bg-muted/20 h-10 w-full animate-pulse rounded-2xl" />
        <div className="bg-muted/20 h-24 w-full animate-pulse rounded-2xl" />
        <div className="bg-muted/20 h-14 w-3/4 animate-pulse rounded-2xl" />
      </div>
    </PlaceDashboardSection>
  );
}

function OpportunityBlock({
  title,
  opportunity,
  analyzedAt,
  onSelect,
  showItinerary,
}: {
  title: string;
  opportunity: NonNullable<RecommendationEngineResult["primaryOpportunity"]>;
  analyzedAt: string;
  onSelect: (spot: RecommendationSpotInput) => void;
  showItinerary?: boolean;
}) {
  const itineraryHref = buildItineraryHref({
    latitude: opportunity.spot.latitude ?? 0,
    longitude: opportunity.spot.longitude ?? 0,
  });
  const icon = TYPE_ICONS[opportunity.photoType.slug] ?? "📷";
  const shouldHideEditorial = Boolean(opportunity.safetyWarning);

  return (
    <div className="border-border bg-background/50 space-y-3 rounded-2xl border p-4">
      <div className="flex items-start gap-3">
        <span className="bg-primary/10 text-primary grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-[0.72rem] font-black tracking-[0.16em] uppercase">
            {title}
          </p>
          <p className="text-foreground mt-1 text-base font-bold leading-tight">
            {opportunity.photoType.name}
          </p>
          <p className="text-foreground/85 mt-0.5 text-sm font-medium">{opportunity.spot.name}</p>
          <p className="text-muted-foreground mt-1 text-xs font-medium">
            {formatTimeLabel(analyzedAt, opportunity.resolvedTime)}
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-foreground text-lg font-black">Score d&apos;opportunité : {formatScore(opportunity.opportunityScore)}</p>
        <p className="text-muted-foreground text-sm font-medium">
          Distance : {formatDistance(opportunity.spot.distanceKm)}
        </p>
        <p className="text-muted-foreground text-sm font-medium">
          {opportunity.distanceMessage}
        </p>
        {opportunity.safetyWarning ? (
          <p className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-xl border px-3 py-2 text-sm font-semibold">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{opportunity.safetyWarning}</span>
          </p>
        ) : null}
        {!shouldHideEditorial ? (
          <p className="text-foreground text-sm font-medium">{opportunity.editorialMessage}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelect(opportunity.spot)}
          className="border-border bg-muted text-foreground hover:bg-accent inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors"
          aria-label={`Sélectionner ${opportunity.spot.name}`}
        >
          <MapPin className="h-4 w-4" aria-hidden="true" />
          Voir sur la carte
        </button>

        {showItinerary && itineraryHref ? (
          <a
            href={itineraryHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Itinéraire vers ${opportunity.spot.name}`}
            className="border-border bg-muted text-foreground hover:bg-accent inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors"
          >
            <Navigation className="h-4 w-4" aria-hidden="true" />
            Itinéraire
          </a>
        ) : null}
      </div>
    </div>
  );
}

function OpportunityRow({
  label,
  opportunity,
  analyzedAt,
  onSelect,
}: {
  label: string;
  opportunity: NonNullable<RecommendationEngineResult["primaryOpportunity"]>;
  analyzedAt: string;
  onSelect: (spot: RecommendationSpotInput) => void;
}) {
  const icon = TYPE_ICONS[opportunity.photoType.slug] ?? "📷";

  return (
    <button
      type="button"
      onClick={() => onSelect(opportunity.spot)}
      className="border-border bg-background/50 hover:bg-accent/40 flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors"
      aria-label={`${label} : ${opportunity.photoType.name} à ${opportunity.spot.name}`}
    >
      <span className="bg-muted grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-lg">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-[0.7rem] font-black tracking-[0.16em] uppercase">
          {label}
        </p>
        <p className="text-foreground truncate text-sm font-bold">{opportunity.photoType.name}</p>
        <p className="text-muted-foreground truncate text-xs">{opportunity.spot.name}</p>
        <p className="text-muted-foreground mt-0.5 text-xs">{formatTimeLabel(analyzedAt, opportunity.resolvedTime, label === "MAINTENANT")}</p>
      </div>
      <div className="text-right">
        <p className="text-foreground font-mono text-sm font-black tabular-nums">
          {formatScore(opportunity.opportunityScore)}
        </p>
        <p className="text-muted-foreground text-[0.7rem]">{formatDistance(opportunity.spot.distanceKm)}</p>
      </div>
      <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden="true" />
    </button>
  );
}

function RecommendationCardView({
  result,
  analyzedAt,
  onSelectSpot,
  onRetry,
  isLoading,
  isError,
}: {
  result: RecommendationEngineResult | null;
  analyzedAt: string | null;
  onSelectSpot: (spot: RecommendationSpotInput) => void;
  onRetry: () => void;
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading && !result) {
    return <RecommendationSkeleton />;
  }

  if (isError || !result || !analyzedAt) {
    return (
      <PlaceDashboardSection title="Meilleure opportunité" icon={Sparkles} status="Erreur">
        <div className="border-border bg-background/40 rounded-2xl border px-4 py-4">
          <p className="text-foreground text-sm font-semibold">Impossible de calculer la meilleure opportunité.</p>
          <button
            type="button"
            onClick={onRetry}
            className="text-primary hover:bg-accent mt-3 min-h-11 rounded-xl px-3 text-sm font-semibold transition-colors"
          >
            Réessayer
          </button>
        </div>
      </PlaceDashboardSection>
    );
  }

  const primaryOpportunity = result.primaryOpportunity;
  const currentOpportunity = result.currentOpportunity;
  const showCurrentComparison =
    Boolean(primaryOpportunity && currentOpportunity) &&
    currentOpportunity?.spot.slug !== primaryOpportunity?.spot.slug &&
    (primaryOpportunity!.opportunityScore - currentOpportunity!.opportunityScore <= 10);

  const alternativeOpportunities = result.topOpportunities
    .filter((opportunity) => opportunity.spot.slug !== primaryOpportunity?.spot.slug)
    .filter((opportunity) => opportunity.spot.slug !== currentOpportunity?.spot.slug)
    .slice(0, 2);

  return (
    <div className="space-y-3" aria-live="polite" aria-busy={isLoading}>
      <PlaceDashboardSection title="Meilleure opportunité" icon={Sparkles} status="Recommandation">
        <div className="space-y-3">
          {primaryOpportunity ? (
            <>
              {showCurrentComparison && currentOpportunity ? (
                <div className="border-primary/25 bg-primary/8 rounded-2xl border px-4 py-3">
                  <p className="text-primary text-[0.72rem] font-black tracking-[0.16em] uppercase">
                    Vous pouvez photographier maintenant, mais ce soir sera meilleur.
                  </p>
                  <div className="mt-3">
                    <OpportunityRow
                      label="MAINTENANT"
                      opportunity={currentOpportunity}
                      analyzedAt={analyzedAt}
                      onSelect={onSelectSpot}
                    />
                  </div>
                </div>
              ) : null}

              <OpportunityBlock
                title="⭐ MEILLEURE OPPORTUNITÉ"
                opportunity={primaryOpportunity}
                analyzedAt={analyzedAt}
                onSelect={onSelectSpot}
                showItinerary
              />

              {alternativeOpportunities.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-muted-foreground text-[0.72rem] font-black tracking-[0.16em] uppercase">
                    Autres possibilités
                  </p>
                  <div className="space-y-2">
                    {alternativeOpportunities.map((opportunity, index) => (
                      <OpportunityRow
                        key={`${opportunity.spot.slug}-${opportunity.photoType.slug}`}
                        label={index === 0 ? "🥈" : "🥉"}
                        opportunity={opportunity}
                        analyzedAt={analyzedAt}
                        onSelect={onSelectSpot}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              <details className="border-border bg-background/40 rounded-2xl border p-4">
                <summary className="text-foreground cursor-pointer list-none text-sm font-semibold">
                  Explication
                </summary>
                <p className="text-muted-foreground mt-3 text-lg leading-relaxed">
                  {primaryOpportunity.explanation}
                </p>
              </details>
            </>
          ) : (
            <div className="border-border bg-background/40 rounded-2xl border px-4 py-4">
              <p className="text-foreground text-sm font-semibold">
                Pas de condition exceptionnelle aujourd&apos;hui.
              </p>
            </div>
          )}
        </div>
      </PlaceDashboardSection>
    </div>
  );
}

export function RecommendationCard({ place }: { place: SearchResult }) {
  const radiusKm = useNearbySpotsStore((state) => state.radiusKm);
  const { data, isLoading, isError, refetch } = useRecommendationRuntime({ place, radiusKm });
  const { selectSearchResult } = useLocationSelection();

  const onSelectSpot = useCallback(
    (spot: RecommendationSpotInput) => {
      selectSearchResult(toSearchResult(spot));
    },
    [selectSearchResult],
  );

  return (
    <RecommendationCardView
      result={data?.recommendation ?? null}
      analyzedAt={data?.recommendation.analyzedAt ?? null}
      onSelectSpot={onSelectSpot}
      onRetry={() => void refetch()}
      isLoading={isLoading}
      isError={isError}
    />
  );
}

export { RecommendationCardView };