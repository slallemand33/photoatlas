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
    <div className="border-border/30 relative shrink-0 overflow-hidden border-b px-5 pt-4 pb-5">
      <div
        className="bg-primary/8 pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full blur-3xl"
        aria-hidden="true"
      />
      {/* Type chip + bouton fermeture */}
      <div className="relative mb-4 flex items-center justify-between">
        <span className="border-primary/20 bg-primary/8 text-primary inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold">
          <MapPin className="h-3 w-3" aria-hidden="true" />
          {formatPlaceType(place.type)}
        </span>
        <button
          onClick={onClose}
          className="text-muted-foreground/60 hover:bg-accent hover:text-foreground focus-visible:ring-ring rounded-md p-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          aria-label="Fermer la fiche"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Nom du lieu */}
      <h2 className="text-foreground relative text-2xl leading-[1.08] font-bold tracking-tight">
        {place.name}
      </h2>
      <p className="text-muted-foreground/75 relative mt-2 line-clamp-2 text-xs leading-relaxed">
        {place.displayName}
      </p>

      {/* Actions */}
      <div className="relative mt-4 flex flex-wrap gap-2">
        <button
          onClick={handleCenterMap}
          disabled={!map}
          className="border-border/40 bg-muted/20 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40"
          aria-label="Centrer la carte sur ce lieu"
        >
          <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
          Centrer
        </button>

        <button
          onClick={handleCopyCoords}
          className={cn(
            "focus-visible:ring-ring flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
            copied
              ? "border-green-500/40 bg-green-500/10 text-green-400"
              : "border-border/40 bg-muted/20 text-muted-foreground hover:bg-accent hover:text-foreground",
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
