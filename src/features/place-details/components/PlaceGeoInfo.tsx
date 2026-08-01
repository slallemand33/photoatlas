import { Globe } from "lucide-react";

import type { SearchResult } from "@/features/search/types";

import { formatGPSCoordinates } from "../utils/format";

interface PlaceGeoInfoProps {
  place: SearchResult;
}

function GeoRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline gap-3 border-b border-border/20 px-3 py-2.5 last:border-0">
      <span className="w-24 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground/90">{value}</span>
    </div>
  );
}

export function PlaceGeoInfo({ place }: PlaceGeoInfoProps) {
  return (
    <div className="px-4 py-4">
      <div className="mb-2.5 flex items-center gap-2">
        <Globe className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Localisation
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/20 bg-card">
        <GeoRow label="Commune" value={place.locality} />
        <GeoRow label="Département" value={place.department} />
        <GeoRow label="Région" value={place.region} />
        <GeoRow label="Pays" value={place.country} />
        <div className="border-t border-border/20 px-3 py-2.5">
          <p className="font-mono text-xs text-muted-foreground">
            {formatGPSCoordinates(place.latitude, place.longitude)}
          </p>
        </div>
      </div>
    </div>
  );
}

