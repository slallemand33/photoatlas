# Production Import Bretagne

## Source

data/osm/bretagne/bretagne-editorial.json

## Volume

Catalogue :
105

INSERT :
105 lignes logiques

UPDATE :
0

DELETE :
0

## Types

- bird_reserve : 2
- bridge : 1
- castle : 18
- fortification : 5
- lighthouse : 39
- monument : 2
- observatory : 23
- ruins : 14
- viewpoint : 1

## Status

candidate :
105

## Sécurité

BEGIN :
oui

COMMIT :
oui

INSERT INTO public.spots :
1

UPDATE :
0

DELETE :
0

TRUNCATE :
0

DROP :
0

ALTER :
0

## Contrôles avant import

- 105 lignes catalogue attendues et vérifiées.
- Tous les slugs catalogue doivent être uniques.
- Tous les sourceExternalId catalogue doivent être uniques.
- Tous les couples osmType/osmId catalogue doivent être uniques.
- Tous les types catalogue doivent exister dans public.spot_types.
- Aucun source_external_id normalisé du catalogue ne doit déjà exister dans public.spots.
- Aucun slug du catalogue ne doit déjà exister dans public.spots.

## Contrôles après import

- Les contrôles post-import sont exécutés dans des statements séparés du statement INSERT afin de lire les lignes réellement insérées dans le même bloc transactionnel.
- 105 lignes insérées exactement.
- 105 source_external_id normalisés présents.
- 105 slugs présents.
- 105 status = candidate.
- 105 spot_type_id valides.
- Aucune différence sur name, slug, source, source_external_id normalisé, source_type, status, spot_type, spot_type_id et coordonnées.
- Aucun doublon sur source + source_external_id.
- Aucun doublon sur slug.

## Rollback

- Toute assertion échoue via RAISE EXCEPTION.
- La transaction BEGIN/COMMIT est alors interrompue et l import est annulé.

## Production

Supabase :
NON MODIFIÉ
