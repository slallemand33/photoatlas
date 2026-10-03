# Comparaison SQL Bretagne / Supabase LIVE

Ce fichier SQL doit être exécuté manuellement dans Supabase -> SQL Editor.

## Pourquoi ce SQL

- La tentative précédente via la clé publishable de l'application était incomplète.
- La lecture applicative ne voyait que 22 spots verified visibles publiquement.
- La comparaison exhaustive des 105 spots Bretagne doit donc être faite directement côté base, dans SQL Editor, contre l'intégralité de public.spots.

## Source locale

- Catalogue : data/osm/bretagne/bretagne-editorial.json
- Volume : 105 spots

## Portée de la requête

La requête :
- charge les 105 spots dans une CTE editorial_spots ;
- compare par priorité source + source_external_id, puis slug, puis nom + distance <= 250 m ;
- compare le type éditorial avec public.spot_types.slug ;
- calcule les catégories EXISTANT_CORRECT, EXISTANT_A_CORRIGER, NOUVEAU, DOUBLON_AMBIGU ;
- retourne aussi les compteurs, la répartition par type, la répartition par status visible et les collisions source/source_external_id.

## Sécurité

- Requête strictement en lecture seule
- Aucun effet d'écriture attendu dans Supabase
- Prévue pour SQL Editor uniquement

## Fichier à exécuter

- data/osm/bretagne/bretagne-supabase-live-comparison.sql

