# Guides photographiques

## Objectif

Les Guides Photo projettent sur la carte les directions utiles à la préparation d’un cadrage. Ils sont indépendants des couches météo et fonctionnent avec tous les fonds MapLibre.

## Architecture

`features/photo-guides/` contient :

- `services/GuideEngine.ts` : calcul pur des positions du Soleil, de la Lune et du noyau galactique ;
- `store/` : guides visibles, heure partagée et point de composition ;
- `hooks/` : mémoïsation du plan lorsque le lieu, l’heure ou le point de prise de vue change ;
- `utils/toGuideGeoJson.ts` : projection du ciel autour du point de référence ;
- `components/PhotoGuidesLayer.tsx` : adaptateur MapLibre ;
- `components/PhotoGuidesPanel.tsx` : commandes indépendantes et Tout afficher ;
- `components/PhotoGuidesTimeControl.tsx` : fenêtre temporelle de 18 h à 6 h.

Le moteur ne dépend pas de React ou de MapLibre. L’adaptateur cartographique transforme uniquement son résultat en GeoJSON.

## Calculs

Astronomy Engine calcule les positions horizontales à partir des coordonnées, de la date et de l’heure. Les azimuts de lever et coucher sont obtenus à l’instant exact de chaque événement. La Voie Lactée utilise la position du noyau galactique et une trajectoire échantillonnée toutes les vingt minutes. Le point culminant est l’échantillon visible de plus haute altitude.

La projection cartographique est une rose céleste centrée sur le point de prise de vue : l’azimut devient le cap au sol et l’altitude réduit la distance au centre. Les extrémités des rayons indiquent donc une direction, pas une position géographique réelle.

## Mode Composition

Lorsque le mode est actif, le curseur devient une croix. Un clic place le point de prise de vue et recalcule immédiatement tous les guides. Le lieu recherché reste inchangé ; seul le référentiel des guides est déplacé.

## Extensions prévues

`PhotoGuidePlan` pourra accueillir sans modifier les contrôles existants : champ de vision et focale, horizon réel, altitude du relief, masques montagne et alignements entre sujet et astre.

## Limites

- Horizon astronomique théorique, sans relief ni bâtiments.
- Réfraction standard fournie par Astronomy Engine.
- La trajectoire galactique est une aide directionnelle et non une simulation photographique du ciel.
