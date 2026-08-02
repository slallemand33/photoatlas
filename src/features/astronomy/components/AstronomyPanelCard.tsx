"use client";

import { Clock3, LoaderCircle, Moon, Sparkles, Sun, Sunrise } from "lucide-react";

import { PlaceDashboardSection } from "@/features/place-details/components/PlaceDashboardSection";
import type { SearchResult } from "@/features/search/types/search.types";
import { cn } from "@/lib/utils";

import { useAstronomy } from "../hooks";
import type { DailyLightWindows } from "../types";
import { formatAstronomyDay, formatAstronomyInterval, formatAstronomyTime } from "../utils";

function LightWindow({ windows }: { windows: DailyLightWindows }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <p className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
          Matin · {formatAstronomyDay(windows.morning.start)}
        </p>
        <p className="text-foreground mt-2 font-mono text-xl font-black tabular-nums">
          {formatAstronomyInterval(windows.morning)}
        </p>
      </div>
      <div>
        <p className="text-muted-foreground text-sm font-bold tracking-wide uppercase">
          Soir · {formatAstronomyDay(windows.evening.start)}
        </p>
        <p className="text-foreground mt-2 font-mono text-xl font-black tabular-nums">
          {formatAstronomyInterval(windows.evening)}
        </p>
      </div>
    </div>
  );
}

function AstronomyMetric({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: typeof Sun;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-border bg-background/40 rounded-xl border p-4", className)}>
      <div className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-bold tracking-wide uppercase">
        <Icon className="text-info h-5 w-5" aria-hidden="true" />
        {title}
      </div>
      {children}
    </div>
  );
}

export function AstronomyPanelCard({ place }: { place: SearchResult }) {
  const { data, isLoading, isError } = useAstronomy(place);

  return (
    <PlaceDashboardSection
      title="Astronomie"
      icon={Sparkles}
      status="Éphémérides"
      className="border-astro/30 from-astro/10 via-card to-card bg-gradient-to-br"
    >
      {isLoading ? (
        <div className="text-muted-foreground flex min-h-28 items-center justify-center gap-2 text-sm">
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          Calcul du ciel au-dessus du lieu…
        </div>
      ) : isError || !data ? (
        <p className="text-destructive py-4 text-center text-sm">
          Les éphémérides sont momentanément indisponibles pour ce lieu.
        </p>
      ) : (
        <div className="space-y-2.5">
          <AstronomyMetric
            icon={Sun}
            title="Golden Hour"
            className="border-sunrise/30 bg-sunrise/10"
          >
            <LightWindow windows={data.sun.goldenHour} />
          </AstronomyMetric>

          <AstronomyMetric icon={Sunrise} title="Blue Hour" className="border-info/30 bg-info/10">
            <LightWindow windows={data.sun.blueHour} />
          </AstronomyMetric>

          <div className="grid grid-cols-2 gap-2">
            <AstronomyMetric icon={Clock3} title="Nuit astronomique">
              <p className="text-foreground font-mono text-lg font-black tabular-nums">
                {formatAstronomyInterval(data.sun.astronomicalNight)}
              </p>
            </AstronomyMetric>

            <AstronomyMetric icon={Moon} title="Phase lunaire">
              <p className="text-foreground text-base font-bold">{data.moon.phaseName}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {data.moon.illuminatedFraction}% illuminée
              </p>
            </AstronomyMetric>
          </div>

          <AstronomyMetric
            icon={Sparkles}
            title="Voie Lactée"
            className="border-astro/30 bg-astro/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-foreground text-lg font-black">
                  {data.milkyWay.visible ? "Noyau visible" : "Noyau non visible maintenant"}
                </p>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  Azimut {data.milkyWay.core.position.azimuth}° ·{" "}
                  {data.milkyWay.core.position.cardinalDirection}
                  {" · "}hauteur {data.milkyWay.core.position.altitude}°
                </p>
              </div>
              <span
                className={cn(
                  "mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full",
                  data.milkyWay.visible ? "bg-success shadow-sm" : "bg-muted-foreground/25",
                )}
                aria-hidden="true"
              />
            </div>
            <div className="border-border mt-4 flex items-center justify-between border-t pt-3 text-sm">
              <span className="text-muted-foreground/50">Passage au plus haut</span>
              <span className="text-foreground/75 font-mono tabular-nums">
                {formatAstronomyTime(data.milkyWay.core.transit)} ·{" "}
                {data.milkyWay.core.transitAltitude}°
              </span>
            </div>
          </AstronomyMetric>

          <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 px-1 text-sm font-semibold">
            <span>Lever {formatAstronomyTime(data.sun.rise)}</span>
            <span>Coucher {formatAstronomyTime(data.sun.set)}</span>
            <span>Lune {formatAstronomyTime(data.moon.rise)}</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Astronomy Engine · horaires affichés dans le fuseau de votre appareil · horizon
            théorique.
          </p>
        </div>
      )}
    </PlaceDashboardSection>
  );
}
