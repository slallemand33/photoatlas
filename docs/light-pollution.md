# Couche Pollution lumineuse

Cette couche est la première couche métier de PhotoAtlas. Elle superpose les lumières nocturnes observées à la carte et fournit, pour le lieu sélectionné, une estimation simple de la qualité du ciel.

## Source publique

La couche utilise **Earth at Night 2012 / VIIRS City Lights**, diffusée par le service public **NASA Global Imagery Browse Services (GIBS)** :

| Propriété        | Valeur                                 |
| ---------------- | -------------------------------------- |
| Fournisseur      | NASA GIBS, composant de NASA ESDIS     |
| Instrument       | Suomi NPP / VIIRS                      |
| Couche           | `VIIRS_CityLights_2012`                |
| Service          | WMTS REST public, projection EPSG:3857 |
| Matrice          | `GoogleMapsCompatible_Level8`          |
| Format           | JPEG, tuiles de 256 px                 |
| Zoom             | 0 à 8                                  |
| Authentification | Aucune                                 |

Documentation officielle :

- [NASA GIBS API](https://nasa-gibs.github.io/gibs-api-docs/)
- [Accès aux services GIBS](https://nasa-gibs.github.io/gibs-api-docs/access-basics/)
- [Catalogue WMTS EPSG:3857](https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/)

Attribution affichée sur la carte : _Imagery provided by NASA GIBS / ESDIS_.

Le chemin WMTS REST suit l’ordre `TileMatrix/TileRow/TileCol`. Le modèle de tuile MapLibre est donc volontairement `{z}/{y}/{x}`, et non `{z}/{x}/{y}`.

## Ce que montre la couche

Le raster représente la lumière artificielle nocturne observée depuis l’espace. Les zones sombres sont bleu-noir et les zones urbaines apparaissent en tons chauds. Une opacité initiale de 70 % conserve le contexte du fond de carte.

Ce jeu de données ne mesure pas directement la luminosité du ciel vue depuis le sol. Il constitue un excellent indicateur visuel de l’éclairage artificiel, mais pas une carte Bortle scientifique.

Limites principales :

- composite statique de 2012, donc les évolutions urbaines récentes ne sont pas visibles ;
- résolution limitée par le niveau 8 de la matrice NASA ;
- halos, relief, humidité, aérosols et sources masquées ne sont pas modélisés ;
- l’indice Bortle affiché est une estimation et non une mesure sur site.

## Architecture

```text
light-pollution/
├── components/LightPollutionLegend.tsx
├── data-sources/lightPollutionDataSource.ts
├── hooks/useLightPollutionEstimate.ts
├── services/nasaGibsService.ts
├── types/lightPollution.types.ts
└── definition.ts
```

`nasaGibsService.ts` connaît uniquement le service NASA et construit les URL. `lightPollutionDataSource.ts` fournit le contrat utilisé par le métier : spécification raster MapLibre et estimation à des coordonnées. La définition de couche relie cette DataSource au Layer Manager.

Lors de l’activation, `syncLayersToMap` ajoute la source et le layer raster. Lors de la désactivation, il retire d’abord le layer puis sa source ; MapLibre peut alors libérer les tuiles. L’opacité est mise à jour sur le paint `raster-opacity` sans recréer la source.

La légende est déclarée dans `LayerDefinition.LegendComponent`. Le composant générique `LayerItem` ne la rend que si la couche est visible.

## Estimation du lieu sélectionné

Lorsque la couche et le panneau d’un lieu sont ouverts, `useLightPollutionEstimate` demande uniquement la tuile NASA contenant le point. La DataSource lit un petit voisinage autour des coordonnées, en extrait une luminosité robuste, puis la convertit en classe Bortle indicative de 1 à 9.

Si la lecture de la tuile échoue, une heuristique locale basée sur la catégorie et l’importance du lieu assure un résultat de repli. Le champ `method` (`viirs-raster` ou `place-heuristic`) rend ce comportement explicite.

Pour remplacer l’estimation par un calcul scientifique, il suffit d’implémenter `estimateAt()` dans la DataSource en conservant le type `LightPollutionEstimate`. Le panneau n’a pas à changer.

## Ajouter une autre couche raster

1. Créer un module dans `src/features/layers/<nom>/`.
2. Isoler l’URL, l’authentification éventuelle et le format dans `services/`.
3. Créer une DataSource qui retourne un `RasterSourceSpecification`.
4. Déclarer une `LayerDefinition` avec `getSourceSpec`, `getLayerSpecs`, une opacité par défaut et, si nécessaire, un `LegendComponent`.
5. Ajouter la définition dans `src/features/layers/definitions/index.ts`.

Exemple minimal :

```ts
export const exampleLayer: LayerDefinition = {
  id: "example",
  name: "Exemple",
  description: "Couche raster d’exemple",
  group: "weather",
  type: "raster",
  source: { type: "raster", url: dataSource.tileUrl },
  metadata: { dataProvider: "Fournisseur documenté" },
  icon: Layers,
  defaultOpacity: 0.7,
  defaultVisible: false,
  defaultZIndex: 20,
  getSourceSpec: () => dataSource.getSourceSpecification(),
  getLayerSpecs: (state) => [
    {
      id: "example-raster",
      type: "raster",
      source: "example",
      paint: { "raster-opacity": state.opacity },
    },
  ],
};
```

Le Layer Manager prend ensuite automatiquement en charge activation, désactivation, opacité et cycle de vie de la source.
