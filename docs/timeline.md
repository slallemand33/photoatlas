# Timeline photographique

## Philosophie

La Timeline n'est plus un tableau de bord. PhotoAtlas reste avant tout une application cartographique : la carte doit conserver l'espace principal et le panneau de droite reste l'endroit où consulter les détails.

La Timeline devient un contrôle temporel compact. Son rôle est de choisir un moment de la journée et de donner un contexte visuel rapide sur les grandes phases lumineuses.

## Rôle

Le composant `PhotoTimeline24h` permet uniquement de :

- lire les grandes phases de la journée;
- déplacer le curseur temporel;
- cliquer sur quelques événements majeurs;
- piloter les guides Soleil, Lune et Voie Lactée via `selectedTime`.

Les horaires détaillés, descriptions, recommandations et analyses restent dans le panneau de droite.

## Interface

La Timeline conserve une frise horizontale 24 h sur desktop, tablette et mobile. Elle se comporte comme un contrôle de lecture discret plutôt qu'une chronologie détaillée.

Elle affiche :

- les bandes Nuit astronomique, Blue Hour, Golden Hour, Journée et Voie Lactée;
- quelques icônes Lucide pour les événements principaux;
- le curseur temporel avec l'heure juste au-dessus;
- les repères 00:00, 06:00, 12:00, 18:00 et 24:00;
- une légende compacte sur les écrans assez larges.

Les bandes sont semi-transparentes et servent de repères visuels. Les icônes restent espacées pour éviter les chevauchements.

## Événements

Le `TimelineEngine` continue de calculer tous les événements existants. La présentation ne montre que les repères nécessaires au contrôle temporel :

- Lever du soleil
- Midi solaire
- Coucher du soleil
- Lever de lune
- Coucher de lune
- Début de visibilité de la Voie Lactée
- Passage du noyau galactique au plus haut

Les événements trop proches sont filtrés sur la frise pour préserver la lisibilité. Les informations complètes restent disponibles dans le panneau de droite.

## Synchronisation

Le curseur et les icônes appellent `useTimelineStore.setSelectedTime(date)`.

```txt
Timeline UI
  -> useTimelineStore.setSelectedTime(date)
  -> useTimeline
  -> useAstronomyStore.setSelectedDate(date)
  -> GuideEngine / AstronomyPanel
```

Déplacer le curseur ou cliquer sur une icône recalcule donc les guides Soleil, Lune et Voie Lactée sans modifier les calculs du moteur.

## Séparation Des Responsabilités

La Timeline ne duplique plus :

- Planning photo;
- listes d'événements;
- cartes détaillées;
- descriptions longues;
- recommandations.

Le panneau de droite est l'unique source d'information détaillée. La Timeline reste un contrôle de temps.

## Performance

La simplification ne modifie pas les calculs. Les données quotidiennes restent produites par `TimelineEngine`; le composant applique seulement un filtrage et une présentation compacte.

Déplacer le curseur ne recalcule pas toute la frise. Seules les vues dépendantes de l'heure active se mettent à jour.
