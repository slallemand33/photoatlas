# Fiche détaillée d'un lieu — PhotoAtlas

> Ce module est le point central de l'expérience photographe.  
> Il transforme une simple sélection de lieu en une aide à la décision visuelle.

---

## Rôle

La fiche lieu (`PlaceDetailsPanel`) s'ouvre automatiquement lorsque l'utilisateur sélectionne un résultat dans la barre de recherche. Elle présente toutes les informations pertinentes pour décider si un lieu mérite un déplacement photographique.

---

## Intégration avec la recherche

```
Utilisateur sélectionne un résultat
  ↓
SearchBar.handleSelect(result)
  ├── useSearchStore.setSelectedResult()   → SearchInfoPanel (mini-popup sous la barre)
  ├── usePlaceStore.selectPlace(result)    → PlaceDetailsPanel (panneau principal)
  ├── map.flyTo(...)                       → carte recentrée
  └── showMarker(lat, lon)                → marqueur temporaire (5 s)
```

**Aucune requête réseau supplémentaire.** Toutes les données viennent du résultat de recherche.

---

## Architecture

```
features/place-details/
├── store/
│   └── usePlaceStore.ts          ← Zustand : selectedPlace + isOpen
├── hooks/
│   └── usePlaceDetails.ts        ← passthrough + extension future
├── utils/
│   └── format.ts                 ← labels FR, formatage GPS, zoom
└── components/
    ├── PlaceDetailsPanel.tsx     ← assembleur responsive (desktop + mobile)
    ├── PlaceHeader.tsx           ← nom, type, actions (Centrer / GPS / Favoris)
    ├── PlaceGeoInfo.tsx          ← commune, département, région, pays, coords
    └── PlacePhotoConditions.tsx  ← blocs photo/astro/météo (placeholder)
```

---

## Responsive

| Écran | Comportement |
|---|---|
| Desktop (≥1024px) | Panneau latéral droit `w-80`, inline dans le layout flex |
| Mobile (<1024px) | Bottom sheet fixe `max-h-72vh`, avec fond sombre et poignée tactile |

Le panneau prend de la place sur desktop (le fond de carte se rétrécit). Sur mobile, il s'affiche en overlay pour ne pas masquer toute la carte.

---

## Contenu de la fiche

### Section : En-tête
- Nom du lieu (titre)
- Type formaté en français (Ville, Village, Sommet, etc.)
- Bouton **Centrer** — `map.flyTo()` via `useMap()`
- Bouton **GPS** — copie dans le presse-papiers
- Bouton **Favoris** — désactivé (sprint futur)

### Section : Localisation
- Commune, Département, Région, Pays
- Coordonnées GPS formatées (degrés décimaux, N/S/E/O)

### Section : Conditions photo _(placeholder)_
Toutes les sections ci-dessous sont des placeholders marqués "Bientôt". Elles sont déjà structurées pour accueillir les vraies données dans les prochains sprints.

| Section | Futures données |
|---|---|
| Score photo | Calculé à partir météo + astro + pollution |
| Lumière | Lever/coucher soleil, heure dorée/bleue, lune |
| Météo | Vent, nuages, visibilité, orages |
| Pollution lumineuse | Niveau Bortle, luminance du ciel |
| Astronomie | Seeing, transparence, Voie Lactée |

---

## Parcours utilisateur prévu

```
Utilisateur recherche un lieu
  ↓
Sélection → Fiche s'ouvre
  ↓
Lecture des infos géographiques
  ↓
[Futur] Lecture des conditions météo du jour
  ↓
[Futur] Lecture des conditions astro de la nuit
  ↓
[Futur] Score photo calculé
  ↓
Décision : se déplacer ou non ?
  ↓
[Futur] Bouton "Ajouter aux favoris" pour garder le lieu
```

---

## Étendre la fiche avec de nouvelles données

### Ajouter les données météo

1. Créer `features/place-details/hooks/usePlaceWeather.ts`
2. Utiliser TanStack Query pour appeler le service météo avec `place.latitude, place.longitude`
3. Mettre à jour `PlacePhotoConditions.tsx` pour afficher les vraies valeurs

```typescript
// Exemple — hook météo pour la fiche
export function usePlaceWeather(place: SearchResult) {
  return useQuery({
    queryKey: ["place-weather", place.latitude, place.longitude],
    queryFn: () => weatherService.getCurrent(place.latitude, place.longitude),
    enabled: !!place,
  });
}
```

### Ajouter les données astronomiques

Même pattern : `hooks/usePlaceAstro.ts` → `PlacePhotoConditions.tsx`.

### Ajouter le Photo Score

Créer un service de scoring dans `features/place-details/utils/score.ts` :
```typescript
export function computePhotoScore(weather, astro, lightPollution): number {
  // Pondération des critères
  const cloudScore = (1 - weather.cloudCover) * 3;
  const windScore = Math.max(0, 2 - weather.windSpeed / 20) * 2;
  const bortleScore = Math.max(0, (9 - lightPollution.bortle) / 9) * 3;
  const moonScore = (1 - astro.moonIllumination) * 2;
  return Math.min(10, cloudScore + windScore + bortleScore + moonScore);
}
```

---

*Dernière mise à jour : sprint 8 — Fiche lieu*
