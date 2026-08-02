"use client";

import { Camera, Moon, Sparkles, Sun } from "lucide-react";
import { useCallback, useState } from "react";

import { Switch } from "@/components/ui/switch";
import { usePlaceStore } from "@/features/place-details/store";
import { timelineEngine, useTimelineStore } from "@/features/timeline";

import { usePhotoGuidesStore } from "../store";
import type { PhotoGuideId } from "../types";

import { GuideLocationNotice } from "./GuideLocationNotice";

const GUIDES: Array<{ id: PhotoGuideId; label: string; icon: typeof Sun }> = [
  { id: "sun", label: "Soleil", icon: Sun },
  { id: "moon", label: "Lune", icon: Moon },
  { id: "milkyWay", label: "Voie Lactée", icon: Sparkles },
];

export function PhotoGuidesPanel() {
  const [showLocationNotice, setShowLocationNotice] = useState(false);
  const selectedPlace = usePlaceStore((state) => state.selectedPlace);
  const enabled = usePhotoGuidesStore((state) => state.enabled);
  const toggle = usePhotoGuidesStore((state) => state.toggle);
  const setAll = usePhotoGuidesStore((state) => state.setAll);
  const compositionMode = usePhotoGuidesStore((state) => state.compositionMode);
  const setCompositionMode = usePhotoGuidesStore((state) => state.setCompositionMode);
  const allVisible = Object.values(enabled).every(Boolean);
  const timeline = useTimelineStore((state) => state.result);
  const setSelectedTime = useTimelineStore((state) => state.setSelectedTime);
  const closeLocationNotice = useCallback(() => setShowLocationNotice(false), []);
  const requirePlace = () => {
    if (selectedPlace) return true;
    setShowLocationNotice(true);
    return false;
  };
  const handleToggle = (id: PhotoGuideId) => {
    if (!enabled[id] && !requirePlace()) return;
    if (!enabled[id] && timeline && (id === "sun" || id === "milkyWay")) {
      setSelectedTime(timelineEngine.getGuideFocusTime(id, timeline, new Date()));
    }
    toggle(id);
  };
  return (
    <section className="border-border border-b">
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-muted-foreground text-sm font-black tracking-[0.12em] uppercase">
          Guides photo
        </h2>
        <button
          onClick={() => {
            if (!allVisible && !requirePlace()) return;
            setAll(!allVisible);
          }}
          className="text-primary hover:bg-accent rounded-xl px-3 text-sm font-bold"
        >
          ✨ {allVisible ? "Masquer tout" : "Tout afficher"}
        </button>
      </div>
      <div className="divide-border divide-y">
        {GUIDES.map(({ id, label, icon: Icon }) => (
          <div key={id} className="flex min-h-14 items-center gap-3 px-4 py-2">
            <Icon className="text-primary h-5 w-5" aria-hidden="true" />
            <span className="flex-1 text-base font-semibold">{label}</span>
            <Switch
              checked={enabled[id]}
              onCheckedChange={() => handleToggle(id)}
              aria-label={`${enabled[id] ? "Masquer" : "Afficher"} le guide ${label}`}
            />
          </div>
        ))}
      </div>
      <div className="p-4">
        <button
          onClick={() => {
            if (!compositionMode && !requirePlace()) return;
            setCompositionMode(!compositionMode);
          }}
          aria-pressed={compositionMode}
          aria-label={
            compositionMode
              ? "Arrêter de choisir le point de prise de vue"
              : "Choisir le point de prise de vue sur la carte"
          }
          className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition-colors ${compositionMode ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted text-foreground hover:bg-accent"}`}
        >
          <Camera className="h-5 w-5" aria-hidden="true" />
          {compositionMode ? "Point de prise de vue actif" : "Choisir le point de prise de vue"}
        </button>
      </div>
      {showLocationNotice && !selectedPlace && (
        <GuideLocationNotice onClose={closeLocationNotice} />
      )}
    </section>
  );
}
