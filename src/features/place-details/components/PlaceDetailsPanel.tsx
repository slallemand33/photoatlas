"use client";

import { usePlaceStore } from "../store/usePlaceStore";

import { PlaceGeoInfo } from "./PlaceGeoInfo";
import { PlaceHeader } from "./PlaceHeader";
import { PlacePhotoConditions } from "./PlacePhotoConditions";

function PanelContent() {
  const { selectedPlace, closePanel } = usePlaceStore();
  if (!selectedPlace) return null;

  return (
    <>
      <PlaceHeader place={selectedPlace} onClose={closePanel} />
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
        <PlaceGeoInfo place={selectedPlace} />
        <div className="my-7 flex items-center gap-4" aria-hidden="true">
          <div className="bg-border/25 h-px flex-1" />
          <span className="text-muted-foreground text-sm font-bold tracking-[0.12em] uppercase">
            Tableau de bord photo
          </span>
          <div className="bg-border/25 h-px flex-1" />
        </div>
        <PlacePhotoConditions place={selectedPlace} />
      </div>
    </>
  );
}

export function PlaceDetailsPanel() {
  const { isOpen, selectedPlace, closePanel } = usePlaceStore();

  if (!isOpen || !selectedPlace) return null;

  return (
    <>
      {/* Desktop : panneau latéral droit */}
      <aside
        className="animate-in slide-in-from-right-4 border-border bg-card hidden w-[min(32rem,42vw)] shrink-0 flex-col overflow-hidden border-l shadow-2xl duration-300 lg:flex"
        aria-label={`Fiche du lieu : ${selectedPlace.name}`}
        aria-live="polite"
      >
        <PanelContent />
      </aside>

      {/* Mobile : bottom sheet */}
      <div
        className="animate-in slide-in-from-bottom-6 border-border bg-card fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] flex-col overflow-hidden rounded-t-3xl border-t shadow-2xl duration-300 lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label={`Fiche du lieu : ${selectedPlace.name}`}
      >
        {/* Poignée tactile */}
        <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
          <div className="bg-muted-foreground/20 h-1 w-10 rounded-full" />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <PanelContent />
        </div>
      </div>

      {/* Fond mobile */}
      <div
        className="bg-overlay fixed inset-0 z-40 backdrop-blur-sm lg:hidden"
        onClick={closePanel}
        aria-hidden="true"
      />
    </>
  );
}
