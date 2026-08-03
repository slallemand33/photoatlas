# Sélection de lieu

PhotoAtlas dispose désormais d'un moteur unique de sélection de lieu. La recherche textuelle et le clic direct sur la carte alimentent le même état applicatif, le même marqueur et le même panneau de droite.

## Fonctionnement

Une sélection produit toujours un `SearchResult`. Ce type reste le contrat partagé par la météo, la pollution lumineuse, les calculs Soleil/Lune/Voie Lactée, Photo Advisor, la timeline et les webcams.

Le hook `useLocationSelection` expose deux entrées :

- `selectSearchResult(result)` pour les résultats du moteur de recherche.
- `selectMapPoint({ latitude, longitude })` pour les clics sur la carte.

Dans les deux cas, le moteur :

- met à jour `useSearchStore.selectedResult`;
- ouvre `usePlaceStore` via `selectPlace`;
- affiche le marqueur temporaire MapLibre;
- garde le panneau de droite comme surface d'information principale.

La recherche continue d'animer la carte vers le résultat choisi. Le clic carte laisse la carte fluide et sélectionne immédiatement le point cliqué.

## Reverse geocoding

Le clic carte passe par `ReverseGeocodingService`, situé dans `src/features/location-selection/services/`. Le reste de l'application n'appelle jamais directement le fournisseur.

Le service appelle la route interne :

```txt
GET /api/reverse-geocode?lat={latitude}&lon={longitude}
```

Cette route utilise Nominatim, le même fournisseur que la recherche existante, avec `accept-language=fr,en`.

Si Nominatim trouve un lieu, la route renvoie un `SearchResult` normalisé. Si aucun nom exploitable n'est trouvé ou si le fournisseur ne répond pas, l'application conserve le point de repli :

```txt
📍 Point sélectionné
Latitude / Longitude
```

Les calculs restent disponibles car les coordonnées sont toujours présentes.

## Architecture

```txt
src/features/location-selection/
  components/
    MapLocationSelection.tsx
  hooks/
    useLocationSelection.ts
  services/
    ReverseGeocodingService.ts
  types/
  utils/
```

`MapLocationSelection` écoute les clics MapLibre et transmet les coordonnées au moteur. `SearchBar` ne gère plus elle-même la sélection complète : elle délègue à `useLocationSelection`.

L'ancien bouton instable `Choisir le point de prise de vue` est masqué pour ce sprint. Le clic carte devient la référence active pour le lieu sélectionné.

## Futurs modes

Les favoris, Spots Photo et autres sources de sélection devront appeler le même moteur plutôt que modifier directement les stores.

Exemples prévus :

- favori utilisateur → `selectSearchResult(savedPlace)`;
- Spot Photo → `selectSearchResult(spotLocation)`;
- import GPS → `selectMapPoint(coordinates)` ou conversion préalable en `SearchResult`.
