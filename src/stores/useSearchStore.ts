import { create } from "zustand";

import type { SearchResult } from "@/features/search/types";

interface SearchState {
  selectedResult: SearchResult | null;
  recentSearches: SearchResult[];
  setSelectedResult: (result: SearchResult | null) => void;
  addToRecent: (result: SearchResult) => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  selectedResult: null,
  recentSearches: [],

  setSelectedResult: (result) => set({ selectedResult: result }),

  addToRecent: (result) => {
    const recent = get().recentSearches;
    const updated = [result, ...recent.filter((r) => r.id !== result.id)].slice(0, 5);
    set({ recentSearches: updated });
  },
}));
