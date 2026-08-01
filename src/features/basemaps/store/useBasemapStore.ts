import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_BASEMAP_ID } from "../definitions";

interface BasemapState {
  currentId: string;
  setCurrentId: (id: string) => void;
}

export const useBasemapStore = create<BasemapState>()(
  persist(
    (set) => ({
      currentId: DEFAULT_BASEMAP_ID,
      setCurrentId: (id) => set({ currentId: id }),
    }),
    {
      name: "photoatlas-basemap-v2",
      // v2 : clé renommée pour invalider les données du système précédent (pré-MapTiler)
    },
  ),
);
