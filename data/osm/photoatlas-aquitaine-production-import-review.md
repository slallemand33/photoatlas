### INSERT

Nombre :
12

Liste :

- Feu de Sainte Barbe
- Phare d'Hourtin
- Phare de Ciboure
- Phare de Contis
- Phare de la Pointe de Grave
- Phare de Patiras
- Phare Saint-Nicolas
- Port de Gujan
- Port de la Mole
- Port de Meyran
- Observatoire de Bordeaux
- Phare de la Pointe Saint-Martin

Colonnes alimentées pour les nouveaux spots :

- name
- slug
- position
- country_code
- region
- spot_type
- source
- source_external_id
- source_type
- spot_type_id

Colonnes volontairement non modifiées / non alimentées :

- locality
- status
- description
- landscape_potential
- sunrise_potential
- sunset_potential
- astro_potential

Note schéma :

- `public.spots` possède `source`, `source_external_id` et `source_type`
- `public.spots` ne possède pas de colonne `osm_id`
- `public.spots` ne possède pas de colonne `placeKey`

### UPDATE spot_type_id

Nombre :
0

Liste :

- aucune écriture

Périmètre :

- aucun `UPDATE public.spots`
- assertion préalable sur les 6 `spot_type_id` existants

Cause du retrait du bloc UPDATE :

- Réserve ornithologique du Teich possède déjà le `spot_type_id` de `bird_reserve`
- Observatoire Sainte-Cécile possède déjà le `spot_type_id` de `observatory`
- l'ancienne assertion attendait à tort 2 lignes mises à jour alors que l'état réel de la base produit 0 ligne

### Spots protégés

Nombre :
6

Liste :

- Dune du Pilat
- Banc d'Arguin
- Port de Larros
- Phare du Cap-Ferret
- Réserve ornithologique du Teich
- Observatoire Sainte-Cécile

Règle :

- aucun `UPDATE`
- aucun changement de coordonnées
- aucun changement de nom
- aucun changement de description
- aucun changement de status
- aucun changement de potentiels

### Types

Types contrôlés dans le SQL :

- bird_reserve
- dune
- harbour
- lighthouse
- observatory
- oyster_harbour
- sandbank
- viewpoint

Méthode :

- lookup par `public.spot_types.slug`
- aucun UUID codé en dur
- vérification préalable des 6 `spot_type_id` existants

### Compatibilités

Types vérifiés :

- bird_reserve
- dune
- harbour
- lighthouse
- observatory
- oyster_harbour
- sandbank
- viewpoint

Compatibilités attendues pour chaque type :

- landscape
- sunrise
- sunset
- storm
- astro

### DELETE

0

### TRUNCATE

0

### Autres UPDATE

0

Le script ne contient plus aucun `UPDATE public.spots`.

### Sécurité

Assertions incluses avant écriture :

- 18 Premium attendus
- 12 nouveaux spots attendus
- 0 mise à jour `spot_type_id` attendue
- 6 spots existants attendus
- présence des 8 types requis
- présence des compatibilités requises
- absence de doublon évident avant insertion
- présence des 6 `spot_type_id` existants attendus
- aucun champ obligatoire manquant dans les 12 nouveaux
- coordonnées valides pour les 12 nouveaux

Contrôles inclus après écriture :

- 12 insertions réalisées
- 0 mise à jour réalisée
- 6 spots existants inchangés
- 18 spots Premium présents au total
- aucun doublon de slug sur le périmètre

### Production

Supabase modifié : NON
public.spots modifiée : NON

Le script a été généré uniquement pour exécution manuelle ultérieure.
Il n'a pas été exécuté.

### Dépendances TEMP

Le script ne dépend plus d'aucune table temporaire partagée entre plusieurs statements.

- CREATE TEMP TABLE : 0
- données métier injectées via CTE locales dans les requêtes qui en ont besoin
- snapshots avant/après des 6 spots existants conservés dans des variables JSONB à l'intérieur d'un seul bloc `DO`