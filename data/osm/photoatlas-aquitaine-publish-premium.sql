BEGIN;

-- PhotoAtlas Aquitaine premium publication plan.
-- Manual execution only. Do not run automatically from the application.
-- Scope: publish 12 existing osm spots by switching status from candidate to verified.

-- Pre-check: inspect the 12 target spots and confirm current state.
WITH target_spots AS (
  SELECT *
  FROM (
    VALUES
      ('Feu de Sainte Barbe'::text, 'feu-de-sainte-barbe'::text, 'node/2013114667'::text, 'lighthouse'::text),
      ('Observatoire de Bordeaux'::text, 'observatoire-de-bordeaux'::text, 'way/305715700'::text, 'observatory'::text),
      ('Phare d''Hourtin'::text, 'phare-d-hourtin'::text, 'way/513934973'::text, 'lighthouse'::text),
      ('Phare de Ciboure'::text, 'phare-de-ciboure'::text, 'way/72598412'::text, 'lighthouse'::text),
      ('Phare de Contis'::text, 'phare-de-contis'::text, 'way/201248452'::text, 'lighthouse'::text),
      ('Phare de la Pointe de Grave'::text, 'phare-de-la-pointe-de-grave'::text, 'way/759021127'::text, 'lighthouse'::text),
      ('Phare de la Pointe Saint-Martin'::text, 'phare-de-la-pointe-saint-martin'::text, 'way/71996554'::text, 'viewpoint'::text),
      ('Phare de Patiras'::text, 'phare-de-patiras'::text, 'way/162906928'::text, 'lighthouse'::text),
      ('Phare Saint-Nicolas'::text, 'phare-saint-nicolas'::text, 'way/192421345'::text, 'lighthouse'::text),
      ('Port de Gujan'::text, 'port-de-gujan'::text, 'way/285592011'::text, 'oyster_harbour'::text),
      ('Port de la Mole'::text, 'port-de-la-mole'::text, 'node/7512119236'::text, 'oyster_harbour'::text),
      ('Port de Meyran'::text, 'port-de-meyran'::text, 'way/286188443'::text, 'oyster_harbour'::text)
  ) AS t(name, slug, source_external_id, expected_spot_type_slug)
)
SELECT
  s.slug,
  s.name,
  s.status,
  s.source,
  s.source_external_id,
  s.spot_type,
  st.slug AS spot_type_id_slug
FROM target_spots t
JOIN public.spots s
  ON s.slug = t.slug
 AND s.source = 'osm'
 AND s.source_external_id = t.source_external_id
LEFT JOIN public.spot_types st
  ON st.id = s.spot_type_id
ORDER BY s.name;

-- Pre-check: inspect all remaining candidate spots currently present.
SELECT
  name,
  slug,
  source,
  status
FROM public.spots
WHERE status = 'candidate'
ORDER BY name;

DO $$
DECLARE
  expected_target_count integer := 12;
  found_target_count integer := 0;
  wrong_status_count integer := 0;
  wrong_source_count integer := 0;
  wrong_type_id_count integer := 0;
  updated_count integer := 0;
  remaining_candidate_count integer := 0;
  final_verified_count integer := 0;
