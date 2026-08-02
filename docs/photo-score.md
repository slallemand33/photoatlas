# Photo Score

## Rôle

`features/photo-score/` transforme les données déjà disponibles dans PhotoAtlas en décisions photographiques lisibles. Le moteur ne dépend ni de React ni de MapLibre. Il reçoit un snapshot normalisé, calcule les recommandations, puis renvoie un résultat prêt à afficher.

La fonctionnalité est organisée ainsi :

- `services/PhotoScoreEngine.ts` : moteur et pondérations ;
- `types/` : contrats d’entrée, recommandations et événements ;
- `utils/` : normalisation des scores, étoiles et timeline ;
- `hooks/usePhotoScore.ts` : assemblage des données existantes ;
- `store/` : dernier résultat calculé, disponible pour les futures vues ;
- `components/` : cartes du tableau de bord, classement et timeline.

## Données utilisées

Le moteur ne crée aucun nouveau fournisseur :

- Open-Meteo : nuages totaux/bas/moyens/hauts, pluie, précipitations, vent à 10 m, visibilité et code météo ;
- estimation VIIRS existante : niveau de pollution lumineuse et indice Bortle ;
- Astronomy Engine : Soleil, Golden Hour, Blue Hour, nuit astronomique, Lune et noyau galactique ;
- RainViewer : signal radar au lieu lorsque la timeline radar est chargée ;
- OpenWeather : activité électrique lorsque la couche Orages dispose d’un snapshot.

La requête Open-Meteo ponctuelle existante a été enrichie. Nuages et conditions photo partagent désormais le même cache et la même actualisation ; il n’y a pas de second appel météo concurrent.

## Calculs de la première version

Tous les scores sont bornés entre 0 et 100, puis convertis en une note de une à cinq étoiles.

### Astro

Le score privilégie un ciel dégagé, une faible pollution lumineuse et une faible illumination lunaire. La pluie radar peut appliquer une pénalité. L’heure recommandée privilégie le passage du noyau galactique ou le début de la nuit astronomique.

### Lever et coucher du soleil

Une couverture nuageuse intermédiaire et des nuages hauts sont valorisés, car ils peuvent porter les couleurs. Les précipitations, le vent fort, le brouillard et la faible visibilité dégradent le résultat. Le départ est conseillé 45 minutes avant l’événement.

### Paysage

Le moteur valorise la visibilité lointaine, un ciel légèrement texturé, l’absence de pluie et un vent limité. Il propose la prochaine Golden Hour comme créneau principal.

### Orages

Le score utilise en priorité le niveau d’activité électrique, puis le signal radar ou les précipitations et la couverture nuageuse. En l’absence de snapshot de foudre, la recommandation est explicitement marquée comme partielle ; aucune activité n’est inventée. La carte rappelle que PhotoAtlas ne remplace pas les alertes officielles.

## Timeline

La timeline est construite automatiquement à partir des éphémérides du lieu : Blue Hour, Golden Hour, lever et coucher du Soleil, nuit astronomique, culmination du noyau galactique et lever de la Lune. Chaque événement photographique reprend le score de sa famille ; les événements purement informatifs, comme le lever de Lune, restent sans note artificielle.

## Limites actuelles

- Les conditions météo décrivent le snapshot ponctuel actuel, pas encore une prévision recalculée à chaque événement de la journée.
- L’estimation de pollution lumineuse est approximative et pourra être remplacée sans changer le moteur.
- Le signal radar n’est utilisé que lorsqu’une image RainViewer est déjà disponible.
- Le brouillard est déduit du code météo Open-Meteo et de la visibilité ; il ne possède pas encore de modèle dédié.
- Les horaires sont rendus dans le fuseau de l’appareil, comme le panneau Astronomie actuel.

## Ajouter un type de photographie

1. Ajouter son identifiant à `PhotoRecommendationKind`.
2. Écrire une fonction de calcul pure recevant `PhotoScoreInput`.
3. Ajouter la recommandation à `PhotoScoreEngine.calculate()`.
4. Déclarer son icône, son accent visuel et son libellé dans les composants.
5. Ajouter ses éventuels événements à `buildPhotoTimeline()`.

De nouvelles mesures — seeing, transparence, humidité, marées ou historique personnel — peuvent être ajoutées comme champs optionnels de `PhotoScoreInput`. Les composants n’ont pas à connaître leur formule : ils continuent de recevoir le même contrat `PhotoRecommendation`.
