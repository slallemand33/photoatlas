"use client";

import { Layers } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { BASEMAP_DEFINITIONS } from "../definitions";
import { useBasemapStore } from "../store/useBasemapStore";

export function BasemapSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentId, setCurrentId } = useBasemapStore();

  const handleSelect = (id: string) => {
    setCurrentId(id);
    setIsOpen(false);
  };

  return (
    <div className="absolute bottom-8 right-2.5 z-10">
      {/* Menu contextuel */}
      {isOpen && (
        <>
          <div className="absolute bottom-11 right-0 w-60 overflow-hidden rounded-xl border border-border/40 bg-card shadow-2xl">
            <div className="border-b border-border/20 px-3 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Fond de carte
              </span>
            </div>
            <div className="p-1.5">
              {BASEMAP_DEFINITIONS.map((def) => (
                <button
                  key={def.id}
                  onClick={() => handleSelect(def.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors",
                    currentId === def.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50 text-foreground/80",
                  )}
                  aria-pressed={currentId === def.id}
                  aria-label={`Choisir le fond ${def.name}`}
                >
                  {/* Miniature colorée */}
                  <div
                    className="h-9 w-14 shrink-0 rounded-md border border-border/20"
                    style={{ backgroundColor: def.thumbnailColor }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{def.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{def.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {/* Fermeture au clic extérieur */}
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        </>
      )}

      {/* Bouton principal */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isOpen
            ? "border-border/60 bg-accent text-accent-foreground"
            : "border-border/40 bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
        aria-label="Changer le fond de carte"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Layers className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
