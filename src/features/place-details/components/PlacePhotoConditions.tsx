"use client";

import { Bookmark, Compass, NotebookPen } from "lucide-react";

import { AstronomyPanelCard } from "@/features/astronomy/components/AstronomyPanelCard";
import { PhotoScoreDashboard } from "@/features/photo-score";
import { RecommendationCard } from "@/features/recommendation/components/RecommendationCard";
import type { SearchResult } from "@/features/search/types/search.types";
import { NearbyWebcamsCard } from "@/features/webcams";

import { PlaceCloudCoverCard } from "./PlaceCloudCoverCard";
import { PlaceDashboardSection } from "./PlaceDashboardSection";
import { PlaceLightningCard } from "./PlaceLightningCard";
import { PlaceLightPollutionCard } from "./PlaceLightPollutionCard";
import { PlaceRainRadarCard } from "./PlaceRainRadarCard";

export function PlacePhotoConditions({ place }: { place: SearchResult }) {
  return (
    <div className="grid gap-3">
      <RecommendationCard place={place} />
      <PhotoScoreDashboard place={place} />

      <AstronomyPanelCard place={place} />

      <PlaceCloudCoverCard place={place} />

      <PlaceRainRadarCard place={place} />

      <PlaceLightningCard place={place} />

      <NearbyWebcamsCard place={place} />

      <PlaceLightPollutionCard place={place} />

      <PlaceDashboardSection title="Notes" icon={NotebookPen} status="À venir">
        <div className="border-border/35 bg-muted/10 rounded-lg border border-dashed px-3 py-4 text-center">
          <NotebookPen className="text-muted-foreground/35 mx-auto h-4 w-4" aria-hidden="true" />
          <p className="text-muted-foreground/55 mt-2 text-xs leading-relaxed">
            Vos repérages et idées de prise de vue seront regroupés ici.
          </p>
        </div>
      </PlaceDashboardSection>

      <PlaceDashboardSection
        title="Favoris"
        icon={Bookmark}
        status="À venir"
        className="border-border/80 bg-card/90 shadow-none"
      >
        <div className="flex items-center gap-3">
          <span className="bg-muted/40 text-muted-foreground/50 grid h-9 w-9 shrink-0 place-items-center rounded-full">
            <Compass className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-foreground/80 text-sm font-medium">Garder ce spot à portée de main</p>
            <p className="text-muted-foreground/60 mt-0.5 text-xs">
              La sauvegarde sera disponible prochainement.
            </p>
          </div>
        </div>
      </PlaceDashboardSection>
    </div>
  );
}
