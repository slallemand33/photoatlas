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
    <div className="absolute right-4 bottom-12 z-10">
      {/* Menu contextuel */}
      {isOpen && (
        <>
          <div className="border-border bg-card absolute right-0 bottom-14 w-72 overflow-hidden rounded-2xl border shadow-2xl">
            <div className="border-border border-b px-4 py-4">
              <span className="text-muted-foreground text-sm font-bold tracking-[0.12em] uppercase">
                Fond de carte
              </span>
            </div>
            <div className="p-1.5">
              {BASEMAP_DEFINITIONS.map((def) => (
                <button
                  key={def.id}
                  onClick={() => handleSelect(def.id)}
                  className={cn(
                    "flex min-h-16 w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
                    currentId === def.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50 text-foreground/80",
                  )}
                  aria-pressed={currentId === def.id}
                  aria-label={`Choisir le fond ${def.name}`}
                >
                  {/* Miniature colorée */}
                  <div
                    className="border-border/20 h-9 w-14 shrink-0 rounded-md border"
                    style={{ backgroundColor: def.thumbnailColor }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-base leading-snug font-bold">{def.name}</p>
                    <p className="text-muted-foreground truncate text-sm">{def.description}</p>
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
          "flex h-12 w-12 items-center justify-center rounded-xl border shadow-lg transition-colors",
          isOpen
            ? "border-border/60 bg-accent text-accent-foreground"
            : "border-border/40 bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
        aria-label="Changer le fond de carte"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Layers className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
