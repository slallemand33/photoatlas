# Architecture de la carte interactive — PhotoAtlas

> Document technique de référence pour le module cartographique.

---

## Choix techniques

### MapLibre GL JS v6

MapLibre GL JS est une bibliothèque open-source de rendu de cartes vectorielles basée sur WebGL. Elle est un fork de Mapbox GL JS v1.x, maintenu par la communauté, sans restrictions de licence ni API key obligatoire.

**Raisons du choix :**
- Open-source, pas de licence commerciale restrictive
- Rendu WebGL performant (GPU) — idéal pour superposer de nombreuses couches
- Style specification ouverte — compatible avec les styles Mapbox
- Écosystème riche (tuiles, styles, plugins)
- Contrôle total sur les couches et les sources de données

**Pourquoi pas Leaflet ?**  
Leaflet est basé sur SVG/Canvas 2D. Il est bien adapté pour des cartes simples mais peu performant pour des dizaines de couches simultanées (météo, radar, pollution, astro…). MapLibre GL utilise WebGL et gère de grandes quantités de données géographiques sans dégradation.

**Pourquoi pas Google Maps / Mapbox ?**  
Dépendances commerciales avec des quotas et des coûts imprévisibles pour un projet long terme.

### Style de fond : OpenFreeMap (Liberty)

URL : `https://tiles.openfreemap.org/styles/liberty`

OpenFreeMap est un service gratuit de tuiles vectorielles basé sur OpenStreetMap. Aucune API key requise. Tuiles hébergées sur un CDN mondial.

**Alternatives pour les prochains sprints :**

| Style | URL | Notes |
|---|---|---|
| OpenFreeMap Bright | `https://tiles.openfreemap.org/styles/bright` | Plus contrasté |
| OpenFreeMap Positron | `https://tiles.openfreemap.org/styles/positron` | Très épuré |
| MapTiler Basic | `https://api.maptiler.com/maps/basic/style.json?key=...` | Nécessite une API key (tier gratuit disponible) |
| Style sombre custom | À construire | Idéal pour l'astrophotographie nocturne |

**Pour changer de style :** modifier uniquement la constante `BASE_MAP_STYLE` dans `MapView.tsx`.

---

## Organisation des composants

```
src/components/map/
├── MapProvider.tsx    ← Contexte React + instance MapLibre
├── MapView.tsx        ← Composant principal (init MapLibre + contrôles)
├── MapControls.tsx    ← Placeholder pour futurs contrôles React overlay
└── index.ts           ← Exports publics
```

### MapProvider

Fournit un contexte React (`MapContext`) contenant l'instance `maplibregl.Map`.

**Hooks exposés :**
- `useMap()` — lecture de l'instance, pour les futurs composants de couches
- `useSetMap()` — interne, utilisé uniquement par `MapView` pour enregistrer l'instance

**État actuel :** `MapProvider` est encapsulé à l'intérieur de `MapView`. Cela signifie que seuls les composants enfants de `MapView` peuvent utiliser `useMap()`.

**Évolution prévue :** quand les couches auront besoin d'interagir avec la carte depuis la Sidebar, déplacer `<MapProvider>` dans `AppLayout` (au-dessus de `Sidebar` et `MapView`). Aucun autre code n'aura à changer.

### MapView

Composant public. Enveloppe `MapProvider` et `MapCanvas`.

**MapCanvas** (composant interne, non exporté) :
- Crée le `<div>` conteneur de la carte
- Initialise `maplibregl.Map` dans un `useEffect`
- Ajoute les contrôles natifs MapLibre
- Enregistre l'instance dans le contexte via `useSetMap()`
- Nettoie proprement au démontage (`map.remove()`)

**Import dynamique de MapLibre :**  
MapLibre GL v6 utilise des APIs navigateur (WebGL, Canvas). Pour éviter les erreurs SSR dans Next.js App Router, l'import est dynamique (`import("maplibre-gl")`) et s'exécute uniquement dans un `useEffect` (côté client uniquement).

