"use client";

import { MapPin, PanelRightOpen } from "lucide-react";

import { usePlaceStore } from "../store";

export function PlaceReopenControl() {
  const selectedPlace = usePlaceStore((state) => state.selectedPlace);
  const isOpen = usePlaceStore((state) => state.isOpen);
  const openPanel = usePlaceStore((state) => state.openPanel);

  if (!selectedPlace || isOpen) return null;

  return (
    <button
      type="button"
      onClick={openPanel}
      className="border-border bg-overlay text-foreground hover:bg-card absolute top-4 left-4 z-20 flex min-h-11 max-w-[calc(100%-2rem)] items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold shadow-xl backdrop-blur-xl transition-colors sm:px-4"
      aria-label={`Rouvrir la fiche du lieu ${selectedPlace.name}`}
    >
      <MapPin className="text-primary h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{selectedPlace.name}</span>
      <span className="text-muted-foreground shrink-0">· Voir la fiche</span>
      <PanelRightOpen
        className="text-muted-foreground hidden h-4 w-4 shrink-0 sm:block"
        aria-hidden="true"
      />
    </button>
  );
}
