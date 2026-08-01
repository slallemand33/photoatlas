# Système de fonds de carte — PhotoAtlas

> Architecture complète pour la gestion des basemaps dans PhotoAtlas.

---

## Philosophie

Le fond de carte est l'élément permanent de l'interface. Il ne doit jamais être codé en dur dans `MapView`. Chaque fond est une ressource indépendante, échangeable sans modifier aucun composant cartographique.

**Règle absolue :** `MapView` ne connaît aucune URL de fond de carte. Il lit uniquement le store.

---

## Architecture

```
features/basemaps/
├── types/
│   └── basemap.types.ts       ← BasemapDefinition, BasemapCategory
├── definitions/
│   ├── standard.ts            ← CARTO Positron
│   ├── dark.ts                ← CARTO Dark Matter
│   ├── satellite.ts           ← ESRI World Imagery (inline style)
│   ├── outdoor.ts             ← OpenFreeMap Bright
│   ├── topographic.ts         ← OpenTopoMap (inline style)
│   └── index.ts               ← BASEMAP_DEFINITIONS[]
├── store/
│   └── useBasemapStore.ts     ← Zustand + persist (localStorage)
├── hooks/
│   └── useBasemapManager.ts   ← hook public (currentDef + actions)
├── utils/
│   └── applyBasemap.ts        ← map.setStyle() + re-sync couches
└── components/
    └── BasemapSwitcher.tsx    ← bouton flottant + menu contextuel
```

---

## Fournisseurs retenus

### CARTO Basemaps (Standard + Dark)

| Style | URL |
|---|---|
| Positron (Standard) | `https://basemaps.cartocdn.com/gl/positron-gl-style/style.json` |
| Dark Matter (Dark) | `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json` |

**Justification :**
- Gratuit, sans clé API
- Qualité comparable à Apple Maps
- Vector tiles avec zoom jusqu'à 22
- Basé sur OpenMapTiles — standard industrie
- Utilisé par Uber H3, Foursquare, ArcGIS

### ESRI World Imagery (Satellite)

URL : `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`

Style inline (pas d'URL de style JSON — style MapLibre généré localement) :
- Résolution sub-métrique dans les zones couvertes
- Zoom jusqu'à 20-23 selon les régions
- Gratuit pour usage non-commercial avec attribution

### OpenFreeMap Bright (Outdoor)

URL : `https://tiles.openfreemap.org/styles/bright`

- Détail cartographique important pour la planification terrain
- Zoom 22

### OpenTopoMap (Topographique)

Tiles : `https://[a-c].tile.opentopomap.org/{z}/{x}/{y}.png`

Style inline généré localement. Zoom max 17.

---

## Flux de données

```
useBasemapStore.currentId (Zustand + localStorage)
  ↓
MapCanvas.useEffect([currentBasemapId, map]) détecte le changement
  ↓
applyBasemap(map, newDef) → map.setStyle(newDef.styleSource)
  ↓
map.once('style.load', ...) → syncLayersToMap(map, layerStates)
  ↓
Toutes les couches actives sont ré-ajoutées au nouveau fond
```

**Point clé :** après `map.setStyle()`, MapLibre supprime toutes les sources et couches personnalisées. Le callback `onLoaded` garantit que `syncLayersToMap` s'exécute APRÈS le rechargement complet du nouveau style.

---

## Niveaux de zoom

| Fond | minZoom | maxZoom | Usage |
|---|---|---|---|
| Standard (CARTO) | 1 | 22 | Général |
| Dark (CARTO) | 1 | 22 | Nuit |
| Satellite (ESRI) | 0 | 20 | Reconnaissance |
| Outdoor (OpenFreeMap) | 1 | 22 | Terrain |
| Topographique | 0 | 17 | Relief |

La carte est configurée avec `maxZoom: 22` globalement, limitée par le fond actif.

---

## Persistence

Le dernier fond sélectionné est mémorisé via Zustand `persist` middleware :
```typescript
persist(
  (set) => ({ currentId: 'standard', setCurrentId: (id) => set({ currentId: id }) }),
  { name: 'photoatlas-basemap' }  // clé localStorage
)
```

Au redémarrage, le fond précédent est restauré automatiquement AVANT le premier render de la carte (via `useBasemapStore.getState().currentId` dans `useState` initializer).

---

## Ajouter un nouveau fond de carte

### 1. Créer la définition

```typescript
// features/basemaps/definitions/my-basemap.ts
import type { BasemapDefinition } from "../types";

export const myBasemap: BasemapDefinition = {
  id: "my-basemap",
  name: "Mon Fond",
  description: "Description courte",
  provider: "Fournisseur",
  styleSource: "https://tiles.example.com/style.json",  // ou objet StyleSpecification
  category: "standard",
  dark: false,
  maxZoom: 22,
  minZoom: 0,
  attribution: "© Mon Fournisseur",
  thumbnailColor: "#a0b0c0",
};
```

### 2. L'ajouter dans `definitions/index.ts`

```typescript
import { myBasemap } from "./my-basemap";

export const BASEMAP_DEFINITIONS: BasemapDefinition[] = [
  standardBasemap,
  darkBasemap,
  satelliteBasemap,
  outdoorBasemap,
  topographicBasemap,
  myBasemap,  // ← ajouter ici
];
```

**C'est tout.** Le fond apparaît automatiquement dans le sélecteur `BasemapSwitcher`.

### Cas des fonds raster (sans style JSON)

Pour les fonds raster (tuiles PNG/JPG), créer un objet `StyleSpecification` inline :

```typescript
import type { StyleSpecification } from "maplibre-gl";

const myRasterStyle: StyleSpecification = {
  version: 8,
  sources: {
    "my-source": {
      type: "raster",
      tiles: ["https://tiles.example.com/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© Mon fournisseur",
    },
  },
  layers: [{
    id: "my-raster-layer",
    type: "raster",
    source: "my-source",
  }],
};
```

---

*Dernière mise à jour : sprint 10 — Système de fonds de carte*
