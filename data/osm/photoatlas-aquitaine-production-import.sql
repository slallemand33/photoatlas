BEGIN;

-- PhotoAtlas Aquitaine production import plan.
-- Manual execution only. Do not run automatically from the application.
-- Source of truth: data/osm/photoatlas-aquitaine-editorial.json (editorialStatus = premium)
-- Scope: 12 INSERT, 0 UPDATE, 6 existing spots unchanged.

DO $$
DECLARE
  expected_total_premium integer := 18;
  expected_new_spots integer := 12;
  expected_unchanged integer := 6;
  expected_type_count integer := 8;
  new_spot_count integer := 0;
  existing_spot_count integer := 0;
  inserted_count integer := 0;
  total_targeted_count integer := 0;
  duplicate_slug_count integer := 0;
  existing_before jsonb := '[]'::jsonb;
  existing_after jsonb := '[]'::jsonb;
BEGIN
  WITH new_spots AS (
    -- PhotoAtlas editorial premium
    -- OSM: osm:node/2013114667
    -- Name: Feu de Sainte Barbe
    SELECT
      'Feu de Sainte Barbe'::text AS name,
      'feu-de-sainte-barbe'::text AS slug,
      43.40::double precision AS latitude,
      -1.66::double precision AS longitude,
      'lighthouse'::text AS spot_type_slug,
      'FR'::text AS country_code,
      'Nouvelle-Aquitaine'::text AS region,
      'osm'::text AS source,
      'node/2013114667'::text AS source_external_id,
      'man_made=lighthouse'::text AS source_type
    UNION ALL
    -- PhotoAtlas editorial premium
    -- OSM: osm:way/513934973
    -- Name: Phare d'Hourtin
    SELECT 'Phare d''Hourtin', 'phare-d-hourtin', 45.14, -1.16, 'lighthouse', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/513934973', 'man_made=lighthouse'
    UNION ALL
    -- PhotoAtlas editorial premium
    -- OSM: osm:way/72598412
    -- Name: Phare de Ciboure
    SELECT 'Phare de Ciboure', 'phare-de-ciboure', 43.38, -1.67, 'lighthouse', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/72598412', 'man_made=lighthouse'
    UNION ALL
    -- PhotoAtlas editorial premium
    -- OSM: osm:way/201248452
    -- Name: Phare de Contis
    SELECT 'Phare de Contis', 'phare-de-contis', 44.09, -1.32, 'lighthouse', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/201248452', 'man_made=lighthouse'
    UNION ALL
    -- PhotoAtlas editorial premium
    -- OSM: osm:way/759021127
    -- Name: Phare de la Pointe de Grave
    SELECT 'Phare de la Pointe de Grave', 'phare-de-la-pointe-de-grave', 45.57, -1.07, 'lighthouse', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/759021127', 'man_made=lighthouse'
    UNION ALL
    -- PhotoAtlas editorial premium
    -- OSM: osm:way/162906928
    -- Name: Phare de Patiras
    SELECT 'Phare de Patiras', 'phare-de-patiras', 45.20, -0.72, 'lighthouse', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/162906928', 'man_made=lighthouse'
    UNION ALL
    -- PhotoAtlas editorial premium
    -- OSM: osm:way/192421345
    -- Name: Phare Saint-Nicolas
    SELECT 'Phare Saint-Nicolas', 'phare-saint-nicolas', 45.56, -1.08, 'lighthouse', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/192421345', 'man_made=lighthouse'
    UNION ALL
    -- PhotoAtlas editorial premium
    -- OSM: osm:way/285592011
    -- Name: Port de Gujan
    SELECT 'Port de Gujan', 'port-de-gujan', 44.64, -1.08, 'oyster_harbour', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/285592011', 'harbour=yes'
    UNION ALL
    -- PhotoAtlas editorial premium
    -- OSM: osm:node/7512119236
    -- Name: Port de la Mole
    SELECT 'Port de la Mole', 'port-de-la-mole', 44.64, -1.05, 'oyster_harbour', 'FR', 'Nouvelle-Aquitaine', 'osm', 'node/7512119236', 'leisure=marina'
    UNION ALL
    -- PhotoAtlas editorial premium
    -- OSM: osm:way/286188443
    -- Name: Port de Meyran
    SELECT 'Port de Meyran', 'port-de-meyran', 44.64, -1.10, 'oyster_harbour', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/286188443', 'harbour=yes'
    UNION ALL
    -- PhotoAtlas editorial premium
    -- OSM: osm:way/305715700
    -- Name: Observatoire de Bordeaux
    SELECT 'Observatoire de Bordeaux', 'observatoire-de-bordeaux', 44.83, -0.53, 'observatory', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/305715700', 'man_made=observatory'
    UNION ALL
    -- PhotoAtlas editorial premium
    -- OSM: osm:way/71996554
    -- Name: Phare de la Pointe Saint-Martin
    SELECT 'Phare de la Pointe Saint-Martin', 'phare-de-la-pointe-saint-martin', 43.49, -1.55, 'viewpoint', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/71996554', 'tourism=viewpoint'
  )
  SELECT count(*) INTO new_spot_count FROM new_spots;

  IF new_spot_count <> expected_new_spots THEN
    RAISE EXCEPTION 'Import Premium Aquitaine interrompu : 12 nouveaux spots attendus, % trouvés.', new_spot_count;
  END IF;

  WITH existing_spots AS (
    SELECT *
    FROM (
      VALUES
        ('dune-du-pilat'::text, 'Dune du Pilat'::text, 'relation/2244861'::text, 'dune'::text),
        ('banc-d-arguin'::text, 'Banc d''Arguin'::text, 'relation/2244863'::text, 'sandbank'::text),
        ('port-de-larros'::text, 'Port de Larros'::text, 'relation/3789458'::text, 'harbour'::text),
        ('phare-du-cap-ferret'::text, 'Phare du Cap-Ferret'::text, 'way/715849418'::text, 'lighthouse'::text),
        ('reserve-ornithologique-du-teich'::text, 'Réserve ornithologique du Teich'::text, 'way/279790575'::text, 'bird_reserve'::text),
        ('observatoire-sainte-cecile'::text, 'Observatoire Sainte-Cécile'::text, 'way/113325940'::text, 'observatory'::text)
    ) AS t(slug, name, source_external_id, expected_spot_type_slug)
  )
  SELECT count(*) INTO existing_spot_count FROM existing_spots;

  IF existing_spot_count <> expected_unchanged THEN
    RAISE EXCEPTION 'Import Premium Aquitaine interrompu : 6 spots existants attendus, % trouvés.', existing_spot_count;
  END IF;

  IF expected_new_spots + expected_unchanged <> expected_total_premium THEN
    RAISE EXCEPTION 'Import Premium Aquitaine interrompu : total Premium incohérent (% attendu).', expected_total_premium;
  END IF;

  WITH new_spots AS (
    SELECT *
    FROM (
      VALUES
        ('Feu de Sainte Barbe'::text, 'feu-de-sainte-barbe'::text, 43.40::double precision, -1.66::double precision, 'lighthouse'::text, 'FR'::text, 'Nouvelle-Aquitaine'::text, 'osm'::text, 'node/2013114667'::text, 'man_made=lighthouse'::text),
        ('Phare d''Hourtin', 'phare-d-hourtin', 45.14, -1.16, 'lighthouse', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/513934973', 'man_made=lighthouse'),
        ('Phare de Ciboure', 'phare-de-ciboure', 43.38, -1.67, 'lighthouse', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/72598412', 'man_made=lighthouse'),
        ('Phare de Contis', 'phare-de-contis', 44.09, -1.32, 'lighthouse', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/201248452', 'man_made=lighthouse'),
        ('Phare de la Pointe de Grave', 'phare-de-la-pointe-de-grave', 45.57, -1.07, 'lighthouse', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/759021127', 'man_made=lighthouse'),
        ('Phare de Patiras', 'phare-de-patiras', 45.20, -0.72, 'lighthouse', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/162906928', 'man_made=lighthouse'),
        ('Phare Saint-Nicolas', 'phare-saint-nicolas', 45.56, -1.08, 'lighthouse', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/192421345', 'man_made=lighthouse'),
        ('Port de Gujan', 'port-de-gujan', 44.64, -1.08, 'oyster_harbour', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/285592011', 'harbour=yes'),
        ('Port de la Mole', 'port-de-la-mole', 44.64, -1.05, 'oyster_harbour', 'FR', 'Nouvelle-Aquitaine', 'osm', 'node/7512119236', 'leisure=marina'),
        ('Port de Meyran', 'port-de-meyran', 44.64, -1.10, 'oyster_harbour', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/286188443', 'harbour=yes'),
        ('Observatoire de Bordeaux', 'observatoire-de-bordeaux', 44.83, -0.53, 'observatory', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/305715700', 'man_made=observatory'),
        ('Phare de la Pointe Saint-Martin', 'phare-de-la-pointe-saint-martin', 43.49, -1.55, 'viewpoint', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/71996554', 'tourism=viewpoint')
    ) AS t(name, slug, latitude, longitude, spot_type_slug, country_code, region, source, source_external_id, source_type)
  )
  SELECT 1
  INTO new_spot_count
  FROM new_spots
  WHERE name IS NULL
     OR slug IS NULL
     OR spot_type_slug IS NULL
     OR country_code IS NULL
     OR region IS NULL
     OR source IS NULL
     OR source_external_id IS NULL
     OR latitude IS NULL
     OR longitude IS NULL
  LIMIT 1;

  IF new_spot_count = 1 THEN
    RAISE EXCEPTION 'Import Premium Aquitaine interrompu : au moins un nouveau spot a un champ obligatoire manquant.';
  END IF;

  WITH new_spots AS (
    SELECT *
    FROM (
      VALUES
        ('Feu de Sainte Barbe'::text, 'feu-de-sainte-barbe'::text, 43.40::double precision, -1.66::double precision),
        ('Phare d''Hourtin', 'phare-d-hourtin', 45.14, -1.16),
        ('Phare de Ciboure', 'phare-de-ciboure', 43.38, -1.67),
        ('Phare de Contis', 'phare-de-contis', 44.09, -1.32),
        ('Phare de la Pointe de Grave', 'phare-de-la-pointe-de-grave', 45.57, -1.07),
        ('Phare de Patiras', 'phare-de-patiras', 45.20, -0.72),
        ('Phare Saint-Nicolas', 'phare-saint-nicolas', 45.56, -1.08),
        ('Port de Gujan', 'port-de-gujan', 44.64, -1.08),
        ('Port de la Mole', 'port-de-la-mole', 44.64, -1.05),
        ('Port de Meyran', 'port-de-meyran', 44.64, -1.10),
        ('Observatoire de Bordeaux', 'observatoire-de-bordeaux', 44.83, -0.53),
        ('Phare de la Pointe Saint-Martin', 'phare-de-la-pointe-saint-martin', 43.49, -1.55)
    ) AS t(name, slug, latitude, longitude)
  )
  SELECT 1
  INTO new_spot_count
  FROM new_spots
  WHERE latitude NOT BETWEEN -90 AND 90
     OR longitude NOT BETWEEN -180 AND 180
  LIMIT 1;

  IF new_spot_count = 1 THEN
    RAISE EXCEPTION 'Import Premium Aquitaine interrompu : coordonnées invalides détectées dans les nouveaux spots.';
  END IF;

  IF (SELECT count(DISTINCT slug) FROM public.spot_types WHERE slug IN (
    'bird_reserve',
    'dune',
    'harbour',
    'lighthouse',
    'observatory',
    'oyster_harbour',
    'sandbank',
    'viewpoint'
  )) <> expected_type_count THEN
    RAISE EXCEPTION 'Import Premium Aquitaine interrompu : au moins un slug attendu est absent de public.spot_types.';
  END IF;

  IF EXISTS (
    WITH required_types AS (
      SELECT unnest(ARRAY[
        'bird_reserve',
        'dune',
        'harbour',
        'lighthouse',
        'observatory',
        'oyster_harbour',
        'sandbank',
        'viewpoint'
      ]) AS spot_type_slug
    ), required_photo_types AS (
      SELECT unnest(ARRAY['landscape', 'sunrise', 'sunset', 'storm', 'astro']) AS photo_type_slug
    )
    SELECT 1
    FROM required_types rt
    CROSS JOIN required_photo_types rpt
    LEFT JOIN public.spot_types st
      ON st.slug = rt.spot_type_slug
    LEFT JOIN public.photo_types pt
      ON pt.slug = rpt.photo_type_slug
    LEFT JOIN public.spot_photo_compatibility spc
      ON spc.spot_type_id = st.id
     AND spc.photo_type_id = pt.id
    WHERE st.id IS NULL
       OR pt.id IS NULL
       OR spc.spot_type_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Import Premium Aquitaine interrompu : compatibilités manquantes pour au moins un type Premium.';
  END IF;

  WITH existing_spots AS (
    SELECT *
    FROM (
      VALUES
        ('dune-du-pilat'::text, 'Dune du Pilat'::text, 'relation/2244861'::text, 'dune'::text),
        ('banc-d-arguin'::text, 'Banc d''Arguin'::text, 'relation/2244863'::text, 'sandbank'::text),
        ('port-de-larros'::text, 'Port de Larros'::text, 'relation/3789458'::text, 'harbour'::text),
        ('phare-du-cap-ferret'::text, 'Phare du Cap-Ferret'::text, 'way/715849418'::text, 'lighthouse'::text),
        ('reserve-ornithologique-du-teich'::text, 'Réserve ornithologique du Teich'::text, 'way/279790575'::text, 'bird_reserve'::text),
        ('observatoire-sainte-cecile'::text, 'Observatoire Sainte-Cécile'::text, 'way/113325940'::text, 'observatory'::text)
    ) AS t(slug, name, source_external_id, expected_spot_type_slug)
  )
  SELECT count(*)
  INTO existing_spot_count
  FROM public.spots s
  JOIN existing_spots e
    ON e.slug = s.slug
   AND e.source_external_id = s.source_external_id
   AND s.source = 'osm';

  IF existing_spot_count <> expected_unchanged THEN
    RAISE EXCEPTION 'Import Premium Aquitaine interrompu : au moins un des 6 spots existants attendus est introuvable.';
  END IF;

  IF EXISTS (
    WITH existing_spots AS (
      SELECT *
      FROM (
        VALUES
          ('dune-du-pilat'::text, 'relation/2244861'::text, 'dune'::text),
          ('banc-d-arguin'::text, 'relation/2244863'::text, 'sandbank'::text),
          ('port-de-larros'::text, 'relation/3789458'::text, 'harbour'::text),
          ('phare-du-cap-ferret'::text, 'way/715849418'::text, 'lighthouse'::text),
          ('reserve-ornithologique-du-teich'::text, 'way/279790575'::text, 'bird_reserve'::text),
          ('observatoire-sainte-cecile'::text, 'way/113325940'::text, 'observatory'::text)
      ) AS t(slug, source_external_id, expected_spot_type_slug)
    )
    SELECT 1
    FROM existing_spots e
    JOIN public.spots s
      ON s.slug = e.slug
     AND s.source = 'osm'
     AND s.source_external_id = e.source_external_id
    JOIN public.spot_types st
      ON st.slug = e.expected_spot_type_slug
    WHERE s.spot_type_id IS DISTINCT FROM st.id
  ) THEN
    RAISE EXCEPTION 'Import Premium Aquitaine interrompu : au moins un des 6 spots existants n''a pas le spot_type_id attendu.';
  END IF;

  IF EXISTS (
    WITH new_spots AS (
      SELECT *
      FROM (
        VALUES
          ('Feu de Sainte Barbe'::text, 'feu-de-sainte-barbe'::text, 43.40::double precision, -1.66::double precision, 'osm'::text, 'node/2013114667'::text),
          ('Phare d''Hourtin', 'phare-d-hourtin', 45.14, -1.16, 'osm', 'way/513934973'),
          ('Phare de Ciboure', 'phare-de-ciboure', 43.38, -1.67, 'osm', 'way/72598412'),
          ('Phare de Contis', 'phare-de-contis', 44.09, -1.32, 'osm', 'way/201248452'),
          ('Phare de la Pointe de Grave', 'phare-de-la-pointe-de-grave', 45.57, -1.07, 'osm', 'way/759021127'),
          ('Phare de Patiras', 'phare-de-patiras', 45.20, -0.72, 'osm', 'way/162906928'),
          ('Phare Saint-Nicolas', 'phare-saint-nicolas', 45.56, -1.08, 'osm', 'way/192421345'),
          ('Port de Gujan', 'port-de-gujan', 44.64, -1.08, 'osm', 'way/285592011'),
          ('Port de la Mole', 'port-de-la-mole', 44.64, -1.05, 'osm', 'node/7512119236'),
          ('Port de Meyran', 'port-de-meyran', 44.64, -1.10, 'osm', 'way/286188443'),
          ('Observatoire de Bordeaux', 'observatoire-de-bordeaux', 44.83, -0.53, 'osm', 'way/305715700'),
          ('Phare de la Pointe Saint-Martin', 'phare-de-la-pointe-saint-martin', 43.49, -1.55, 'osm', 'way/71996554')
      ) AS t(name, slug, latitude, longitude, source, source_external_id)
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
  ) THEN
    RAISE EXCEPTION 'Import Premium Aquitaine interrompu : doublon potentiel détecté parmi les nouveaux spots.';
  END IF;

  WITH existing_spots AS (
    SELECT *
    FROM (
      VALUES
        ('dune-du-pilat'::text, 'relation/2244861'::text),
        ('banc-d-arguin'::text, 'relation/2244863'::text),
        ('port-de-larros'::text, 'relation/3789458'::text),
        ('phare-du-cap-ferret'::text, 'way/715849418'::text),
        ('reserve-ornithologique-du-teich'::text, 'way/279790575'::text),
        ('observatoire-sainte-cecile'::text, 'way/113325940'::text)
    ) AS t(slug, source_external_id)
  )
  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'slug', s.slug,
        'name', s.name,
        'spot_type', s.spot_type,
        'spot_type_id', s.spot_type_id,
        'status', s.status,
        'description', s.description,
        'landscape_potential', s.landscape_potential,
        'sunrise_potential', s.sunrise_potential,
        'sunset_potential', s.sunset_potential,
        'astro_potential', s.astro_potential,
        'source', s.source,
        'source_external_id', s.source_external_id,
        'latitude', ST_Y(s.position::geometry),
        'longitude', ST_X(s.position::geometry)
      )
      ORDER BY s.slug
    ),
    '[]'::jsonb
  )
  INTO existing_before
  FROM public.spots s
  JOIN existing_spots e
    ON e.slug = s.slug
   AND e.source_external_id = s.source_external_id;

  WITH new_spots AS (
    SELECT *
    FROM (
      VALUES
        ('Feu de Sainte Barbe'::text, 'feu-de-sainte-barbe'::text, 43.40::double precision, -1.66::double precision, 'lighthouse'::text, 'FR'::text, 'Nouvelle-Aquitaine'::text, 'osm'::text, 'node/2013114667'::text, 'man_made=lighthouse'::text),
        ('Phare d''Hourtin', 'phare-d-hourtin', 45.14, -1.16, 'lighthouse', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/513934973', 'man_made=lighthouse'),
        ('Phare de Ciboure', 'phare-de-ciboure', 43.38, -1.67, 'lighthouse', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/72598412', 'man_made=lighthouse'),
        ('Phare de Contis', 'phare-de-contis', 44.09, -1.32, 'lighthouse', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/201248452', 'man_made=lighthouse'),
        ('Phare de la Pointe de Grave', 'phare-de-la-pointe-de-grave', 45.57, -1.07, 'lighthouse', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/759021127', 'man_made=lighthouse'),
        ('Phare de Patiras', 'phare-de-patiras', 45.20, -0.72, 'lighthouse', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/162906928', 'man_made=lighthouse'),
        ('Phare Saint-Nicolas', 'phare-saint-nicolas', 45.56, -1.08, 'lighthouse', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/192421345', 'man_made=lighthouse'),
        ('Port de Gujan', 'port-de-gujan', 44.64, -1.08, 'oyster_harbour', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/285592011', 'harbour=yes'),
        ('Port de la Mole', 'port-de-la-mole', 44.64, -1.05, 'oyster_harbour', 'FR', 'Nouvelle-Aquitaine', 'osm', 'node/7512119236', 'leisure=marina'),
        ('Port de Meyran', 'port-de-meyran', 44.64, -1.10, 'oyster_harbour', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/286188443', 'harbour=yes'),
        ('Observatoire de Bordeaux', 'observatoire-de-bordeaux', 44.83, -0.53, 'observatory', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/305715700', 'man_made=observatory'),
        ('Phare de la Pointe Saint-Martin', 'phare-de-la-pointe-saint-martin', 43.49, -1.55, 'viewpoint', 'FR', 'Nouvelle-Aquitaine', 'osm', 'way/71996554', 'tourism=viewpoint')
    ) AS t(name, slug, latitude, longitude, spot_type_slug, country_code, region, source, source_external_id, source_type)
  )
  INSERT INTO public.spots (
    name,
    slug,
    position,
    country_code,
    region,
    spot_type,
    source,
    source_external_id,
    source_type,
    spot_type_id
  )
  SELECT
    n.name,
    n.slug,
    ST_SetSRID(ST_MakePoint(n.longitude, n.latitude), 4326)::geography,
    n.country_code,
    n.region,
    n.spot_type_slug,
    n.source,
    n.source_external_id,
    n.source_type,
    st.id
  FROM new_spots n
  JOIN public.spot_types st
    ON st.slug = n.spot_type_slug;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;

  IF inserted_count <> 12 THEN
    RAISE EXCEPTION 'Import Premium Aquitaine interrompu : 12 insertions attendues, % réalisées.', inserted_count;
  END IF;

  WITH existing_spots AS (
    SELECT *
    FROM (
      VALUES
        ('dune-du-pilat'::text, 'relation/2244861'::text),
        ('banc-d-arguin'::text, 'relation/2244863'::text),
        ('port-de-larros'::text, 'relation/3789458'::text),
        ('phare-du-cap-ferret'::text, 'way/715849418'::text),
        ('reserve-ornithologique-du-teich'::text, 'way/279790575'::text),
        ('observatoire-sainte-cecile'::text, 'way/113325940'::text)
    ) AS t(slug, source_external_id)
  )
  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'slug', s.slug,
        'name', s.name,
        'spot_type', s.spot_type,
        'spot_type_id', s.spot_type_id,
        'status', s.status,
        'description', s.description,
        'landscape_potential', s.landscape_potential,
        'sunrise_potential', s.sunrise_potential,
        'sunset_potential', s.sunset_potential,
        'astro_potential', s.astro_potential,
        'source', s.source,
        'source_external_id', s.source_external_id,
        'latitude', ST_Y(s.position::geometry),
        'longitude', ST_X(s.position::geometry)
      )
      ORDER BY s.slug
    ),
    '[]'::jsonb
  )
  INTO existing_after
  FROM public.spots s
  JOIN existing_spots e
    ON e.slug = s.slug
   AND e.source_external_id = s.source_external_id;

  IF existing_after IS DISTINCT FROM existing_before THEN
    RAISE EXCEPTION 'Import Premium Aquitaine interrompu : au moins un des 6 spots existants a été modifié.';
  END IF;

  SELECT count(*)
  INTO total_targeted_count
  FROM public.spots
  WHERE slug IN (
    'banc-d-arguin',
    'dune-du-pilat',
    'feu-de-sainte-barbe',
    'observatoire-de-bordeaux',
    'observatoire-sainte-cecile',
    'phare-d-hourtin',
    'phare-de-ciboure',
    'phare-de-contis',
    'phare-de-la-pointe-de-grave',
    'phare-de-la-pointe-saint-martin',
    'phare-de-patiras',
    'phare-du-cap-ferret',
    'phare-saint-nicolas',
    'port-de-gujan',
    'port-de-la-mole',
    'port-de-larros',
    'port-de-meyran',
    'reserve-ornithologique-du-teich'
  );

  IF total_targeted_count <> 18 THEN
    RAISE EXCEPTION 'Import Premium Aquitaine interrompu : 18 spots Premium attendus après import, % trouvés.', total_targeted_count;
  END IF;

  SELECT count(*)
  INTO duplicate_slug_count
  FROM (
    SELECT slug
    FROM public.spots
    WHERE slug IN (
      'banc-d-arguin',
      'dune-du-pilat',
      'feu-de-sainte-barbe',
      'observatoire-de-bordeaux',
      'observatoire-sainte-cecile',
      'phare-d-hourtin',
      'phare-de-ciboure',
      'phare-de-contis',
      'phare-de-la-pointe-de-grave',
      'phare-de-la-pointe-saint-martin',
      'phare-de-patiras',
      'phare-du-cap-ferret',
      'phare-saint-nicolas',
      'port-de-gujan',
      'port-de-la-mole',
      'port-de-larros',
      'port-de-meyran',
      'reserve-ornithologique-du-teich'
    )
    GROUP BY slug
    HAVING count(*) > 1
  ) duplicate_slugs;

  IF duplicate_slug_count <> 0 THEN
    RAISE EXCEPTION 'Import Premium Aquitaine interrompu : doublon de slug détecté après opérations.';
  END IF;
END
$$;

SELECT
  'premium_targeted_count' AS control,
  count(*) AS value
FROM public.spots
WHERE slug IN (
  'banc-d-arguin',
  'dune-du-pilat',
  'feu-de-sainte-barbe',
  'observatoire-de-bordeaux',
  'observatoire-sainte-cecile',
  'phare-d-hourtin',
  'phare-de-ciboure',
  'phare-de-contis',
  'phare-de-la-pointe-de-grave',
  'phare-de-la-pointe-saint-martin',
  'phare-de-patiras',
  'phare-du-cap-ferret',
  'phare-saint-nicolas',
  'port-de-gujan',
  'port-de-la-mole',
  'port-de-larros',
  'port-de-meyran',
  'reserve-ornithologique-du-teich'
)
UNION ALL
SELECT 'new_spots_inserted', count(*)
FROM public.spots
WHERE slug IN (
  'feu-de-sainte-barbe',
  'phare-d-hourtin',
  'phare-de-ciboure',
  'phare-de-contis',
  'phare-de-la-pointe-de-grave',
  'phare-de-patiras',
  'phare-saint-nicolas',
  'port-de-gujan',
  'port-de-la-mole',
  'port-de-meyran',
  'observatoire-de-bordeaux',
  'phare-de-la-pointe-saint-martin'
)
UNION ALL
SELECT 'spot_type_updates_applied', 0
UNION ALL
SELECT 'existing_spots_preserved', count(*)
FROM public.spots
WHERE slug IN (
  'banc-d-arguin',
  'dune-du-pilat',
  'observatoire-sainte-cecile',
  'phare-du-cap-ferret',
  'port-de-larros',
  'reserve-ornithologique-du-teich'
);

SELECT
  s.slug,
  s.name,
  s.spot_type,
  st.slug AS spot_type_id_slug,
  s.source,
  s.source_external_id,
  ST_Y(s.position::geometry) AS latitude,
  ST_X(s.position::geometry) AS longitude
FROM public.spots s
LEFT JOIN public.spot_types st
  ON st.id = s.spot_type_id
WHERE s.slug IN (
  'banc-d-arguin',
  'dune-du-pilat',
  'feu-de-sainte-barbe',
  'observatoire-de-bordeaux',
  'observatoire-sainte-cecile',
  'phare-d-hourtin',
  'phare-de-ciboure',
  'phare-de-contis',
  'phare-de-la-pointe-de-grave',
  'phare-de-la-pointe-saint-martin',
  'phare-de-patiras',
  'phare-du-cap-ferret',
  'phare-saint-nicolas',
  'port-de-gujan',
  'port-de-la-mole',
  'port-de-larros',
  'port-de-meyran',
  'reserve-ornithologique-du-teich'
)
ORDER BY s.slug;

SELECT
  st.slug AS spot_type_slug,
  count(*) AS compatibility_count,
  string_agg(pt.slug, ', ' ORDER BY pt.slug) AS photo_types
FROM public.spot_types st
JOIN public.spot_photo_compatibility spc
  ON spc.spot_type_id = st.id
JOIN public.photo_types pt
  ON pt.id = spc.photo_type_id
WHERE st.slug IN (
  'bird_reserve',
  'dune',
  'harbour',
  'lighthouse',
  'observatory',
  'oyster_harbour',
  'sandbank',
  'viewpoint'
)
  AND pt.slug IN ('landscape', 'sunrise', 'sunset', 'storm', 'astro')
GROUP BY st.slug
ORDER BY st.slug;

COMMIT;