### MapControls

Placeholder pour les futurs contrôles React superposés à la carte :
- Barre de recherche de lieu
- Affichage du zoom actuel
- Sélecteur de fonds de carte
- Panneau de coordonnées au survol

Ces contrôles utiliseront `useMap()` pour interagir avec la carte.

---

## Fonctionnalités actuelles

| Fonctionnalité | Implémentation |
|---|---|
| Zoom +/− | `NavigationControl` (top-right) |
| Déplacement | Natif MapLibre |
| Rotation | **Désactivée** (`dragRotate: false`, `pitchWithRotate: false`, `touchZoomRotate.disableRotation()`) |
| Double-clic pour zoomer | Actif par défaut dans MapLibre |
| Molette de souris | Active par défaut |
| Navigation tactile (pinch-to-zoom) | Active (`touchZoomRotate` sans rotation) |
| Barre d'échelle | `ScaleControl` (bottom-left, unité métrique) |
| Plein écran | `FullscreenControl` (top-right) |
| Géolocalisation | `GeolocateControl` (top-right, zoom max 14) |

---

## Configuration initiale

```ts
// MapView.tsx — toutes les valeurs initiales sont des constantes nommées
const INITIAL_CENTER: [number, number] = [2.3514, 46.8566]; // France
const INITIAL_ZOOM = 5;
const MIN_ZOOM = 2;
const MAX_ZOOM = 20;
const BASE_MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
```

Modifier uniquement ces constantes pour ajuster le comportement initial.

---

## Intégration des futures couches

### Principe

Les couches n'interagiront **jamais directement** avec MapLibre. Elles passeront par le **Layer Manager** (Zustand store, défini dans `docs/architecture-map.md`).

`MapView` s'abonnera au Layer Manager et appellera `map.addSource()` / `map.addLayer()` lorsque l'état change.

### Évolution de MapView pour les couches

```tsx
// Futur sprint — example conceptuel (non implémenté)
function MapCanvas() {
  const setMap = useSetMap();
  const activeLayers = useLayerStore((s) => s.layers);
  const registry = useLayerRegistry();

  // L'effet de la carte s'exécute une seule fois
  useEffect(() => {
    // init map...
  }, [setMap]);

  // Cet effet réagit aux changements de couches
  useEffect(() => {
    if (!map) return;
    syncLayersToMap(map, activeLayers, registry);
  }, [map, activeLayers, registry]);
}
```

### Ordre de priorité pour les prochains sprints

1. **Fond de carte sombre** — pour l'astrophotographie
2. **Layer Manager** — Zustand store + Registry (architecture, pas de couche)
3. **Première couche** — pollution lumineuse (raster, simple)
4. **Contrôles de couches** — sidebar avec toggles
5. **Couches météo** — nuages, précipitations
6. **Couches astronomiques** — Voie Lactée, Lune, Soleil

---

## CSS MapLibre

Le CSS de MapLibre GL est importé dans `src/app/globals.css` (avant Tailwind) :

```css
@import "maplibre-gl/dist/maplibre-gl.css";
@import "tailwindcss";
```

Ce CSS fournit les styles des contrôles natifs (zoom, échelle, géoloc), du popup et du marqueur par défaut.

---

## Points de vigilance

**SSR (Server-Side Rendering)**  
MapLibre GL v6 n'a pas d'export `default`. L'import dynamique utilise les exports nommés : `import("maplibre-gl").then((maplibregl) => { ... })`. L'initialisation est dans `useEffect` — elle ne s'exécute jamais côté serveur.

**Resize automatique**  
MapLibre GL détecte automatiquement les changements de taille du conteneur via `ResizeObserver`. La carte s'adapte sans code supplémentaire.

**Performance**  
La carte est créée une seule fois (guard `if (mapRef.current) return`). Le composant peut se re-render sans recréer la carte.

---

*Dernière mise à jour : sprint 4 — Carte interactive MapLibre GL*
