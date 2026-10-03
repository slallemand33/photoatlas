=== INVESTIGATION DOUBLONS IMPORT AQUITAINE ===

### Erreur

Le script d'import s'est arrêté sur :

- `Import Premium Aquitaine interrompu : doublon potentiel détecté parmi les nouveaux spots.`

### Règle actuelle

Le contrôle exact du script est :

```sql
WITH new_spots AS (
  ... 12 lignes ...
)
SELECT 1
FROM new_spots n
JOIN public.spots s
  ON s.slug = n.slug
  OR (s.source = n.source AND s.source_external_id = n.source_external_id)
  OR (
    lower(s.name) = lower(n.name)
    AND ST_DWithin(
      s.position,
      ST_SetSRID(ST_MakePoint(n.longitude, n.latitude), 4326)::geography,
      250
    )
  )
```

Critères utilisés :

1. `slug` identique
2. `source` + `source_external_id` identiques
3. `nom identique` + distance `<= 250 m`

Seuil de distance :

- `250 m`

Colonnes comparées :

- `public.spots.slug`
- `public.spots.source`
- `public.spots.source_external_id`
- `public.spots.name`
- `public.spots.position`
- `new_spots.slug`
- `new_spots.source`
- `new_spots.source_external_id`
- `new_spots.name`
- `new_spots.longitude`
- `new_spots.latitude`

Point essentiel : la règle ne compare pas les 12 nouveaux spots entre eux. Elle compare les 12 nouveaux spots avec `public.spots`.

### Doublons internes

Résultat de la reproduction stricte sur les 12 nouveaux spots entre eux :

- AUCUN DOUBLON INTERNE AUX 12 NOUVEAUX SPOTS

### Critère slug

Nombre de collisions :

- 0

Paires :

- aucune

### Critère source_external_id

Nombre de collisions :

- 0

Paires :

- aucune

### Critère nom + distance

Nombre de collisions :

- 0

Paires :

- aucune

### Compteur réel

Compteur reproduit sur les 12 nouveaux spots uniquement :

- `duplicate_count = 0`

Compteur reproduit sur les spots du référentiel pilote connus dans le dépôt :

- `duplicate_count = 0`

Conclusion : l'erreur ne provient pas d'un doublon interne entre les 12 nouveaux spots, ni d'un conflit avec les 10 spots pilote connus localement.

### Paires responsables

Paires responsables détectées entre les 12 nouveaux spots :

- aucune

Paires responsables détectées entre les 12 nouveaux spots et le référentiel pilote connu dans le dépôt :

- aucune

### Analyse détaillée

Les groupes soupçonnés ont été examinés implicitement par la règle exacte.

Ports :

- `Port de Gujan`
- `Port de la Mole`
- `Port de Meyran`

Ils sont géographiquement proches, mais n'ont :

- ni slug identique ;
- ni `source_external_id` identique ;
- ni nom identique.

Ils ne déclenchent donc pas la règle actuelle.

Phares :

- `Phare de la Pointe de Grave`
- `Phare Saint-Nicolas`

Ils ont des noms différents, des `source_external_id` différents et des coordonnées éloignées. Ils ne déclenchent pas la règle.

Feux / viewpoint :

- `Feu de Sainte Barbe`
- `Phare de la Pointe Saint-Martin`

Ils sont distincts sur les trois critères de la règle. Ils ne déclenchent pas la règle.

### Vrais doublons

Aucun vrai doublon détecté localement parmi les 12 nouveaux spots.

### Lieux proches mais distincts

Aucun cas déclencheur localement parmi les 12 nouveaux spots.

### Ensembles / sous-entités

Les trois ports ostréicoles de Gujan-Mestras appartiennent à un même secteur géographique, mais ils ne sont pas considérés comme doublons par la règle actuelle, précisément parce que la règle ne s'appuie pas sur la seule proximité.

### Comparaison avec public.spots

Comparaison avec les spots déjà présents dans le référentiel pilote du dépôt :

| Nouveau | Existant | Distance | Nom identique | Slug identique | source_external_id identique | Résultat |
|---|---|---:|---|---|---|---|
| aucune correspondance locale | | | | | | |

Important : l'erreur réelle Supabase implique donc très probablement l'existence dans `public.spots` d'au moins un spot supplémentaire, absent du référentiel pilote local du dépôt, qui satisfait l'un des trois critères.

### Cause exacte

La cause exacte est la suivante :

1. Le message d'erreur est trompeur : il parle de doublon "parmi les nouveaux spots".
2. La requête ne compare pas les nouveaux spots entre eux.
3. Elle compare les nouveaux spots à `public.spots`.
4. La reproduction locale montre :
   - 0 doublon interne aux 12 nouveaux spots ;
   - 0 collision avec les spots pilote connus dans le dépôt.
5. L'erreur réelle provient donc d'une collision avec un spot déjà présent dans `public.spots` en base Supabase, mais non représenté dans les seeds locales utilisées ici.

Sans lecture directe de la base Supabase, il est impossible d'identifier de manière certaine le spot existant exact responsable.

### Correction minimale proposée

Ne pas modifier immédiatement la règle dans le script.

Correction minimale à envisager ensuite, après confirmation du ou des spots réels en base :

- exécuter d'abord une requête de diagnostic en lecture seule contre `public.spots` qui retourne les lignes correspondantes au `JOIN` de doublon ;
- inspecter les correspondances réelles ;
- seulement ensuite décider si la règle doit exclure certains cas de proximité ou si un spot existe déjà et doit être traité comme existant.

### Modification

AUCUNE

### Production

Supabase : NON MODIFIÉ
public.spots : NON MODIFIÉ
Import : NON EFFECTUÉ