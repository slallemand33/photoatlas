# Moteur astronomique

## Objectif

Le moteur astronomique de PhotoAtlas calcule localement les éphémérides utiles à la photographie. Il ne dépend ni de MapLibre, ni d’un fond de carte, ni d’une API distante. Une position géographique et une date suffisent à produire un `AstronomySnapshot` sérialisable.

## Bibliothèque choisie

PhotoAtlas utilise [Astronomy Engine](https://github.com/cosinekitty/astronomy), version JavaScript/TypeScript, sous licence MIT.

Ce choix a été préféré à SunCalc pour quatre raisons :

- les calculs du Soleil et de la Lune reposent sur une même base astronomique ;
- la bibliothèque gère les levers et couchers avec réfraction et diamètre apparent ;
- elle fournit les coordonnées équatoriales, horizontales et les étoiles personnalisées nécessaires au noyau galactique ;
- elle est testée par son auteur contre NOVAS et JPL Horizons, avec une précision annoncée proche de la minute d’arc.

SunCalc aurait suffi pour les heures solaires courantes, mais aurait demandé une seconde implémentation pour la Voie Lactée et les extensions astronomiques futures.

## Architecture

```text
src/features/astronomy/
├── components/
│   └── AstronomyPanelCard.tsx
├── hooks/
│   └── useAstronomy.ts
├── services/
│   └── AstronomyService.ts
├── store/
│   └── useAstronomyStore.ts
├── types/
│   └── astronomy.types.ts
└── utils/
    ├── direction.ts
    ├── formatAstronomy.ts
    └── moonPhase.ts
```

`AstronomyService` implémente `IAstronomyService`. Le service ne connaît que `AstronomyLocation`, `Date` et les types du domaine. Le hook apporte le cache et l’actualisation de l’interface. Le store permettra ensuite de sélectionner une date sans modifier le moteur.

La méthode publique `getGalacticCenterPosition()` expose déjà la primitive dont une future couche MapLibre aura besoin pour échantillonner une trajectoire.

## Calculs solaires

Les levers et couchers utilisent `SearchRiseSet`, qui tient compte de la réfraction atmosphérique moyenne et du bord apparent du disque solaire.

Les fenêtres photographiques et les crépuscules utilisent le centre du Soleil et les seuils d’altitude suivants :

| Période                 | Définition utilisée                          |
| ----------------------- | -------------------------------------------- |
| Golden Hour du matin    | lever du Soleil → altitude +6°               |
| Golden Hour du soir     | altitude +6° descendante → coucher du Soleil |
| Blue Hour du matin      | altitude −6° → −4° montante                  |
| Blue Hour du soir       | altitude −4° → −6° descendante               |
| Crépuscule civil        | Soleil entre 0° et −6°                       |
| Crépuscule nautique     | Soleil entre −6° et −12°                     |
| Crépuscule astronomique | Soleil entre −12° et −18°                    |
| Nuit astronomique       | Soleil sous −18°                             |

Les définitions de Golden Hour et Blue Hour ne sont pas universelles. PhotoAtlas centralise donc ces seuils dans le service afin de pouvoir les rendre configurables plus tard.

Dans les régions polaires, certains événements n’existent pas pendant plusieurs jours ou semaines. Le moteur renvoie alors `null`; l’interface affiche « Indisponible » au lieu d’inventer une heure.

## Lune

Les levers et couchers lunaires utilisent également `SearchRiseSet`. La phase est calculée avec `MoonPhase`, puis classée en huit phases usuelles. La fraction éclairée vient de `Illumination(Body.Moon)`.

La phase et l’illumination sont géocentriques. Les horaires de lever et coucher sont calculés pour les coordonnées du lieu.

## Voie Lactée et noyau galactique

Le noyau galactique est représenté par les coordonnées équatoriales J2000 de Sagittarius A* : ascension droite approximative `17 h 45 min 40 s`, déclinaison `−29° 00′ 28″`. Astronomy Engine le traite comme une étoile fixe personnalisée.

Pour chaque calcul, le moteur fournit :

- azimut et hauteur actuels du noyau ;
- présence au-dessus ou sous l’horizon ;
- prochain lever, coucher et passage au méridien ;
- hauteur du noyau lors du passage au méridien ;
- position opposée de l’anti-centre galactique.

La propriété `milkyWay.visible` exige que le noyau soit au-dessus de l’horizon et que le Soleil soit sous −12°. Elle indique une possibilité géométrique, pas une garantie photographique : nuages, Lune, pollution lumineuse, relief et saison doivent encore être combinés.

## Cache et affichage

Les calculs courants sont rafraîchis toutes les cinq minutes et conservés une heure par TanStack Query. Une date explicitement sélectionnée est considérée immuable et reste en cache.

Les dates sont stockées en ISO UTC. L’interface actuelle les affiche dans le fuseau horaire de l’appareil. Une évolution future pourra associer un fuseau IANA au lieu sélectionné pour afficher directement son heure locale.

## Extensions futures

Le moteur permet d’ajouter sans dépendance cartographique :

- trajectoire temporelle du noyau et de la bande galactique ;
- orientation de l’arche de la Voie Lactée ;
- calendrier des nouvelles lunes et pleines lunes ;
- altitude et azimut de la Lune et des planètes ;
- conjonctions, éclipses et pluies de météores ;
- masques d’horizon liés au relief ;
- score astro combinant nuit, Lune, nuages et pollution lumineuse.

La future couche cartographique devra consommer les positions calculées par le service. Elle ne devra pas déplacer les calculs astronomiques dans un composant MapLibre.

## Limites

- Les horaires supposent un horizon théorique dégagé.
- La réfraction réelle varie avec la pression, la température et l’humidité.
- Les coordonnées fixes du noyau suffisent à l’échelle photographique, mais ne modélisent pas la structure détaillée de toute la bande galactique.
- Aucun calcul astronomique ne remplace une vérification des conditions météo ou du terrain.
