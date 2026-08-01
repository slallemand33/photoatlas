import type { LucideIcon } from "lucide-react";
import { Camera, MoonStar, NotebookPen, Sparkles } from "lucide-react";

import type { SearchResult } from "@/features/search/types/search.types";

import { PlaceCloudCoverCard } from "./PlaceCloudCoverCard";
import { PlaceDashboardSection } from "./PlaceDashboardSection";
import { PlaceLightningCard } from "./PlaceLightningCard";
import { PlaceLightPollutionCard } from "./PlaceLightPollutionCard";
import { PlaceRainRadarCard } from "./PlaceRainRadarCard";

function ConditionPlaceholder({
  icon: Icon,
  description,
}: {
  icon: LucideIcon;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="bg-muted/35 text-muted-foreground/45 grid h-10 w-10 shrink-0 place-items-center rounded-xl">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-foreground/75 text-sm font-medium">Données à venir</p>
        <p className="text-muted-foreground/55 mt-0.5 text-xs leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function PlacePhotoConditions({ place }: { place: SearchResult }) {
  return (
    <div className="grid gap-3">
      <PlaceDashboardSection
        title="Photo Score"
        icon={Camera}
        status="À venir"
        className="border-primary/15 from-primary/6 via-background/35 to-background/35 bg-gradient-to-br"
      >
        <div className="flex items-center gap-4">
          <div className="border-primary/20 bg-background/45 relative grid h-20 w-20 shrink-0 place-items-center rounded-full border">
            <div className="border-primary/20 absolute inset-1.5 rounded-full border border-dashed" />
            <div className="relative text-center">
              <span className="text-foreground/30 block text-3xl leading-none font-black">—</span>
              <span className="text-muted-foreground/60 text-[10px] font-semibold">/ 100</span>
            </div>
          </div>
          <div>
            <div className="text-foreground/85 flex items-center gap-1.5 text-sm font-semibold">
              <Sparkles className="text-primary h-3.5 w-3.5" aria-hidden="true" />
              Potentiel photographique
            </div>
            <p className="text-muted-foreground/60 mt-1.5 text-xs leading-relaxed">
              Synthèse future de la météo, du ciel et de la lumière pour ce lieu.
            </p>
          </div>
        </div>
      </PlaceDashboardSection>

      <PlaceCloudCoverCard place={place} />

      <PlaceRainRadarCard place={place} />

      <PlaceLightningCard place={place} />

      <PlaceDashboardSection title="Conditions astro" icon={MoonStar} status="À venir">
        <ConditionPlaceholder
          icon={MoonStar}
          description="Lune, Voie Lactée, heures dorée et bleue."
        />
      </PlaceDashboardSection>

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