BEGIN
  WITH target_spots AS (
    SELECT *
    FROM (
      VALUES
        ('Feu de Sainte Barbe'::text, 'feu-de-sainte-barbe'::text, 'node/2013114667'::text, 'lighthouse'::text),
        ('Observatoire de Bordeaux'::text, 'observatoire-de-bordeaux'::text, 'way/305715700'::text, 'observatory'::text),
        ('Phare d''Hourtin'::text, 'phare-d-hourtin'::text, 'way/513934973'::text, 'lighthouse'::text),
        ('Phare de Ciboure'::text, 'phare-de-ciboure'::text, 'way/72598412'::text, 'lighthouse'::text),
        ('Phare de Contis'::text, 'phare-de-contis'::text, 'way/201248452'::text, 'lighthouse'::text),
        ('Phare de la Pointe de Grave'::text, 'phare-de-la-pointe-de-grave'::text, 'way/759021127'::text, 'lighthouse'::text),
        ('Phare de la Pointe Saint-Martin'::text, 'phare-de-la-pointe-saint-martin'::text, 'way/71996554'::text, 'viewpoint'::text),
        ('Phare de Patiras'::text, 'phare-de-patiras'::text, 'way/162906928'::text, 'lighthouse'::text),
        ('Phare Saint-Nicolas'::text, 'phare-saint-nicolas'::text, 'way/192421345'::text, 'lighthouse'::text),
        ('Port de Gujan'::text, 'port-de-gujan'::text, 'way/285592011'::text, 'oyster_harbour'::text),
        ('Port de la Mole'::text, 'port-de-la-mole'::text, 'node/7512119236'::text, 'oyster_harbour'::text),
        ('Port de Meyran'::text, 'port-de-meyran'::text, 'way/286188443'::text, 'oyster_harbour'::text)
    ) AS t(name, slug, source_external_id, expected_spot_type_slug)
  )
  SELECT count(*)
  INTO found_target_count
  FROM public.spots s
  JOIN target_spots t
    ON s.slug = t.slug
   AND s.source = 'osm'
   AND s.source_external_id = t.source_external_id;

  IF found_target_count <> expected_target_count THEN
    RAISE EXCEPTION 'Publication Premium Aquitaine interrompue : 12 spots cibles attendus, % trouvés.', found_target_count;
  END IF;

  WITH target_spots AS (
    SELECT *
    FROM (
      VALUES
        ('feu-de-sainte-barbe'::text, 'node/2013114667'::text),
        ('observatoire-de-bordeaux'::text, 'way/305715700'::text),
        ('phare-d-hourtin'::text, 'way/513934973'::text),
        ('phare-de-ciboure'::text, 'way/72598412'::text),
        ('phare-de-contis'::text, 'way/201248452'::text),
        ('phare-de-la-pointe-de-grave'::text, 'way/759021127'::text),
        ('phare-de-la-pointe-saint-martin'::text, 'way/71996554'::text),
        ('phare-de-patiras'::text, 'way/162906928'::text),
        ('phare-saint-nicolas'::text, 'way/192421345'::text),
        ('port-de-gujan'::text, 'way/285592011'::text),
        ('port-de-la-mole'::text, 'node/7512119236'::text),
        ('port-de-meyran'::text, 'way/286188443'::text)
    ) AS t(slug, source_external_id)
  )
  SELECT count(*)
  INTO wrong_status_count
  FROM public.spots s
  JOIN target_spots t
    ON s.slug = t.slug
   AND s.source_external_id = t.source_external_id
  WHERE s.status IS DISTINCT FROM 'candidate';

  IF wrong_status_count <> 0 THEN
    RAISE EXCEPTION 'Publication Premium Aquitaine interrompue : au moins un spot cible n''est pas status=candidate.';
  END IF;

  WITH target_spots AS (
    SELECT *
    FROM (
      VALUES
        ('feu-de-sainte-barbe'::text, 'node/2013114667'::text),
        ('observatoire-de-bordeaux'::text, 'way/305715700'::text),
        ('phare-d-hourtin'::text, 'way/513934973'::text),
        ('phare-de-ciboure'::text, 'way/72598412'::text),
        ('phare-de-contis'::text, 'way/201248452'::text),
        ('phare-de-la-pointe-de-grave'::text, 'way/759021127'::text),
        ('phare-de-la-pointe-saint-martin'::text, 'way/71996554'::text),
        ('phare-de-patiras'::text, 'way/162906928'::text),
        ('phare-saint-nicolas'::text, 'way/192421345'::text),
        ('port-de-gujan'::text, 'way/285592011'::text),
        ('port-de-la-mole'::text, 'node/7512119236'::text),
        ('port-de-meyran'::text, 'way/286188443'::text)
    ) AS t(slug, source_external_id)
  )
  SELECT count(*)
  INTO wrong_source_count
  FROM public.spots s
  JOIN target_spots t
    ON s.slug = t.slug
   AND s.source_external_id = t.source_external_id
  WHERE s.source IS DISTINCT FROM 'osm';

  IF wrong_source_count <> 0 THEN
    RAISE EXCEPTION 'Publication Premium Aquitaine interrompue : au moins un spot cible n''est pas source=osm.';
  END IF;

  WITH target_spots AS (
    SELECT *
    FROM (
      VALUES
        ('feu-de-sainte-barbe'::text, 'node/2013114667'::text, 'lighthouse'::text),
        ('observatoire-de-bordeaux'::text, 'way/305715700'::text, 'observatory'::text),
        ('phare-d-hourtin'::text, 'way/513934973'::text, 'lighthouse'::text),
        ('phare-de-ciboure'::text, 'way/72598412'::text, 'lighthouse'::text),
        ('phare-de-contis'::text, 'way/201248452'::text, 'lighthouse'::text),
        ('phare-de-la-pointe-de-grave'::text, 'way/759021127'::text, 'lighthouse'::text),
        ('phare-de-la-pointe-saint-martin'::text, 'way/71996554'::text, 'viewpoint'::text),
        ('phare-de-patiras'::text, 'way/162906928'::text, 'lighthouse'::text),
        ('phare-saint-nicolas'::text, 'way/192421345'::text, 'lighthouse'::text),
        ('port-de-gujan'::text, 'way/285592011'::text, 'oyster_harbour'::text),
        ('port-de-la-mole'::text, 'node/7512119236'::text, 'oyster_harbour'::text),
        ('port-de-meyran'::text, 'way/286188443'::text, 'oyster_harbour'::text)
    ) AS t(slug, source_external_id, expected_spot_type_slug)
  )
  SELECT count(*)
  INTO wrong_type_id_count
  FROM public.spots s
  JOIN target_spots t
    ON s.slug = t.slug
   AND s.source_external_id = t.source_external_id
  JOIN public.spot_types st
    ON st.slug = t.expected_spot_type_slug
  WHERE s.spot_type_id IS DISTINCT FROM st.id;

  IF wrong_type_id_count <> 0 THEN
    RAISE EXCEPTION 'Publication Premium Aquitaine interrompue : au moins un spot cible n''a pas le spot_type_id attendu.';
  END IF;

  UPDATE public.spots
  SET status = 'verified'
  WHERE slug IN (
    'feu-de-sainte-barbe',
    'observatoire-de-bordeaux',
    'phare-d-hourtin',
    'phare-de-ciboure',
    'phare-de-contis',
    'phare-de-la-pointe-de-grave',
    'phare-de-la-pointe-saint-martin',
    'phare-de-patiras',
    'phare-saint-nicolas',
    'port-de-gujan',
    'port-de-la-mole',
    'port-de-meyran'
  )
    AND status = 'candidate'
    AND source = 'osm';

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  IF updated_count <> expected_target_count THEN
    RAISE EXCEPTION 'Publication Premium Aquitaine interrompue : 12 lignes de status attendues, % modifiées.', updated_count;
  END IF;

  WITH target_spots AS (
    SELECT *
    FROM (
      VALUES
        ('feu-de-sainte-barbe'::text, 'node/2013114667'::text),
        ('observatoire-de-bordeaux'::text, 'way/305715700'::text),
        ('phare-d-hourtin'::text, 'way/513934973'::text),
        ('phare-de-ciboure'::text, 'way/72598412'::text),
        ('phare-de-contis'::text, 'way/201248452'::text),
        ('phare-de-la-pointe-de-grave'::text, 'way/759021127'::text),
        ('phare-de-la-pointe-saint-martin'::text, 'way/71996554'::text),
        ('phare-de-patiras'::text, 'way/162906928'::text),
        ('phare-saint-nicolas'::text, 'way/192421345'::text),
        ('port-de-gujan'::text, 'way/285592011'::text),
        ('port-de-la-mole'::text, 'node/7512119236'::text),
        ('port-de-meyran'::text, 'way/286188443'::text)
    ) AS t(slug, source_external_id)
  )
  SELECT count(*)
  INTO remaining_candidate_count
  FROM public.spots s
  JOIN target_spots t
    ON s.slug = t.slug
   AND s.source_external_id = t.source_external_id
  WHERE s.status IS DISTINCT FROM 'verified';

  IF remaining_candidate_count <> 0 THEN
    RAISE EXCEPTION 'Publication Premium Aquitaine interrompue : au moins un spot cible n''est pas passé à verified.';
  END IF;

  SELECT count(*)
  INTO final_verified_count
  FROM public.spots
  WHERE slug IN (
    'feu-de-sainte-barbe',
    'observatoire-de-bordeaux',
    'phare-d-hourtin',
    'phare-de-ciboure',
    'phare-de-contis',
    'phare-de-la-pointe-de-grave',
    'phare-de-la-pointe-saint-martin',
    'phare-de-patiras',
    'phare-saint-nicolas',
    'port-de-gujan',
    'port-de-la-mole',
    'port-de-meyran'
  )
    AND status = 'verified';

  IF final_verified_count <> expected_target_count THEN
    RAISE EXCEPTION 'Publication Premium Aquitaine interrompue : 12 spots verified attendus après publication, % trouvés.', final_verified_count;
  END IF;
