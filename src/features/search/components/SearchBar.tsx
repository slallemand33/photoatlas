"use client";

import { Loader2, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useMap } from "@/components/map";
import { cn } from "@/lib/utils";
import { usePlaceStore } from "@/features/place-details/store/usePlaceStore";
import { useSearchStore } from "@/stores/useSearchStore";

import { useSearch } from "../hooks/useSearch";
import { useSearchMarker } from "../hooks/useSearchMarker";
import type { SearchResult } from "../types";
import { getZoomForResult } from "../utils/zoom";

import { SearchInfoPanel } from "./SearchInfoPanel";
import { SearchResultItem } from "./SearchResultItem";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { results, isLoading } = useSearch(query);
  const map = useMap();
  const { showMarker } = useSearchMarker();
  const { selectedResult, setSelectedResult, addToRecent } = useSearchStore();
  const selectPlace = usePlaceStore((s) => s.selectPlace);

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

  // Afficher les suggestions quand les résultats arrivent
  useEffect(() => {
    if (results.length > 0 && query.trim().length >= 3) {
      setShowSuggestions(true);
      setActiveIndex(-1);
    }
  }, [results, query]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      setSelectedResult(result);
      addToRecent(result);
      setQuery(result.name);
      setShowSuggestions(false);
      setActiveIndex(-1);
      selectPlace(result);

      if (map) {
        map.flyTo({
          center: [result.longitude, result.latitude],
          zoom: getZoomForResult(result),
          duration: 1200,
          essential: true,
        });
        showMarker(result.latitude, result.longitude);
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
    setShowSuggestions(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const showInfoPanel =
    selectedResult !== null && !showSuggestions && query === selectedResult.name;

  return (
    <div
      ref={containerRef}
      className="relative mx-2 hidden flex-1 md:block md:max-w-xs lg:max-w-sm"
    >
      {/* Champ de saisie */}
      <div
        className={cn(
          "flex h-9 items-center gap-2 rounded-md border bg-muted/20 px-3 text-sm transition-colors",
          showSuggestions || showInfoPanel
            ? "border-border/80 bg-muted/40"
            : "border-border/50 hover:border-border/70",
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedResult(null);
            if (e.target.value.trim().length < 3) setShowSuggestions(false);
          }}
          onFocus={() => {
            if (results.length > 0 && query.trim().length >= 3) setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher un lieu…"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
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
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground/40" aria-hidden="true" />
        )}

        {query && !isLoading && (
          <button
            onClick={handleClear}
            className="shrink-0 text-muted-foreground/40 transition-colors hover:text-muted-foreground"
            aria-label="Effacer la recherche"
            tabIndex={-1}
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}

        {!query && (
          <kbd
            className="hidden shrink-0 rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/50 lg:block"
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
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border/40 bg-card py-1 shadow-xl"
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

      {/* Panneau d'informations */}
      {showInfoPanel && (
        <SearchInfoPanel result={selectedResult} onClose={handleClear} />
      )}
    </div>
  );
}
