# Système de couches — Layer Manager

> Document technique de référence pour l'ajout et la gestion des couches cartographiques.

---

## Vue d'ensemble

Le Layer Manager est l'infrastructure centrale qui permet d'ajouter, configurer et afficher des dizaines de couches cartographiques sans jamais modifier le composant `MapView`.

Il repose sur trois éléments :

```
LayerDefinition (statique)  →  LayerRegistry (annuaire)
                                     ↓
LayerState (runtime)        →  useLayerStore (Zustand)
                                     ↓
                              useLayers() hook
                                     ↓
                              LayerPanel + LayerItem (UI)
```

---

## Rôle du Registry

**Fichier :** `features/layers/store/registry.ts`

Le Registry est un annuaire statique de toutes les couches disponibles dans l'application. Il est créé au démarrage et ne change jamais durant la session.

**Responsabilités :**
- Stocker les `LayerDefinition` (métadonnées, icône, type, source, valeurs par défaut)
- Permettre la récupération d'une couche par `id` ou par `group`
- Ne contient aucun état runtime (visible, opacity, zIndex)

**Initialisation :**  
Le registry est un singleton (`export const registry = new LayerRegistry()`). Son constructeur appelle `LAYER_DEFINITIONS.forEach(def => register(def))` pour se peupler au chargement du module.

---

## Rôle du Store

**Fichier :** `features/layers/store/useLayerStore.ts`

Le Store Zustand gère l'état runtime des couches. Il est **vide au démarrage** — les valeurs par défaut viennent des `LayerDefinition` via le Registry.

**Interface :**

```typescript
interface LayerManagerState {
  layers: Record<string, LayerState>;     // états runtime indexés par id
  toggleLayer(id: string): void;          // bascule visible ↔ invisible
  setLayerVisible(id: string, v: boolean): void;
  setLayerOpacity(id: string, o: number): void;
  setLayerZIndex(id: string, z: number): void;
}
```

**Comportement :**  
Quand une action est appelée pour une couche sans état existant, le store récupère les valeurs par défaut depuis `registry.get(id)`. Cela évite toute initialisation préalable.

---

## Rôle du hook `useLayers`

**Fichier :** `features/layers/hooks/useLayers.ts`

Ce hook fusionne registry (définitions) et store (états) en une liste de `LayerWithState`.

```typescript
function useLayers(): LayerWithState[]
```

`LayerWithState` = `LayerDefinition & { state: LayerState }`

Si un layer n'a pas encore d'état dans le store, les valeurs par défaut de la définition sont utilisées. Ce hook est le **seul point d'entrée** pour les composants UI.

---

## Types TypeScript

```
features/layers/types/layer.types.ts
```

| Type | Description |
|---|---|
| `LayerDefinition` | Définition statique et immuable d'une couche |
| `LayerState` | État runtime (visible, opacity, zIndex) |
| `LayerWithState` | Fusion des deux — utilisé par l'UI |
| `LayerGroup` | Catégorie : `weather`, `astronomy`, `light-pollution`, etc. |
| `LayerType` | Rendu : `raster`, `vector`, `geojson`, `custom` |
| `LayerSource` | Origine des données (url, attribution) |
| `LayerMetadata` | Métadonnées extensibles via index signature |

---

## Organisation des fichiers

```
src/features/layers/
├── types/
│   └── layer.types.ts           ← toutes les interfaces TypeScript
├── definitions/
│   ├── light-pollution.ts       ← définition de chaque couche
│   ├── clouds.ts
│   ├── rain-radar.ts
│   ├── milky-way.ts
│   └── index.ts                 ← tableau LAYER_DEFINITIONS
├── store/
│   ├── registry.ts              ← LayerRegistry (annuaire statique)
│   ├── useLayerStore.ts         ← Zustand store (état runtime)
│   └── index.ts
├── hooks/
│   └── useLayers.ts             ← fusion registry + store
├── components/
│   ├── LayerItem.tsx            ← UI d'une couche (toggle + slider)
│   └── LayerPanel.tsx           ← panneau complet dans la Sidebar
├── services/                    ← appels API (à implémenter couche par couche)
└── utils/                       ← utilitaires partagés
```

---

## Comment ajouter une nouvelle couche

### Étape 1 — Créer la définition

```typescript
// features/layers/definitions/lightning.ts
import { Zap } from "lucide-react";
import type { LayerDefinition } from "../types";

export const lightningLayer: LayerDefinition = {
  id: "lightning",
  name: "Orages",
  description: "Activité orageuse en temps réel",
  group: "weather",
  type: "geojson",
  source: null,           // renseigner l'URL quand l'API est connectée
  metadata: {
    dataProvider: "Blitzortung",
    updateIntervalSeconds: 60,
  },
  icon: Zap,
  defaultOpacity: 1,
  defaultVisible: false,
  defaultZIndex: 40,
};
```

### Étape 2 — L'enregistrer dans LAYER_DEFINITIONS

```typescript
// features/layers/definitions/index.ts
import { lightningLayer } from "./lightning";

export const LAYER_DEFINITIONS: LayerDefinition[] = [
  lightPollutionLayer,
  cloudsLayer,
  rainRadarLayer,
  milkyWayLayer,
  lightningLayer,         // ← ajouter ici
];
```

**C'est tout.** La couche apparaît automatiquement dans la Sidebar avec ses contrôles.

### Étape 3 (future) — Connecter les données

Quand l'API est disponible :

```typescript
// features/layers/definitions/lightning.ts
source: {
  type: "geojson",
  url: "https://api.blitzortung.org/...",
  attribution: "© Blitzortung.org",
},
```

Et créer `features/layers/services/lightning.ts` pour encapsuler l'appel HTTP.

---

## Flux de données complet

```
Utilisateur active "Orages" dans le LayerPanel
  ↓
LayerItem.onCheckedChange() → useLayerStore.toggleLayer("lightning")
  ↓
Zustand met à jour layers["lightning"].visible = true
  ↓
useLayers() (abonné au store) re-calcule la liste fusionnée
  ↓
LayerPanel re-render → LayerItem affiche l'état "actif"
  ↓
(Futur sprint) MapView abonné au store → map.addLayer(spec MapLibre)
```

---

## Connexion future avec MapView

Lors du prochain sprint sur les couches réelles, `MapView` s'abonnera au store :

```typescript
// Dans MapCanvas (future implémentation)
const activeLayers = useLayerStore(s => s.layers);

useEffect(() => {
  if (!map) return;
  // Pour chaque couche active : ajouter source + layer MapLibre
  Object.values(activeLayers)
    .filter(s => s.visible)
    .forEach(state => {
      const def = registry.get(state.id);
      if (!def) return;
      // map.addSource(def.id, def.source)
      // map.addLayer(getLayerSpec(def, state))
    });
}, [map, activeLayers]);
```

**MapView ne connaît jamais directement les définitions.** Il passe par le store et le registry.

---

*Dernière mise à jour : sprint 5 — Layer Manager*
