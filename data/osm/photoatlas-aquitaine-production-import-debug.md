=== DIAGNOSTIC TEMP TABLE IMPORT AQUITAINE ===

### Erreur

Supabase a renvoyé :

- `ERROR: 42P01: relation "photoatlas_premium_new_spots" does not exist`

### Cause exacte

Le script précédent créait `photoatlas_premium_new_spots` via :

- `CREATE TEMP TABLE photoatlas_premium_new_spots ON COMMIT DROP AS ...`

puis la relisait plus tard dans d'autres statements indépendants, notamment un bloc `DO $$ ... $$` et un `INSERT INTO public.spots ... SELECT ... FROM photoatlas_premium_new_spots`.

Dans Supabase SQL Editor, ce mode d'exécution n'est pas robuste : l'état d'une table temporaire créée dans un statement précédent n'est pas garanti pour les statements suivants dans ce contexte d'exécution. Avec `ON COMMIT DROP`, la dépendance devient encore plus fragile.

Le premier read ultérieur sur `photoatlas_premium_new_spots` échouait donc parce que la relation temporaire n'était plus visible au moment de son utilisation.

### Table concernée

- `photoatlas_premium_new_spots`

### Ordre d'exécution problématique

1. `BEGIN;`
2. `CREATE TEMP TABLE photoatlas_premium_new_spots ON COMMIT DROP AS ...`
3. `CREATE TEMP TABLE photoatlas_premium_existing_spots ON COMMIT DROP AS ...`
4. `DO $$ ... SELECT count(*) FROM photoatlas_premium_new_spots ... $$`
5. `CREATE TEMP TABLE ...`
6. `INSERT INTO public.spots ... SELECT ... FROM photoatlas_premium_new_spots`

Le problème n'était pas la logique métier, mais la dépendance inter-statements à une table temporaire.

### Autres tables TEMP

L'ancienne version utilisait aussi :

- `photoatlas_premium_existing_spots`
- `photoatlas_existing_before`
- `photoatlas_inserted_spots`

Toutes reposaient sur le même principe de visibilité inter-statements et participaient au risque structurel.

### Correction proposée

Suppression de toutes les dépendances aux TEMP tables.

Le nouveau script :

- conserve `BEGIN ... COMMIT`
- conserve les assertions `RAISE EXCEPTION`
- conserve les 12 `INSERT`
- conserve 0 `UPDATE`
- conserve la protection des 6 spots existants
- remplace les TEMP tables par des CTE locales répétées au besoin
- capture l'état des 6 spots existants dans un bloc `DO` via des variables JSONB avant et après insertion

### Pourquoi cette correction est robuste

- chaque statement devient autonome
- aucune donnée intermédiaire n'est stockée dans une relation temporaire externe au statement
- le bloc `DO` encapsule les snapshots et les comparaisons des spots existants dans le même contexte d'exécution
- la logique reste transactionnelle et strictement bornée au périmètre validé

### Périmètre conservé

- 12 INSERT
- 0 UPDATE
- 6 NO_CHANGE

### Test

Test PostgreSQL réel non reproduit localement : aucun client/serveur PostgreSQL local n'a été utilisé pour exécuter le script.

Validation réalisée localement :

- audit structurel du SQL
- vérification des compteurs attendus
- vérification de l'absence de `UPDATE public.spots`, `DELETE`, `TRUNCATE`, `UPSERT`
- vérification du maintien de `BEGIN` / `COMMIT`

### Production

Supabase : NON MODIFIÉ

Le script corrigé n'a pas été exécuté.
