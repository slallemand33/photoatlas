# Architecture du moteur cartographique — PhotoAtlas

> Document technique de référence.  
> À lire avant de développer toute couche, widget ou service lié à la carte.

---

## Philosophie

PhotoAtlas est une plateforme destinée à accueillir des dizaines de couches cartographiques indépendantes. L'architecture doit permettre d'ajouter une nouvelle couche sans modifier le reste de l'application. Elle repose sur trois principes :

1. **Ignorance mutuelle** — chaque module ne connaît que la couche immédiatement en dessous de lui dans la hiérarchie.
2. **Séparation définition / état** — ce qu'est une couche (statique) est séparé de son état runtime (dynamique).
3. **Le moteur ne connaît pas les couches** — la carte parle uniquement au Layer Manager, jamais directement à une couche.

---

## Vue d'ensemble

```
┌─────────────────────────────────────────────┐
│              Utilisateur / UI               │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Sidebar · Widgets · Panneaux        │
└──────────────────┬──────────────────────────┘
                   │ lit / écrit
┌──────────────────▼──────────────────────────┐
│            Layer Manager Store              │
│          (Zustand — état global)            │
└──────┬───────────────────────┬──────────────┘
       │ enregistre            │ notifie
┌──────▼──────┐     ┌──────────▼──────────────┐
│  Layer      │     │      Map Engine         │
│  Registry   │◄────│   (MapContainer.tsx)    │
└──────┬──────┘     └─────────────────────────┘
       │                        ▲
┌──────▼──────────────────────────────────────┐
│           Layer Definitions                 │
│  getLayerSpecs() · getSourceSpec()          │
└──────────────────┬──────────────────────────┘
                   │ utilise
┌──────────────────▼──────────────────────────┐
│             Data Sources                    │
│        (TanStack Query + transform)         │
└──────────────────┬──────────────────────────┘
                   │ appelle
┌──────────────────▼──────────────────────────┐
│               Services                      │
│            (clients HTTP bruts)             │
└──────────────────┬──────────────────────────┘
                   │
                  API externes
```

---

## Modules et responsabilités

### 1. Map Engine (`features/map/`)

Le moteur cartographique est le seul module qui instancie MapLibre GL.

**Responsabilités :**
- Initialiser et détruire l'instance MapLibre
- S'abonner au Layer Manager Store
- Quand `layers` change : ajouter, retirer ou mettre à jour les sources et layers MapLibre
- Exposer l'instance MapLibre via le hook `useMap()`
- Gérer les contrôles natifs (zoom, boussole, géolocalisation)

**Ne doit jamais :**
- Importer une couche spécifique (ex. `light-pollution`)
- Appeler une API externe
- Contenir de logique métier

```
features/map/
├── components/
│   ├── MapContainer.tsx     ← wrapper React de l'instance MapLibre
│   └── MapControls.tsx      ← boutons zoom, boussole, géoloc
├── hooks/
│   ├── useMap.ts            ← accès à l'instance (contexte interne)
│   └── useMapReady.ts       ← booléen : carte initialisée ?
└── index.ts
```

---

### 2. Layer Registry (`features/layers/_engine/registry.ts`)

Annuaire statique de toutes les couches disponibles dans l'application.

**Responsabilités :**
- Stocker les `LayerDefinition` enregistrées au démarrage
- Permettre la récupération d'une couche par ID ou par groupe
- Ne jamais stocker d'état runtime

**Principe d'enregistrement :**

Chaque module de couche s'enregistre lui-même dans un fichier central `features/layers/index.ts`. L'application importe ce fichier une seule fois. Ajouter une couche = ajouter une ligne dans ce fichier.

```ts
// features/layers/index.ts
import { registry } from './_engine/registry';
import { osmLayer } from './base-maps/osm';
import { lightPollutionLayer } from './light-pollution';
import { cloudCoverLayer } from './weather/cloud-cover';

registry.register(osmLayer);
registry.register(lightPollutionLayer);
registry.register(cloudCoverLayer);
```

---

### 3. Layer Manager Store (`stores/useLayerStore.ts`)

État global des couches actives. C'est le cœur du système.

**Responsabilités :**
- Maintenir la liste des couches actives et leur état runtime (`LayerState`)
- Exposer les actions : activer, désactiver, modifier l'opacité, réordonner
- Notifier le Map Engine via Zustand lorsque l'état change

**Ne doit jamais :**
- Connaître MapLibre
- Appeler une API
- Contenir de logique de rendu

---

### 4. Layer Definition (`features/layers/<nom>/layer.ts`)

Décrit ce qu'est une couche et comment la rendre.

