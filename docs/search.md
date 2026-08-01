# Moteur de recherche géographique — PhotoAtlas

> Ce module est la fondation de toute la recherche dans PhotoAtlas.  
> Il est conçu pour être réutilisé par tous les futurs modules.

---

## Fonctionnement

La recherche utilise l'API **Nominatim** (OpenStreetMap) pour trouver des lieux géographiques. Toutes les requêtes transitent par un **proxy Next.js** (`/api/search`) pour ajouter les en-têtes requis par Nominatim et bénéficier du cache serveur.

### Flux d'une recherche

```
Utilisateur tape "Paris"
  ↓
useDebounce (300 ms) → query = "Paris"
  ↓
useSearch → TanStack Query (cache 5 min)
  ↓
NominatimProvider.search("Paris")
  ↓
fetch("/api/search?q=Paris")
  ↓
app/api/search/route.ts → Nominatim API (avec User-Agent)
  ↓
Résultats transformés en SearchResult[]
  ↓
SearchBar affiche les suggestions
  ↓
Utilisateur sélectionne → map.flyTo() + marqueur temporaire
```

---

## Architecture du module

```
src/features/search/
├── types/
│   └── search.types.ts      ← SearchResult, ISearchProvider, SearchOptions
├── services/
│   ├── nominatim.service.ts ← client Nominatim + transformation de données
│   └── search.service.ts    ← façade provider-agnostique
├── hooks/
│   ├── useSearch.ts         ← TanStack Query + debounce
│   └── useSearchMarker.ts   ← marqueur temporaire MapLibre
├── utils/
│   ├── zoom.ts              ← zoom adapté au type de résultat
│   └── format.ts            ← formatage des coordonnées GPS
└── components/
    ├── SearchBar.tsx         ← input + dropdown + panneau d'info
    ├── SearchResultItem.tsx  ← ligne de résultat avec icône + texte
    └── SearchInfoPanel.tsx   ← panneau post-sélection (coords + favoris)
```

---

## Choix techniques

### Proxy Next.js (`app/api/search/route.ts`)

Nominatim exige un `User-Agent` identificateur. Les navigateurs ne peuvent pas définir ce header. La route proxy :
- Ajoute le `User-Agent` correct
- Cache les réponses 5 minutes côté serveur (`next: { revalidate: 300 }`)
- Centralise la configuration de l'API

### TanStack Query

Le hook `useSearch` utilise TanStack Query pour :
- Dédupliquer les requêtes identiques
- Mettre en cache les résultats 5 minutes
- Gérer automatiquement les états loading/error
- Éviter les appels redondants

### Debounce (300 ms)

`useDebounce` retarde l'exécution de la requête jusqu'à ce que l'utilisateur arrête de taper. Aucune requête n'est envoyée pendant la frappe.

### `ISearchProvider` — Provider-agnostique

```typescript
interface ISearchProvider {
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
}
```

`SearchService` est une façade qui délègue à n'importe quel provider. Changer de fournisseur = une ligne dans `search.service.ts`.

### `MapProvider` au niveau `AppLayout`

La migration de `MapProvider` depuis `MapView` vers `AppLayout` permet à **tous les composants** (Header, Sidebar, widgets) d'accéder à l'instance MapLibre via `useMap()`. C'est cette migration qui permet à `SearchBar` de centrer la carte depuis le header.

---

## Ajouter un nouveau fournisseur de recherche

Exemple : ajouter **Photon** (alternative à Nominatim) :

### 1. Implémenter `ISearchProvider`

```typescript
// features/search/services/photon.service.ts
import type { ISearchProvider, SearchResult } from "../types";

export class PhotonProvider implements ISearchProvider {
  async search(query: string): Promise<SearchResult[]> {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&lang=fr`;
    const response = await fetch(url);
    const data = await response.json();
    return data.features.map(transformPhotonFeature);
  }
}
```

### 2. Brancher dans `search.service.ts`

```typescript
// Remplacer NominatimProvider par PhotonProvider
export const searchService = new SearchService(new PhotonProvider());
```

**C'est tout.** Aucun autre composant ne change.

---

## Futurs types de recherche

Le moteur est conçu pour supporter d'autres sources en parallèle :

```typescript
// Futur : ISearchProvider multi-source
interface MultiSourceProvider implements ISearchProvider {
  private providers: ISearchProvider[];
  
  async search(query: string): Promise<SearchResult[]> {
    const results = await Promise.all(this.providers.map(p => p.search(query)));
    return deduplicate(results.flat()).sort(byImportance);
  }
}
```

Exemples de futures sources :
| Source | Type | Status |
|---|---|---|
| Nominatim OSM | Géographie mondiale | ✅ Actif |
| Spots PhotoAtlas | Base de données interne | 🔜 Futur |
| Favoris utilisateur | Store local | 🔜 Futur |
| Sommets, lacs, cascades | Overpass API | 🔜 Futur |
| Parcs naturels | INPN / INSPIRE | 🔜 Futur |

---

## Cache et performance

| Niveau | Durée | Mécanisme |
|---|---|---|
| Serveur (route API) | 5 min | `next: { revalidate: 300 }` |
| Client (TanStack Query) | 5 min stale + 10 min gc | `staleTime` + `gcTime` |
| Recherches récentes | Session | `useSearchStore.recentSearches` |
| Debounce | 300 ms | `useDebounce` |

---

## Réutilisation dans les futurs modules

### Dans un composant quelconque

```typescript
import { searchService } from "@/features/search";

// Rechercher un lieu depuis n'importe quel module
const results = await searchService.search("Mont Blanc");
```

### Centrer la carte sur un résultat

```typescript
import { useMap } from "@/components/map";
import { getZoomForResult } from "@/features/search/utils";

const map = useMap();
map.flyTo({ center: [result.longitude, result.latitude], zoom: getZoomForResult(result) });
```

### Afficher un marqueur temporaire

```typescript
import { useSearchMarker } from "@/features/search";
const { showMarker } = useSearchMarker();
showMarker(result.latitude, result.longitude); // disparaît après 5 s
```

---

*Dernière mise à jour : sprint 7 — Moteur de recherche géographique*
