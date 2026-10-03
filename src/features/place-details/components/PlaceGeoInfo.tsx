import { Crosshair, MapPin, Tag } from "lucide-react";

import type { SearchResult } from "@/features/search/types";
import { NearbySpotsSection } from "@/features/spots";

import { formatGPSCoordinates, formatPlaceType } from "../utils/format";

import { PlaceDashboardSection } from "./PlaceDashboardSection";

interface PlaceGeoInfoProps {
  place: SearchResult;
}

export function PlaceGeoInfo({ place }: PlaceGeoInfoProps) {
  const hierarchy = [place.locality, place.department, place.region, place.country].filter(
    (value, index, values) => value && values.indexOf(value) === index,
  );

  return (
    <div className="grid gap-3">
      <PlaceDashboardSection title="Informations essentielles" icon={MapPin}>
        <div className="space-y-2">
          {hierarchy.length > 0 ? (
            <p className="text-foreground/85 text-sm leading-relaxed font-medium">
              {hierarchy.join(" · ")}
            </p>
          ) : (
            <p className="text-foreground/85 text-sm leading-relaxed font-medium">{place.displayName}</p>
          )}
          <p className="text-muted-foreground text-xs leading-relaxed">
            Repère administratif et accès rapide aux coordonnées du lieu sélectionné.
          </p>
        </div>
      </PlaceDashboardSection>

      <div className="grid grid-cols-2 gap-3">
        <PlaceDashboardSection title="Coordonnées" icon={Crosshair}>
          <p className="text-foreground/80 font-mono text-xs leading-relaxed">
            {formatGPSCoordinates(place.latitude, place.longitude)}
          </p>
        </PlaceDashboardSection>

        <PlaceDashboardSection title="Catégorie" icon={Tag}>
          <p className="text-foreground/90 text-sm font-semibold">{formatPlaceType(place.type)}</p>
          <p className="text-muted-foreground/65 mt-1 truncate text-xs">{place.class}</p>
        </PlaceDashboardSection>
      </div>

      <NearbySpotsSection place={place} />
    </div>
  );
}
