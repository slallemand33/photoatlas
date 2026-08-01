"use client";

import { Loader2, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useMap } from "@/components/map";
import { usePlaceStore } from "@/features/place-details/store/usePlaceStore";
import { cn } from "@/lib/utils";
import { useSearchStore } from "@/stores/useSearchStore";

import { useSearch } from "../hooks/useSearch";
import { useSearchMarker } from "../hooks/useSearchMarker";
import type { SearchResult } from "../types";
import { getZoomForResult } from "../utils/zoom";

import { SearchResultItem } from "./SearchResultItem";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { results, isLoading } = useSearch(query);
  const map = useMap();
  const { showMarker, clearMarker } = useSearchMarker();
  const { setSelectedResult, addToRecent } = useSearchStore();
  const { selectPlace, closePanel } = usePlaceStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Raccourci clavier ⌘K / Ctrl+K
  useEffect(() => {
    const handleGlobal = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener("keydown", handleGlobal);
    return () => document.removeEventListener("keydown", handleGlobal);
  }, []);

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      setSelectedResult(result);
      addToRecent(result);
      setQuery(result.name);
      setShowSuggestions(false);
      setActiveIndex(-1);
      selectPlace(result);

      if (map) {
        // Attendre que le panneau latéral ait redimensionné la carte afin que
        // le lieu soit centré dans la zone réellement visible.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            map.resize();
            map.flyTo({
              center: [result.longitude, result.latitude],
              zoom: getZoomForResult(result),
              bearing: 0,
              pitch: 0,
              duration: 1600,
              curve: 1.35,
              essential: true,
            });
            showMarker(result.latitude, result.longitude);
          });
        });
      }
    },
    [map, setSelectedResult, addToRecent, showMarker, selectPlace],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setShowSuggestions(false);
        inputRef.current?.blur();
        return;
      }
      if (!showSuggestions || results.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = results[activeIndex];
        if (activeIndex >= 0 && target) handleSelect(target);
      }
    },
    [showSuggestions, results, activeIndex, handleSelect],
  );

  const handleClear = () => {
    setQuery("");
    setSelectedResult(null);
    clearMarker();
    closePanel();
    setShowSuggestions(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-2 hidden flex-1 md:block md:max-w-xs lg:max-w-sm"
    >
      {/* Champ de saisie */}
      <div
        className={cn(
          "bg-muted/20 flex h-9 items-center gap-2 rounded-md border px-3 text-sm transition-colors",
          showSuggestions
            ? "border-border/80 bg-muted/40"
            : "border-border/50 hover:border-border/70",
        )}
      >
        <Search className="text-muted-foreground/60 h-4 w-4 shrink-0" aria-hidden="true" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            const nextQuery = e.target.value;
            setQuery(nextQuery);
            setSelectedResult(null);
            setShowSuggestions(nextQuery.trim().length >= 3);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            if (results.length > 0 && query.trim().length >= 3) setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher un lieu…"
          className="text-foreground placeholder:text-muted-foreground/60 flex-1 bg-transparent text-sm focus:outline-none"
          aria-label="Rechercher un lieu"
          aria-autocomplete="list"
          aria-controls="search-listbox"
          aria-activedescendant={activeIndex >= 0 ? `search-option-${activeIndex}` : undefined}
          role="combobox"
          aria-expanded={showSuggestions}
          autoComplete="off"
          spellCheck={false}
        />

        {isLoading && (
          <Loader2
            className="text-muted-foreground/40 h-3.5 w-3.5 animate-spin"
            aria-hidden="true"
          />
        )}

        {query && !isLoading && (
          <button
            onClick={handleClear}
            className="text-muted-foreground/40 hover:text-muted-foreground shrink-0 transition-colors"
            aria-label="Effacer la recherche"
            tabIndex={-1}
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}

        {!query && (
          <kbd
            className="bg-muted/60 text-muted-foreground/50 hidden shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] lg:block"
            aria-label="Raccourci clavier : Commande K"
          >
            ⌘K
          </kbd>
        )}
      </div>

      {/* Liste de suggestions */}
      {showSuggestions && results.length > 0 && (
        <ul
          id="search-listbox"
          role="listbox"
          aria-label="Suggestions de lieux"
          className="border-border/40 bg-card absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-lg border py-1 shadow-xl"
        >
          {results.map((result, index) => (
            <SearchResultItem
              key={result.id}
              result={result}
              isActive={index === activeIndex}
              onSelect={() => handleSelect(result)}
              onMouseEnter={() => setActiveIndex(index)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
