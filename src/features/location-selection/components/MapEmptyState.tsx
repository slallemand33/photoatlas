"use client";

import { MapPin } from "lucide-react";

import { usePlaceStore } from "@/features/place-details/store";

export function MapEmptyState() {
  const selectedPlace = usePlaceStore((state) => state.selectedPlace);

  if (selectedPlace) return null;

  return (
    <section className="pointer-events-none absolute inset-x-4 top-[18%] z-10 flex justify-center sm:inset-x-6 sm:top-[20%] lg:top-1/3 lg:-translate-y-1/2">
      <div className="border-border/60 bg-card/95 text-foreground w-[min(24rem,100%)] rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-md sm:px-5 sm:py-4">
        <div className="flex items-start gap-3">
          <span className="bg-primary/10 text-primary grid h-10 w-10 shrink-0 place-items-center rounded-xl">
            <MapPin className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight sm:text-lg">Choisissez un lieu</h2>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed sm:hidden">
              Touchez la carte ou recherchez un lieu
            </p>
            <p className="text-muted-foreground mt-1 hidden text-sm leading-relaxed sm:block">
              Cliquez sur la carte ou recherchez un lieu
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}