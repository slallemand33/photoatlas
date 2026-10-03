=== DEBUG COMPARAISON BRETAGNE ===

Problème de l'ancienne approche :

- plusieurs chemins de matching coexistaient ;
- une sortie pouvait classer un spot en NOUVEAU ;
- une autre sortie pouvait classer le même spot en EXISTANT_CORRECT ;
- le fichier ne disposait donc pas d'une source de vérité unique.

Cause exacte de la contradiction 105 NOUVEAU / 12 EXISTANT_CORRECT :

- le contrôle des 12 spots n'était pas calculé directement depuis la même classification que les compteurs globaux ;
- il utilisait une logique parallèle dédiée ;
- la sortie principale et le contrôle 12 ne lisaient donc pas la même réalité de matching.

Nouvelle stratégie appliquée :

- un seul bloc editorial_spots ;
- une seule CTE source_matches ;
- une seule CTE classified ;
- aucun moteur parallèle de matching ;
- toutes les sorties lisent directement classified.

Structure retenue :

- editorial_spots prépare les 105 spots du catalogue ;
- source_matches fait le match principal uniquement par source_external_id OSM normalisé ;
- classified agrège les matches par place_key et décide la catégorie ;
- aucun LEFT JOIN LATERAL ;
- aucun best_match ;
- aucun match_agg ;
- aucun match_candidates.

Règles de matching uniques :

1. match principal par source = osm + source_external_id normalisé
2. contrôle séparé des slugs après match principal
3. contrôle séparé nom + distance <= 250 m uniquement pour signaler MATCH_POTENTIEL sur les NOUVEAU

Règles de classification uniques :

- aucun match OSM : NOUVEAU
- plusieurs matches OSM sur le même source_external_id normalisé : DOUBLON_AMBIGU
- un match OSM unique et conforme : EXISTANT_CORRECT
- un match OSM unique mais avec différence de slug, type ou status : EXISTANT_A_CORRIGER

Pourquoi cette version évite la contradiction :

- futures_operations_potentielles est calculé depuis classified ;
- le détail des 105 spots est calculé depuis classified ;
- le contrôle des 12 spots est un simple filtre sur classified ;
- les compteurs globaux sont calculés depuis classified ;
- la répartition par type et par status est calculée depuis classified.

Validation statique effectuée :

- 105 lignes dans editorial_spots ;
- 1 occurrence de WITH editorial_spots AS ( ;
- 1 occurrence de source_matches AS ( ;
- 1 occurrence de classified AS ( ;
- 0 LEFT JOIN LATERAL ;
- 0 best_match ;
- 0 match_agg ;
- 0 match_candidates ;
- 0 logique parallèle reference_spots ;
- 0 duplication d'ancien bloc ;
- 0 écriture SQL.

Validation logique locale effectuée :

- les 12 spots de référence tombent sur 12/12 EXISTANT_CORRECT avec la même hiérarchie de matching ;
- pour les 12 spots connus, le meilleur rang observé est 1 ;
- la distance observée est 0 m sur les cas de référence testés localement.

Supabase : NON MODIFIÉ
public.spots : NON MODIFIÉ