END
$$;

-- Post-check: inspect the 12 published spots after status update.
WITH target_spots AS (
  SELECT *
  FROM (
    VALUES
      ('Feu de Sainte Barbe'::text, 'feu-de-sainte-barbe'::text, 'node/2013114667'::text, 'lighthouse'::text),
      ('Observatoire de Bordeaux'::text, 'observatoire-de-bordeaux'::text, 'way/305715700'::text, 'observatory'::text),
      ('Phare d''Hourtin'::text, 'phare-d-hourtin'::text, 'way/513934973'::text, 'lighthouse'::text),
      ('Phare de Ciboure'::text, 'phare-de-ciboure'::text, 'way/72598412'::text, 'lighthouse'::text),
      ('Phare de Contis'::text, 'phare-de-contis'::text, 'way/201248452'::text, 'lighthouse'::text),
      ('Phare de la Pointe de Grave'::text, 'phare-de-la-pointe-de-grave'::text, 'way/759021127'::text, 'lighthouse'::text),
      ('Phare de la Pointe Saint-Martin'::text, 'phare-de-la-pointe-saint-martin'::text, 'way/71996554'::text, 'viewpoint'::text),
      ('Phare de Patiras'::text, 'phare-de-patiras'::text, 'way/162906928'::text, 'lighthouse'::text),
      ('Phare Saint-Nicolas'::text, 'phare-saint-nicolas'::text, 'way/192421345'::text, 'lighthouse'::text),
      ('Port de Gujan'::text, 'port-de-gujan'::text, 'way/285592011'::text, 'oyster_harbour'::text),
      ('Port de la Mole'::text, 'port-de-la-mole'::text, 'node/7512119236'::text, 'oyster_harbour'::text),
      ('Port de Meyran'::text, 'port-de-meyran'::text, 'way/286188443'::text, 'oyster_harbour'::text)
  ) AS t(name, slug, source_external_id, expected_spot_type_slug)
)
SELECT
  s.slug,
  s.name,
  s.status,
  s.source,
  s.source_external_id,
  s.spot_type,
  st.slug AS spot_type_id_slug
FROM target_spots t
JOIN public.spots s
  ON s.slug = t.slug
 AND s.source = 'osm'
 AND s.source_external_id = t.source_external_id
LEFT JOIN public.spot_types st
  ON st.id = s.spot_type_id
ORDER BY s.name;

COMMIT;