**Responsabilités :**
- Fournir les métadonnées (id, nom, groupe, description)
- Implémenter `getLayerSpecs()` → spec MapLibre GL native
- Implémenter `getSourceSpec()` → spec de source MapLibre GL (tuiles, GeoJSON…)
- Déclarer une configuration par défaut

**Ne doit jamais :**
- Appeler une API
- Gérer son propre état
- Dépendre d'une autre couche

---

### 5. Data Source (`features/layers/<nom>/source.ts`)

Responsable de la récupération et de la transformation des données.

**Responsabilités :**
- Appeler le Service HTTP correspondant
- Transformer la réponse brute en format utilisable par la couche
- Utiliser TanStack Query pour le cache et le cycle de vie des requêtes

**Flux :**
```
Service (HTTP brut) → Data Source (fetch + transform) → Layer Definition (spec MapLibre)
```

**Ne doit jamais :**
- Parler directement à MapLibre
- Être importé par un composant React directement

---

### 6. Service (`services/<api>/client.ts`)

Client HTTP brut vers une API externe.

**Responsabilités :**
- Construire les URLs et les paramètres de requête
- Parser et typer la réponse brute
- Gérer les erreurs HTTP

**Ne doit jamais :**
- Transformer les données pour MapLibre
- Connaître les couches qui l'utilisent

---

### 7. Widgets (`widgets/`)

Composants d'affichage d'information contextuelle, indépendants de la carte.

**Responsabilités :**
- Afficher des données (météo, lune, spot) dans la sidebar ou en overlay
- Gérer leur propre récupération de données via TanStack Query

**Ne doit jamais :**
- Accéder à l'instance MapLibre
- Dépendre d'un autre widget
- Être couplé à l'activation d'une couche

---

## Interfaces TypeScript

### Types géographiques

```ts
// types/geo.ts

type Coordinates = [longitude: number, latitude: number];
type BoundingBox = [west: number, south: number, east: number, north: number];

interface MapViewport {
  center: Coordinates;
  zoom: number;
  bearing: number;
  pitch: number;
}
```

### Interfaces des couches

```ts
// types/layer.ts

type LayerGroup =
  | 'base-map'
  | 'weather'
  | 'astronomy'
  | 'light-pollution'
  | 'spots'
  | 'navigation';

// Ce qu'est une couche (statique, immuable)
interface LayerDefinition {
  id: string;
  name: string;
  group: LayerGroup;
  description: string;
  defaultConfig: LayerConfig;
  getLayerSpecs(config: LayerConfig): MapLibreLayerSpec[];
  getSourceSpec(config: LayerConfig): MapLibreSourceSpec | null;
}

// Paramètres configurables par l'utilisateur
interface LayerConfig {
  opacity: number;
  zIndex: number;
  [key: string]: unknown; // paramètres propres à chaque couche
}

// État runtime d'une couche (dans le store)
interface LayerState {
  id: string;
  visible: boolean;
  config: LayerConfig;
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage?: string;
}
```

### Data Source

```ts
// features/layers/_engine/types.ts

interface DataSourceParams {
  viewport: MapViewport;
  bbox: BoundingBox;
  date?: Date;
}

interface DataSource<TRaw, TForMap> {
  id: string;
  fetch(params: DataSourceParams): Promise<TRaw>;
  transform(raw: TRaw, params: DataSourceParams): TForMap;
}
```

### Layer Manager Store

```ts
// stores/useLayerStore.ts

interface LayerManagerState {
  layers: Record<string, LayerState>;

  activateLayer(id: string): void;
  deactivateLayer(id: string): void;
  toggleLayer(id: string): void;
  setVisibility(id: string, visible: boolean): void;
  setOpacity(id: string, opacity: number): void;
  updateConfig(id: string, config: Partial<LayerConfig>): void;
  reorderLayers(orderedIds: string[]): void;
}
```

---

## Cycle de vie d'une couche

```
                ┌─────────────────────────────────────────┐
                │             REGISTERED                  │
                │  (LayerDefinition dans le Registry)     │
                └──────────────────┬──────────────────────┘
                                   │ activateLayer()
                ┌──────────────────▼──────────────────────┐
                │              ACTIVATING                 │
                │  LayerState.status = 'loading'          │
                └──────────────┬──────────┬───────────────┘
                               │          │
              données OK        │          │  erreur réseau
                ┌──────────────▼──┐   ┌───▼──────────────┐
                │     READY       │   │      ERROR        │
                │  status='ready' │   │  status='error'   │
                └──────────────┬──┘   └───┬───────────────┘
                               │          │  retry possible
                               │ deactivateLayer()
                ┌──────────────▼──────────────────────────┐
                │             INACTIVE                    │
                │  (LayerState retiré du store)           │
                └─────────────────────────────────────────┘
```

---

## Flux de données complet — exemple : couche pollution lumineuse

