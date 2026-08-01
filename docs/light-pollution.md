# Couche Pollution Lumineuse — Architecture de référence

> Cette couche est le **modèle de référence** pour toutes les futures couches de PhotoAtlas.  
> Lire ce document avant de développer toute nouvelle couche.

---

## Rôle de la couche

La couche "Pollution lumineuse" affiche la luminosité artificielle nocturne mondiale en utilisant les données du *World Atlas of Artificial Night Sky Brightness* (Falchi et al. 2016), servies par [lightpollutionmap.info](https://www.lightpollutionmap.info).

Elle est indispensable pour l'astrophotographie : elle permet de choisir des lieux avec un ciel noir.

---

## Architecture du module

```
src/features/layers/light-pollution/
├── components/
│   ├── LightPollutionLegend.tsx   ← légende couleurs Bortle (indépendante)
│   └── index.ts
├── hooks/                         ← futurs hooks spécifiques (accès API, etc.)
├── services/
│   └── lightPollutionService.ts   ← URL des tuiles + spec source MapLibre
├── types/                         ← futurs types spécifiques à la couche
├── utils/                         ← futurs utilitaires
├── definition.ts                  ← LayerDefinition complète (cœur du module)
└── index.ts                       ← exports publics
```

### Principe d'isolation totale

Ce module **ne connaît pas** :
- le composant `MapView`
- le `LayerStore`
- les autres couches
- l'interface utilisateur (Sidebar, LayerItem)

Il expose uniquement une `LayerDefinition` que le Layer Manager utilise.

---

## Flux de données

```
Utilisateur active "Pollution lumineuse"
  ↓
LayerItem → useLayerStore.toggleLayer("light-pollution")
  ↓
Zustand notifie les abonnés
  ↓
MapCanvas (abonné via useLayerStore) → syncLayersToMap(map, layerStates)
  ↓
syncLayers.ts :
  registry.get("light-pollution").getSourceSpec(state) → RasterSourceSpecification
  map.addSource("light-pollution", sourceSpec)
  registry.get("light-pollution").getLayerSpecs(state) → [RasterLayerSpecification]
  map.addLayer(layerSpec)
  ↓
MapLibre GL rend les tuiles raster sur la carte
```

---

## Source de données

### Source actuelle

| Propriété | Valeur |
|---|---|
| Fournisseur | lightpollutionmap.info (Jurij Stare) |
| Données | World Atlas 2016 — Falchi et al. |
| Format | Tuiles raster XYZ (PNG) |
| URL | `https://www.lightpollutionmap.info/tiles/{z}/{x}/{y}.png` |
| Zoom max | 8 |
| Licence | Creative Commons BY NC SA |

### Changer de source

**Modifier une seule ligne** dans `services/lightPollutionService.ts` :

```typescript
// Remplacer par n'importe quelle URL de tuiles raster compatible MapLibre
export const LIGHT_POLLUTION_TILE_URL = "https://new-source/{z}/{x}/{y}.png";
```

### Alternatives documentées

| Source | URL | Notes |
|---|---|---|
| NASA Black Marble | WMS GIBS | Lumières nocturnes VIIRS, pas de couleurs Bortle |
| LightPollution Map 2023 | `...tiles/viirs_2023/...` | Plus récent, même format |

---

## Connexion avec MapLibre

La couche fournit deux méthodes à `LayerDefinition` :

### `getSourceSpec(state)` → `RasterSourceSpecification`

```typescript
getSourceSpec: () => ({
  type: "raster",
  tiles: [LIGHT_POLLUTION_TILE_URL],
  tileSize: 256,
  attribution: "...",
  minzoom: 0,
  maxzoom: 8,
}),
```

### `getLayerSpecs(state)` → `RasterLayerSpecification[]`

```typescript
getLayerSpecs: (state) => ([{
  id: "light-pollution-raster",
  type: "raster",
  source: "light-pollution",
  paint: { "raster-opacity": state.opacity },
}]),
```

L'`id` de la source MapLibre = l'`id` de la `LayerDefinition` (`"light-pollution"`).  
L'`id` du layer MapLibre = `"${layerId}-raster"` par convention.

---

## Synchronisation MapView ↔ Layer Manager

Le composant `MapCanvas` (`components/map/MapView.tsx`) :

1. S'abonne au `useLayerStore` avec `useLayerStore(s => s.layers)`
2. Appelle `syncLayersToMap(map, layerStates)` à chaque changement
3. La carte est exposée via `useMap()` uniquement **après** l'événement `'load'`, garantissant que `map.addSource()` est toujours disponible

```
MapCanvas
  ├── useEffect([setMap]) → initialise MapLibre, appelle setMap() après 'load'
  └── useEffect([map, layerStates]) → syncLayersToMap(map, layerStates)
```

### Gestion des états dans `syncLayers.ts`

| Situation | Action |
|---|---|
| visible=true, source absente | `addSource()` + `addLayer()` |
| visible=false, source présente | `removeLayer()` + `removeSource()` |
| visible=true, source présente | `setPaintProperty("raster-opacity", opacity)` |

---

## Légende

`LightPollutionLegend` est un composant React **indépendant** qui affiche l'échelle de Bortle simplifiée. Il est référencé dans la `LayerDefinition` via la propriété :

```typescript
LegendComponent: LightPollutionLegend,
```

`LayerItem` rend automatiquement `<LegendComponent />` quand la couche est active :

```tsx
{layer.state.visible && LegendComp && <LegendComp />}
```

---

## Comment créer une nouvelle couche similaire

### 1. Créer le dossier

```
src/features/layers/<nom-couche>/
├── components/   (légende si nécessaire)
├── services/     (URL des tuiles ou client HTTP)
├── definition.ts
└── index.ts
```

### 2. Implémenter la `LayerDefinition`

```typescript
// definition.ts
export const myLayer: LayerDefinition = {
  id: "my-layer",           // ← identifiant unique
  name: "Ma Couche",
  group: "weather",         // ← catégorie
  type: "raster",
  icon: MyIcon,
  defaultOpacity: 0.7,
  defaultVisible: false,
  defaultZIndex: 20,
  // ...metadata, source, description

  getSourceSpec: () => ({
    type: "raster",
    tiles: ["https://.../{z}/{x}/{y}.png"],
    tileSize: 256,
  }),

  getLayerSpecs: (state) => ([{
    id: "my-layer-raster",  // ← convention: "${id}-${type}"
    type: "raster",
    source: "my-layer",
    paint: { "raster-opacity": state.opacity },
  }]),

  LegendComponent: MyLegend, // optionnel
};
```

### 3. Enregistrer dans `definitions/index.ts`

```typescript
import { myLayer } from "../my-layer/definition";

export const LAYER_DEFINITIONS: LayerDefinition[] = [
  // ... couches existantes ...
  myLayer, // ← ajouter ici
];
```

**C'est tout.** La couche apparaît dans la Sidebar, ses contrôles fonctionnent, et elle s'affiche sur la carte dès son activation.

---

## Ce que ce modèle NE fait PAS (délibérément)

| Fonctionnalité | Raison de l'absence |
|---|---|
| Appels API en temps réel | Données statiques (atlas annuel) |
| Cache TanStack Query | Pas de requête réseau (tuiles gérées par MapLibre) |
| Store propre à la couche | Inutile — le Layer Store gère tout |
| Logique de filtrage | Couche future (années/saisons) |

---

*Dernière mise à jour : sprint 6 — Couche Pollution Lumineuse*
