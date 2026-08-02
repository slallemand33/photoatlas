import { NotebookPen } from "lucide-react";

import { AstronomyPanelCard } from "@/features/astronomy/components/AstronomyPanelCard";
import { PhotoScoreDashboard } from "@/features/photo-score";
import type { SearchResult } from "@/features/search/types/search.types";
import { TodayTimelineCard } from "@/features/timeline";

import { PlaceCloudCoverCard } from "./PlaceCloudCoverCard";
import { PlaceDashboardSection } from "./PlaceDashboardSection";
import { PlaceLightningCard } from "./PlaceLightningCard";
import { PlaceLightPollutionCard } from "./PlaceLightPollutionCard";
import { PlaceRainRadarCard } from "./PlaceRainRadarCard";

export function PlacePhotoConditions({ place }: { place: SearchResult }) {
  return (
    <div className="grid gap-3">
      <PhotoScoreDashboard place={place} />

      <TodayTimelineCard place={place} />

      <PlaceCloudCoverCard place={place} />

      <PlaceRainRadarCard place={place} />

      <PlaceLightningCard place={place} />

      <AstronomyPanelCard place={place} />

      <PlaceLightPollutionCard place={place} />

      <PlaceDashboardSection title="Notes" icon={NotebookPen} status="À venir">
        <div className="border-border/35 bg-muted/10 rounded-lg border border-dashed px-3 py-4 text-center">
          <NotebookPen className="text-muted-foreground/35 mx-auto h-4 w-4" aria-hidden="true" />
          <p className="text-muted-foreground/55 mt-2 text-xs leading-relaxed">
            Vos repérages et idées de prise de vue seront regroupés ici.
          </p>
        </div>
      </PlaceDashboardSection>
    </div>
  );
}
