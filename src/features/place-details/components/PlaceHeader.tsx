"use client";

import { Bookmark, Copy, MapPin, Navigation, X } from "lucide-react";
import { useCallback, useState } from "react";

import { useMap } from "@/components/map";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/features/search/types";

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
    <div className="shrink-0 border-b border-border/30 px-4 pb-4 pt-4">
      {/* Type chip + bouton fermeture */}
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/30 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <MapPin className="h-3 w-3" aria-hidden="true" />
          {formatPlaceType(place.type)}
        </span>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-muted-foreground/60 transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Fermer la fiche"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Nom du lieu */}
      <h2 className="mb-4 text-xl font-bold leading-tight tracking-tight text-foreground">
        {place.name}
      </h2>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleCenterMap}
          disabled={!map}
          className="flex items-center gap-1.5 rounded-md border border-border/40 bg-muted/20 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
          aria-label="Centrer la carte sur ce lieu"
        >
          <Navigation className="h-3.5 w-3.5" aria-hidden="true" />
          Centrer
        </button>

        <button
          onClick={handleCopyCoords}
          className={cn(
            "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            copied
              ? "border-green-500/40 bg-green-500/10 text-green-400"
              : "border-border/40 bg-muted/20 text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
          aria-label="Copier les coordonnées GPS"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          {copied ? "Copié !" : "Coordonnées"}
        </button>

        <button
          disabled
          className="flex cursor-not-allowed items-center gap-1.5 rounded-md border border-border/20 px-3 py-1.5 text-xs font-medium text-muted-foreground/40"
          title="Bientôt disponible"
          aria-label="Ajouter aux favoris (bientôt disponible)"
        >
          <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
          Favoris
        </button>
      </div>
    </div>
  );
}

