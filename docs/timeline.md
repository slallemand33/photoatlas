# Timeline photographique

## Rôle

La Timeline 24 h est la référence temporelle de PhotoAtlas. Elle couvre la journée locale de 00:00 à 24:00 et synchronise le panneau Astronomie ainsi que les Guides Soleil, Lune et Voie Lactée.

## Architecture

Le module `features/timeline/` est organisé en composants, hooks, services, store et types.

- `TimelineEngine` calcule les événements, leur ordre, leur minute dans la journée et les bandes colorées.
- `useTimelineStore` conserve l’heure choisie et le résultat quotidien.
- `useTimeline` initialise la journée du lieu, recalcule uniquement lors d’un changement de lieu ou de date et transmet l’heure à `useAstronomyStore`.
- `PhotoTimeline24h` ne fait que représenter le résultat et transmettre les mouvements du curseur.
- `TodayTimelineCard` affiche les trois prochains événements et leur temps restant.

Les Guides Photo lisent directement `selectedTime` dans le store de la Timeline. Leur `GuideEngine` recalcule alors les positions exactes des trois objets célestes.

## Événements

La première version calcule : nuit et crépuscules astronomiques, crépuscules nautiques et civils, Blue Hours, Golden Hours, lever/coucher et midi solaire, lever/coucher de Lune, début/fin de visibilité de la Voie Lactée et culmination du noyau galactique.

Les événements sont identifiables par une icône, un libellé accessible, une heure et un tooltip. Les bandes donnent le contexte lumineux sans dépendre uniquement de la couleur.

## Synchronisation

- Activation du guide Soleil : retour à l’heure actuelle.
- Activation de Voie Lactée : positionnement au début de la nuit astronomique du soir.
- Déplacement manuel : liberté totale sur les 1 440 minutes de la journée.
- Changement de jour ou de lieu : recalcul des événements quotidiens.

## Performance

Les événements quotidiens sont mémoïsés par lieu et date. Déplacer le curseur ne recalcule pas la frise ; seuls Astronomy Engine et GuideEngine recalculent les positions nécessaires. La visibilité galactique est échantillonnée toutes les dix minutes lors du calcul quotidien.

## Extensions

De nouveaux événements peuvent être ajoutés à `TimelineEventKind`, puis produits par `TimelineEngine` sans modifier les composants : marées, météo horaire, passages satellites, fenêtre de brouillard, seeing ou rendez-vous personnels.
