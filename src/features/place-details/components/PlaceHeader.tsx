"use client";

import { Check, Copy, MapPin, Navigation, X } from "lucide-react";
import { useCallback, useState } from "react";

import { useMap } from "@/components/map";
import type { SearchResult } from "@/features/search/types";
import { cn } from "@/lib/utils";

import { formatPlaceType, getZoomForPlace } from "../utils/format";

interface PlaceHeaderProps {
  place: SearchResult;
  onClose: () => void;
}

export function PlaceHeader({ place, onClose }: PlaceHeaderProps) {
  const map = useMap();
  const [copied, setCopied] = useState(false);

  const handleCenterMap = useCallback(() => {
    if (!map) return;
    map.flyTo({
      center: [place.longitude, place.latitude],
      zoom: getZoomForPlace(place.type),
      duration: 1000,
      essential: true,
    });
  }, [map, place]);

  const handleCopyCoords = useCallback(() => {
    const text = `${place.latitude.toFixed(6)}, ${place.longitude.toFixed(6)}`;
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [place]);

  return (
    <div className="border-border relative shrink-0 overflow-hidden border-b px-6 pt-5 pb-6">
      <div
        className="bg-primary/8 pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full blur-3xl"
        aria-hidden="true"
      />
      {/* Type chip + bouton fermeture */}
      <div className="relative mb-4 flex items-center justify-between">
        <span className="border-primary/25 bg-primary/10 text-primary inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          {formatPlaceType(place.type)}
        </span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:bg-accent hover:text-foreground grid h-11 w-11 place-items-center rounded-xl transition-colors"
          aria-label="Fermer la fiche"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Nom du lieu */}
      <h2 className="text-foreground relative text-4xl leading-tight font-black tracking-tight">
        {place.name}
      </h2>
      <p className="text-muted-foreground relative mt-3 line-clamp-3 text-base leading-relaxed">
        {place.displayName}
      </p>

      {/* Actions */}
      <div className="relative mt-4 flex flex-wrap gap-2">
        <button
          onClick={handleCenterMap}
          disabled={!map}
          className="border-border bg-muted text-foreground hover:bg-accent flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-base font-semibold transition-colors disabled:opacity-60"
          aria-label="Centrer la carte sur ce lieu"
        >
          <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
          Centrer
        </button>

        <button
          onClick={handleCopyCoords}
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-base font-semibold transition-colors",
            copied
              ? "border-success/40 bg-success/10 text-success"
              : "border-border bg-muted text-foreground hover:bg-accent",
          )}
          aria-label="Copier les coordonnées GPS"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {copied ? "Copié" : "Copier GPS"}
        </button>
      </div>
    </div>
  );
}
