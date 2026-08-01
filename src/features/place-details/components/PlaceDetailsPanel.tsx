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
      <div className="flex-1 overflow-y-auto">
        <PlaceGeoInfo place={selectedPlace} />
        <PlacePhotoConditions />
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
        className="hidden w-80 shrink-0 flex-col overflow-hidden border-l border-border/40 bg-card lg:flex"
        aria-label={`Fiche du lieu : ${selectedPlace.name}`}
      >
        <PanelContent />
      </aside>

      {/* Mobile : bottom sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[72vh] flex-col overflow-hidden rounded-t-2xl border-t border-border/40 bg-card shadow-2xl lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label={`Fiche du lieu : ${selectedPlace.name}`}
      >
        {/* Poignée tactile */}
        <div className="flex justify-center pb-1 pt-3" aria-hidden="true">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <PanelContent />
        </div>
      </div>

      {/* Fond mobile */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        onClick={closePanel}
        aria-hidden="true"
      />
    </>
  );
}
