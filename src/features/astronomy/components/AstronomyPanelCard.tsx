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
        <p className="text-muted-foreground/45 text-[9px] font-semibold tracking-wider uppercase">
          Matin · {formatAstronomyDay(windows.morning.start)}
        </p>
        <p className="text-foreground/85 mt-1 font-mono text-xs font-semibold tabular-nums">
          {formatAstronomyInterval(windows.morning)}
        </p>
      </div>
      <div>
        <p className="text-muted-foreground/45 text-[9px] font-semibold tracking-wider uppercase">
          Soir · {formatAstronomyDay(windows.evening.start)}
        </p>
        <p className="text-foreground/85 mt-1 font-mono text-xs font-semibold tabular-nums">
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
    <div className={cn("border-border/25 bg-background/35 rounded-xl border p-3", className)}>
      <div className="text-muted-foreground/60 mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
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
      className="via-background/40 border-indigo-300/20 bg-gradient-to-br from-indigo-500/8 to-violet-500/5"
    >
      {isLoading ? (
        <div className="text-muted-foreground/60 flex min-h-28 items-center justify-center gap-2 text-xs">
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          Calcul du ciel au-dessus du lieu…
        </div>
      ) : isError || !data ? (
        <p className="text-destructive/80 py-4 text-center text-xs">
          Les éphémérides sont momentanément indisponibles pour ce lieu.
        </p>
      ) : (
        <div className="space-y-2.5">
          <AstronomyMetric
            icon={Sun}
            title="Golden Hour"
            className="border-amber-300/20 bg-amber-400/6"
          >
            <LightWindow windows={data.sun.goldenHour} />
          </AstronomyMetric>

          <AstronomyMetric
            icon={Sunrise}
            title="Blue Hour"
            className="border-sky-300/20 bg-sky-400/6"
          >
            <LightWindow windows={data.sun.blueHour} />
          </AstronomyMetric>

          <div className="grid grid-cols-2 gap-2">
            <AstronomyMetric icon={Clock3} title="Nuit astronomique">
              <p className="text-foreground/85 font-mono text-xs font-semibold tabular-nums">
                {formatAstronomyInterval(data.sun.astronomicalNight)}
              </p>
            </AstronomyMetric>

            <AstronomyMetric icon={Moon} title="Phase lunaire">
              <p className="text-foreground/90 text-xs font-bold">{data.moon.phaseName}</p>
              <p className="text-muted-foreground/55 mt-1 text-[10px]">
                {data.moon.illuminatedFraction}% illuminée
              </p>
            </AstronomyMetric>
          </div>

          <AstronomyMetric
            icon={Sparkles}
            title="Voie Lactée"
            className="border-violet-300/20 bg-violet-400/6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-foreground/90 text-sm font-black">
                  {data.milkyWay.visible ? "Noyau visible" : "Noyau non visible maintenant"}
                </p>
                <p className="text-muted-foreground/55 mt-1 text-[10px]">
                  Azimut {data.milkyWay.core.position.azimuth}° ·{" "}
                  {data.milkyWay.core.position.cardinalDirection}
                  {" · "}hauteur {data.milkyWay.core.position.altitude}°
                </p>
              </div>
              <span
                className={cn(
                  "mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full",
                  data.milkyWay.visible
                    ? "bg-emerald-400 shadow-sm shadow-emerald-400/60"
                    : "bg-muted-foreground/25",
                )}
                aria-hidden="true"
              />
            </div>
            <div className="border-border/20 mt-2.5 flex items-center justify-between border-t pt-2 text-[10px]">
              <span className="text-muted-foreground/50">Passage au plus haut</span>
              <span className="text-foreground/75 font-mono tabular-nums">
                {formatAstronomyTime(data.milkyWay.core.transit)} ·{" "}
                {data.milkyWay.core.transitAltitude}°
              </span>
            </div>
          </AstronomyMetric>

          <div className="text-muted-foreground/45 flex items-center justify-between px-1 text-[9px]">
            <span>Lever {formatAstronomyTime(data.sun.rise)}</span>
            <span>Coucher {formatAstronomyTime(data.sun.set)}</span>
            <span>Lune {formatAstronomyTime(data.moon.rise)}</span>
          </div>
          <p className="text-muted-foreground/35 text-[8px] leading-relaxed">
            Astronomy Engine · horaires affichés dans le fuseau de votre appareil · horizon
            théorique.
          </p>
        </div>
      )}
    </PlaceDashboardSection>
  );
}
