import { BASEMAP_DEFINITIONS } from "../definitions";
import { useBasemapStore } from "../store/useBasemapStore";

export function useBasemapManager() {
  const { currentId, setCurrentId } = useBasemapStore();
  const currentDefinition =
    BASEMAP_DEFINITIONS.find((d) => d.id === currentId) ?? BASEMAP_DEFINITIONS[0]!;

  return {
    currentId,
    currentDefinition,
    definitions: BASEMAP_DEFINITIONS,
    setCurrentId,
  };
}
