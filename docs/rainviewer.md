# Radar pluie RainViewer

## Fonctionnement

La couche **Radar pluie** affiche de véritables tuiles raster RainViewer sur toute la zone visible de la carte. L’application récupère la chronologie via `https://api.rainviewer.com/public/weather-maps.json`, puis construit les URL de tuiles à partir de l’hôte et du chemin fournis par RainViewer.

L’API publique fournit les observations radar des deux dernières heures, généralement espacées de dix minutes. Il s’agit donc d’une animation de mesures récentes et non d’une prévision. Depuis janvier 2026, RainViewer ne propose plus les images futures (nowcast) dans cette API publique.

La palette Universal Blue est utilisée avec des tuiles de 512 px, une transparence native et un zoom radar maximal de 7. L’opacité supplémentaire est pilotée par le Layer Manager.

## Architecture

Le module se trouve dans `src/features/weather/radar/` :

- `services/RadarService.ts` est l’unique point d’accès à RainViewer ;
- `components/RadarLayer.tsx` gère la source et la couche raster MapLibre ;
- `components/RadarControls.tsx` fournit le lecteur temporel ;
- `hooks/` relie les requêtes, la lecture et l’analyse d’un lieu ;
- `store/useRadarStore.ts` conserve la chronologie, l’image active, l’état de lecture et la vitesse ;
- `types/` et `utils/` isolent le contrat fournisseur et les calculs de tuiles.

Le panneau du lieu ne déclenche aucun appel météo ponctuel : il échantillonne la tuile de l’image active pour fournir un résumé indicatif (`Pas de pluie`, `Faible`, `Modérée`, `Forte`). Aucune prévision n’est calculée.

## Cache et performance

La chronologie est mise en cache pendant cinq minutes par TanStack Query et par le service. Elle est actualisée toutes les cinq minutes uniquement lorsque la couche est active.

MapLibre charge seulement les tuiles nécessaires à la zone visible. Le passage à une autre image remplace les URL de la source existante et bénéficie du cache HTTP du navigateur. Les tuiles de 512 px réduisent le nombre de requêtes. La couche et sa source sont supprimées lorsqu’elle est désactivée.

Le cache des analyses par lieu est indexé par image et coordonnées pendant trente minutes. Cette stratégie limite les relectures d’une même tuile et respecte la limite publique annoncée par RainViewer de 100 requêtes par minute et par adresse IP.

## Animation

Le lecteur permet :

- image précédente et suivante ;
- lecture et pause ;
- navigation avec un curseur temporel ;
- vitesses de 0,5× à 2×.

Le fondu raster MapLibre rend les changements d’image plus fluides. L’animation boucle sur les images disponibles.

## Ajouter un autre fournisseur

Un futur fournisseur doit implémenter `IRadarService` et retourner un `RadarTimeline` normalisé. Les composants et le store ne dépendent pas du format JSON de RainViewer. Le remplacement consiste donc à créer un nouveau service, à adapter la construction des URL de tuiles et à injecter son instance dans les hooks.

Il faudra également vérifier sa licence, son attribution, sa fréquence de mise à jour, son niveau de zoom maximal et sa politique de cache.

## Limites et licence

La couverture dépend du réseau radar disponible dans chaque pays. L’heure d’une image correspond à l’observation publiée par RainViewer, pas nécessairement à l’instant présent exact. Le résumé au niveau d’un lieu reste une approximation graphique et ne doit pas servir d’alerte de sécurité.

L’API publique RainViewer est annoncée pour les projets personnels et éducatifs. Un usage commercial ou à fort trafic devra faire l’objet d’une vérification des conditions et, si nécessaire, d’un accord avec RainViewer.

Références :

- [Weather Maps API](https://www.rainviewer.com/api/weather-maps-api.html)
- [Transition FAQ 2026](https://www.rainviewer.com/api/transition-faq.html)
