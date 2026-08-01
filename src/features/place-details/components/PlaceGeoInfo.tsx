import { Bookmark, Compass, Crosshair, MapPin, Tag } from "lucide-react";

import type { SearchResult } from "@/features/search/types";

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
      <PlaceDashboardSection title="Informations générales" icon={MapPin}>
        <p className="text-foreground/90 text-sm leading-relaxed font-medium">{place.name}</p>
        {hierarchy.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {hierarchy.map((item) => (
              <span
                key={item}
                className="border-border/25 bg-muted/30 text-muted-foreground rounded-md border px-2 py-1 text-[11px]"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </PlaceDashboardSection>

      <div className="grid grid-cols-2 gap-3">
        <PlaceDashboardSection title="Coordonnées" icon={Crosshair}>
          <p className="text-foreground/80 font-mono text-[11px] leading-relaxed">
            {formatGPSCoordinates(place.latitude, place.longitude)}
          </p>
        </PlaceDashboardSection>

        <PlaceDashboardSection title="Catégorie" icon={Tag}>
          <p className="text-foreground/90 text-sm font-semibold">{formatPlaceType(place.type)}</p>
          <p className="text-muted-foreground/65 mt-1 truncate text-[11px]">{place.class}</p>
        </PlaceDashboardSection>
      </div>

      <PlaceDashboardSection title="Favoris" icon={Bookmark} status="À venir">
        <div className="flex items-center gap-3">
          <span className="bg-muted/40 text-muted-foreground/50 grid h-9 w-9 shrink-0 place-items-center rounded-full">
            <Compass className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-foreground/80 text-sm font-medium">
              Garder ce spot à portée de main
            </p>
            <p className="text-muted-foreground/60 mt-0.5 text-xs">
              La sauvegarde sera disponible prochainement.
            </p>
          </div>
        </div>
      </PlaceDashboardSection>
    </div>
  );
}