```
1. L'utilisateur active "Pollution lumineuse" dans la Sidebar
   ↓
2. Sidebar appelle LayerManagerStore.activateLayer("light-pollution")
   ↓
3. Zustand met à jour layers["light-pollution"] = { visible: true, status: 'loading', ... }
   ↓
4. MapContainer (abonné au store) détecte la mise à jour
   ↓
5. MapContainer appelle LayerRegistry.get("light-pollution")
   → obtient getSourceSpec() → maplibre.addSource(...)
   → obtient getLayerSpecs() → maplibre.addLayer(...)
   ↓
6. (En parallèle) DataSource.fetch() est déclenché par TanStack Query
   → Service HTTP → LightPollutionAPI → réponse brute
   → DataSource.transform() → GeoJSON prêt pour MapLibre
   → MapLibre source mise à jour → rendu
   ↓
7. Zustand : status → 'ready'
```

---

## Guide : développer une nouvelle couche

Exemple : ajouter une couche "Radar pluie".

### Étape 1 — Créer le dossier de la couche

```
features/layers/weather/radar/
├── layer.ts      ← définition MapLibre
├── source.ts     ← data source (fetch + transform)
├── service.ts    ← client HTTP brut
└── index.ts      ← export de la LayerDefinition
```

### Étape 2 — Implémenter le Service

```ts
// service.ts
// Appel HTTP brut — renvoie la réponse telle quelle
export async function fetchRadarTiles(params: RadarParams): Promise<RadarRawResponse> {
  const url = buildUrl(params);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Radar API error: ${response.status}`);
  return response.json() as Promise<RadarRawResponse>;
}
```

### Étape 3 — Implémenter la Data Source

```ts
// source.ts
// Utilise TanStack Query — transforme les données pour MapLibre
export const radarDataSource: DataSource<RadarRawResponse, RadarTileUrl> = {
  id: 'radar',
  fetch: (params) => fetchRadarTiles({ bbox: params.bbox, date: params.date }),
  transform: (raw) => buildTileUrl(raw),
};
```

### Étape 4 — Implémenter la Layer Definition

```ts
// layer.ts
export const radarLayer: LayerDefinition = {
  id: 'radar',
  name: 'Radar pluie',
  group: 'weather',
  description: 'Précipitations en temps réel',
  defaultConfig: { opacity: 0.7, zIndex: 10 },
  getSourceSpec: (config) => ({
    type: 'raster',
    tiles: [radarDataSource.transform(...)],
    tileSize: 256,
  }),
  getLayerSpecs: (config) => ([{
    id: 'radar-layer',
    type: 'raster',
    source: 'radar',
    paint: { 'raster-opacity': config.opacity },
  }]),
};
```

### Étape 5 — Enregistrer la couche

```ts
// features/layers/index.ts
import { radarLayer } from './weather/radar';
registry.register(radarLayer);
```

**C'est tout. Aucun autre fichier de l'application n'est modifié.**

---

## Bonnes pratiques

| Règle | Raison |
|---|---|
| Un fichier `service.ts` par API externe | Isolation des dépendances réseau |
| Jamais de `fetch()` dans un composant React | Les composants ne sont pas des services |
| Jamais de `useMap()` dans un widget | Les widgets sont indépendants de la carte |
| Toujours typer les réponses API | Évite les `any` en cascade |
| Toujours déclarer un `defaultConfig` | Le Layer Manager peut activer une couche sans configuration préalable |
| Nommer les layers MapLibre `${id}-layer` | Cohérence, facilite le debug dans MapLibre Inspector |

---

## Anti-patterns à éviter

```ts
// ❌ Une couche appelle directement une API
const radarLayer: LayerDefinition = {
  getSourceSpec: async () => {
    const data = await fetch('https://api.radar.com/...'); // INTERDIT
    ...
  }
};

// ❌ La carte importe une couche spécifique
import { lightPollutionLayer } from '../layers/light-pollution'; // INTERDIT dans MapContainer

// ❌ Un widget accède à l'instance MapLibre
function WeatherWidget() {
  const map = useMap(); // INTERDIT dans un widget
  ...
}

// ❌ Deux couches se connaissent
import { radarLayer } from '../radar'; // INTERDIT dans une autre couche
```

---

## Structure des stores

```
stores/
├── useLayerStore.ts   ← couches actives, visibilité, opacité, ordre
├── useMapStore.ts     ← viewport : centre, zoom, bearing, pitch, bbox
└── useUiStore.ts      ← sidebar ouverte/fermée, panneau actif, etc.
```

Les stores sont les **seuls** points de communication inter-modules. Aucun module ne doit importer un autre module directement pour en modifier l'état.

---

*Dernière mise à jour : étape 3 — Architecture moteur cartographique*
