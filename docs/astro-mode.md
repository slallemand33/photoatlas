# Mode Astro

## Objectif

Le Mode Astro transforme la carte en outil de préparation de composition. Il ne répète pas les éphémérides du panneau Astronomie : il projette l’orientation du ciel autour du lieu sélectionné.

L’activation de la couche **Mode Astro** bascule automatiquement le fond sur **Sombre**. Les couches déjà actives, notamment Pollution lumineuse et Nuages, restent actives. Aucune autre couche n’est activée automatiquement. À la désactivation, PhotoAtlas restaure le fond utilisé auparavant.

## Architecture

```text
src/features/astronomy/milky-way/
├── components/
│   ├── AstroModeLayer.tsx
│   └── AstroTimeSlider.tsx
├── hooks/
│   ├── useAstroModeLifecycle.ts
│   └── useMilkyWayPlan.ts
├── services/
│   └── MilkyWayPlanningService.ts
├── store/
│   └── useMilkyWayStore.ts
├── types/
│   └── milkyWay.types.ts
└── utils/
    ├── projection.ts
    └── toAstroGeoJson.ts
```

Les responsabilités sont séparées :

- `AstronomyService` calcule les positions célestes sans connaître la carte ;
- `MilkyWayPlanningService` échantillonne la trajectoire du noyau dans le temps ;
- `projection.ts` transforme azimut et hauteur en coordonnées géographiques ;
- `toAstroGeoJson.ts` prépare le format consommé par MapLibre ;
- `AstroModeLayer` gère uniquement le cycle de vie des sources et du rendu ;
- `AstroTimeSlider` modifie l’heure sélectionnée.

## Moteur de calcul

Le Mode Astro réutilise le moteur [Astronomy Engine](https://github.com/cosinekitty/astronomy) documenté dans `docs/astronomy.md`. Le noyau galactique et l’anti-centre sont calculés pour :

- les coordonnées du lieu sélectionné ;
- la date et l’heure sélectionnées ;
- un horizon théorique dégagé.

La trajectoire est échantillonnée toutes les vingt minutes. Elle est mémorisée tant que le lieu et la fenêtre temporelle ne changent pas. Le déplacement du curseur recalcule uniquement la position instantanée du noyau, ce qui évite de refaire toute la trajectoire à chaque mouvement du pointeur.

Le store astronomique principal reçoit la même date. Le panneau Astronomie se met donc à jour avec le curseur sans que le Mode Astro duplique ses informations.

## Projection cartographique

La représentation est une projection polaire du ciel centrée sur le lieu :

- l’azimut astronomique devient le cap géographique depuis le lieu ;
- l’horizon est représenté par un cercle discret ;
- une hauteur de 0° se place sur ce cercle ;
- plus le noyau monte vers 90°, plus son point se rapproche du centre ;
- le noyau sous l’horizon est maintenu sur le bord pour conserver sa direction, mais il est signalé comme non visible dans le panneau.

La ligne traversant le lieu relie la direction du noyau à celle de l’anti-centre galactique. Elle donne l’orientation générale de la bande de la Voie Lactée. La courbe représente le déplacement du noyau au-dessus de l’horizon pendant la fenêtre choisie.

Le rayon géographique de la projection diminue lorsque le zoom augmente. Sa taille visuelle reste donc stable sans déplacer réellement le lieu de référence.

## Niveaux de détail

À faible zoom, la carte affiche principalement :

- la direction générale de la Voie Lactée ;
- la rose d’horizon ;
- les directions N, E, S et O.

À partir des zooms intermédiaires, elle ajoute :

- la trajectoire semi-transparente ;
- le noyau actuel ;
- le point culminant ;
- le point de disparition.

À fort zoom, les annotations horaires apparaissent sur la trajectoire. Les seuils de zoom sont définis dans `AstroModeLayer.tsx` et peuvent évoluer sans modifier les calculs.

## Curseur temporel

À l’activation, la fenêtre englobe la nuit astronomique courante ou à venir et l’heure actuelle. Une fenêtre de dix heures centrée autour de la période courante sert de repli dans les régions où la nuit astronomique n’existe pas.

Le curseur avance par pas de cinq minutes. Son état se trouve dans `useMilkyWayStore`. La sélection d’une date libre pourra plus tard remplacer l’initialisation automatique sans changer le service de trajectoire.

## Performance

- Aucun calcul n’est lancé lorsque le Mode Astro est inactif ou qu’aucun lieu n’est sélectionné.
- La trajectoire dépend uniquement du lieu et de la fenêtre temporelle.
- La position instantanée dépend uniquement du lieu et de l’heure sélectionnée.
- Un changement de zoom recalcule seulement la projection géographique, pas les positions astronomiques.
- Une source GeoJSON unique est mise à jour au lieu de recréer plusieurs sources.
- La source et tous les layers sont supprimés à la désactivation.

## Évolutions prévues

- sélection libre de la date et de l’heure ;
- orientation complète de l’arche galactique ;
- prise en compte du relief et d’un masque d’horizon ;
- champ de vision selon le boîtier et la focale ;
- angle de roulis de l’appareil ;
- trajectoires de la Lune, du Soleil et des planètes ;
- recommandations automatiques de position et de cadrage ;
- combinaison avec météo, pollution lumineuse et Photo Score.

## Limites

La projection décrit une direction céleste sur une carte plane. Elle ne signifie pas que le noyau se trouve physiquement au point dessiné au sol. Le cercle est une rose du ciel, dont le rayon est choisi pour la lisibilité.

Les montagnes, bâtiments, arbres, nuages, la Lune et la pollution lumineuse ne sont pas encore intégrés au calcul de visibilité.
