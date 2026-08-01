# Couverture nuageuse

Le module Nuages sépare volontairement deux usages : une couche raster continue pour lire la situation sur la carte et une prévision ponctuelle pour analyser le lieu sélectionné.

## Sources

### Carte : OpenWeather Weather Maps

La carte utilise la couche raster mondiale [`clouds_new`](https://openweathermap.org/api/weathermaps) d’OpenWeather. La clé reste exclusivement sur le serveur : MapLibre appelle le proxy interne `/api/weather/clouds/{z}/{x}/{y}`, qui récupère la tuile auprès d’OpenWeather.

| Propriété        | Valeur                                       |
| ---------------- | -------------------------------------------- |
| Couche           | `clouds_new`                                 |
| Service          | OpenWeather Weather Maps 1.0                 |
| Format           | PNG raster avec transparence                 |
| Taille           | 256 × 256 px                                 |
| Zoom utilisé     | 0 à 12                                       |
| Authentification | Clé privée, injectée uniquement côté serveur |

Attribution affichée sur la carte : _Weather data © OpenWeather_.

### Panneau du lieu : Open-Meteo

Les valeurs du panneau restent fournies par l’[API Open-Meteo Forecast](https://open-meteo.com/en/docs) :

| Variable           | Signification                          |
| ------------------ | -------------------------------------- |
| `cloud_cover`      | Couverture totale en pourcentage       |
| `cloud_cover_low`  | Nuages bas et brouillard, jusqu’à 3 km |
| `cloud_cover_mid`  | Nuages moyens, de 3 à 8 km             |
| `cloud_cover_high` | Nuages hauts, au-dessus de 8 km        |

Ces données sont proposées sous [licence CC BY 4.0](https://open-meteo.com/en/licence).

## Architecture

```text
src/features/weather/
├── components/
│   └── CloudLegend.tsx
├── hooks/
│   └── useCloudCover.ts
├── services/
│   ├── openWeatherCloudTileProvider.ts # carte raster
│   └── openMeteoWeatherProvider.ts    # prévision du lieu
├── store/
│   └── useWeatherStore.ts
├── types/
│   └── weather.types.ts
└── utils/
    └── photoQuality.ts
```

Deux contrats indépendants empêchent tout couplage entre la carte et le panneau :

- `CloudTileProvider` expose l’URL et les caractéristiques du fournisseur raster ;
- `WeatherProvider` fournit les valeurs météo à des coordonnées.

Changer de fournisseur de tuiles n’affecte donc ni les jauges, ni le score photo, ni le cache Open-Meteo.

## Cycle de vie de la couche raster

La définition `cloudsLayer` fournit directement au Layer Manager un `RasterSourceSpecification` et un `RasterLayerSpecification`.

Quand l’utilisateur active la couche :

1. `syncLayersToMap` ajoute la source WMTS raster ;
2. MapLibre demande uniquement les tuiles couvrant l’écran ;
3. le layer est affiché avec l’opacité du store ;
4. les tuiles sont désaturées pour conserver un rendu photographique discret.

Le curseur appelle `raster-opacity` sans recréer la source. À la désactivation, le layer puis la source sont retirés : aucune tuile météo n’est chargée tant que la couche reste inactive.

Il n’existe plus de grille d’échantillonnage, de point, de cercle, de heatmap ou de source GeoJSON pour représenter les nuages.

## Cache et actualisation du panneau

Le cache concerne uniquement les données ponctuelles Open-Meteo :

1. le fournisseur conserve chaque réponse en mémoire pendant 15 minutes ;
2. React Query réutilise les réponses pendant 15 minutes ;
3. l’actualisation automatique est réglée à 30 minutes dans `useWeatherStore` ;
4. le rafraîchissement au focus est désactivé.

La fréquence peut être modifiée avec `setRefreshIntervalMs()`, avec un minimum de cinq minutes.

Le proxy autorise un cache navigateur/CDN de dix minutes, complété par cinq minutes de réutilisation pendant la revalidation. La couche reste chargée uniquement lorsqu’elle est activée.

## Indicateur photo

La première version mesure le potentiel de ciel dégagé :

| Couverture totale | Score                 |
| ----------------- | --------------------- |
| 0–10 %            | 5 étoiles — Excellent |
| 11–30 %           | 4 étoiles — Très bon  |
| 31–50 %           | 3 étoiles — Bon       |
| 51–75 %           | 2 étoiles — Moyen     |
| 76–100 %          | 1 étoile — Mauvais    |

Le calcul est isolé dans `utils/photoQuality.ts` et reste indépendant du fournisseur cartographique.

## Limitations

- `clouds_new` représente une couverture nuageuse cartographique OpenWeather, pas une photographie satellite brute.
- La résolution météorologique d’origine reste inférieure à celle du fond de carte : un zoom très rapproché ne crée pas de détail météo supplémentaire.
- Le proxy PhotoAtlas limite volontairement les requêtes aux zooms 0 à 12 et met les réponses en cache.
- La palette OpenWeather est légèrement désaturée par MapLibre pour mieux s’intégrer aux fonds de carte.
- Les valeurs du panneau et les pixels de la carte proviennent de fournisseurs, modèles et horaires différents ; ils peuvent donc diverger.

## Ajouter une autre couche météo raster

1. Implémenter `CloudTileProvider` ou créer un contrat spécialisé dans `types/`.
2. Isoler l’URL, la date et l’attribution dans `services/`.
3. Retourner une source `raster` depuis la définition de couche.
4. Déclarer un layer `raster` dont l’opacité vient de `LayerState`.
5. Ajouter une légende optionnelle à `LegendComponent`.
6. Enregistrer la définition dans le Layer Manager.

Le vent et la pluie restent hors du périmètre de cette version.
