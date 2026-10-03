BEGIN;

DO $$
DECLARE
  v_expected_count integer := 105;
  v_found_target_count integer := 0;
  v_wrong_status_count integer := 0;
  v_wrong_source_count integer := 0;
  v_wrong_slug_count integer := 0;
  v_wrong_type_count integer := 0;
  v_wrong_source_id_count integer := 0;
  v_before_total integer := 0;
  v_after_total integer := 0;
  v_non_target_bretagne_total_before integer := 0;
  v_non_target_candidate_before integer := 0;
  v_non_target_verified_before integer := 0;
  v_non_target_rejected_before integer := 0;
  v_non_target_bretagne_total_after integer := 0;
  v_non_target_candidate_after integer := 0;
  v_non_target_verified_after integer := 0;
  v_non_target_rejected_after integer := 0;
  v_updated_count integer := 0;
  v_post_verified_count integer := 0;
  v_post_identity_mismatch_count integer := 0;
  v_post_duplicate_source_count integer := 0;
  v_post_duplicate_slug_count integer := 0;
BEGIN
  SELECT count(*) INTO v_before_total FROM public.spots;

  WITH editorial_spots AS (
  SELECT
    name,
    slug,
    latitude::double precision AS latitude,
    longitude::double precision AS longitude,
    photo_atlas_type,
    source_external_id,
    regexp_replace(source_external_id, '^osm:', '') AS normalized_source_external_id,
    source_type,
    osm_type,
    osm_id::bigint AS osm_id
  FROM (
    VALUES
      ('Phare de la Jument', 'phare-de-la-jument', 48.42, -5.13, 'lighthouse', 'osm:node/117081598', 'man_made=lighthouse', 'node', 117081598),
      ('Phare de Pen-Men', 'phare-de-pen-men', 47.65, -3.51, 'lighthouse', 'osm:node/255359392', 'man_made=lighthouse', 'node', 255359392),
      ('Phare des Roches-Douvres', 'phare-des-roches-douvres', 49.11, -2.81, 'lighthouse', 'osm:node/1378041353', 'man_made=lighthouse', 'node', 1378041353),
      ('Phare du Four', 'phare-du-four', 48.52, -4.81, 'lighthouse', 'osm:node/1269267113', 'man_made=lighthouse', 'node', 1269267113),
      ('Phare du Petit Minou', 'phare-du-petit-minou', 48.34, -4.61, 'lighthouse', 'osm:node/1370801434', 'man_made=lighthouse', 'node', 1370801434),
      ('Phare des Sept-Îles', 'phare-des-sept-iles', 48.88, -3.49, 'lighthouse', 'osm:node/6793206641', 'man_made=lighthouse', 'node', 6793206641),
      ('Phare de la Croix', 'phare-de-la-croix-le-trieux', 48.84, -3.05, 'lighthouse', 'osm:node/1543882146', 'man_made=lighthouse', 'node', 1543882146),
      ('Phare de Tévennec', 'phare-de-tevennec', 48.07, -4.8, 'lighthouse', 'osm:node/1269200222', 'man_made=lighthouse', 'node', 1269200222),
      ('Phare de Trézien', 'phare-de-trezien', 48.42, -4.78, 'lighthouse', 'osm:node/1370801507', 'man_made=lighthouse', 'node', 1370801507),
      ('Phare des Moutons', 'phare-des-moutons', 47.77, -4.03, 'lighthouse', 'osm:node/1395067584', 'man_made=lighthouse', 'node', 1395067584),
      ('Phare des Pierres-Noires', 'phare-des-pierres-noires', 48.31, -4.91, 'lighthouse', 'osm:node/1370801478', 'man_made=lighthouse', 'node', 1370801478),
      ('Phare du Créac''h', 'phare-du-creac-h', 48.46, -5.13, 'lighthouse', 'osm:node/13138447296', 'man_made=lighthouse', 'node', 13138447296),
      ('Phare du Grand-Jardin', 'phare-du-grand-jardin', 48.67, -2.08, 'lighthouse', 'osm:way/94677643', 'man_made=lighthouse', 'way', 94677643),
      ('Phare du Millier', 'phare-du-millier', 48.1, -4.47, 'lighthouse', 'osm:node/535700544', 'man_made=lighthouse', 'node', 535700544),
      ('Phare du Portzic', 'phare-du-portzic', 48.36, -4.53, 'lighthouse', 'osm:node/1370801418', 'man_made=lighthouse', 'node', 1370801418),
      ('Phare du Rosédo', 'phare-du-rosedo', 48.86, -3, 'lighthouse', 'osm:node/2715566908', 'man_made=lighthouse', 'node', 2715566908),
      ('Château de Fougères', 'chateau-de-fougeres', 48.35, -1.21, 'castle', 'osm:way/1429681256', 'historic=castle', 'way', 1429681256),
      ('Observatoire du marais de Séné', 'observatoire-du-marais-de-sene', 47.62, -2.71, 'observatory', 'osm:node/7786979338', 'tourism=viewpoint', 'node', 7786979338),
      ('Château de Rustéphan', 'chateau-de-rustephan', 47.86, -3.77, 'ruins', 'osm:node/4938217707', 'historic=ruins', 'node', 4938217707),
      ('Phare de Kéréon', 'phare-de-kereon', 48.44, -5.03, 'lighthouse', 'osm:way/627188299', 'man_made=lighthouse', 'way', 627188299),
      ('Phare de Kergadec', 'phare-de-kergadec', 48.02, -4.55, 'lighthouse', 'osm:node/602214530', 'man_made=lighthouse', 'node', 602214530),
      ('Phare de l''Aber Ildut', 'phare-de-l-aber-ildut', 48.47, -4.76, 'lighthouse', 'osm:node/1269226414', 'man_made=lighthouse', 'node', 1269226414),
      ('Phare de l''île de Sein', 'phare-de-l-ile-de-sein', 48.04, -4.87, 'lighthouse', 'osm:way/364993683', 'man_made=lighthouse', 'way', 364993683),
      ('Phare de l''Île Vierge', 'phare-de-l-ile-vierge', 48.64, -4.57, 'lighthouse', 'osm:way/93055283', 'man_made=lighthouse', 'way', 93055283),
      ('Phare de la Vieille', 'phare-de-la-vieille', 48.04, -4.76, 'lighthouse', 'osm:way/737263555', 'man_made=lighthouse', 'way', 737263555),
      ('Phare du Toulinguet', 'phare-du-toulinguet', 48.28, -4.63, 'lighthouse', 'osm:node/1269394756', 'man_made=lighthouse', 'node', 1269394756),
      ('Phare et fort de Penfret', 'phare-et-fort-de-penfret', 47.72, -3.95, 'lighthouse', 'osm:node/5907022932', 'man_made=lighthouse', 'node', 5907022932),
      ('Fort Cigogne', 'fort-cigogne', 47.72, -3.99, 'fortification', 'osm:node/3034504597', 'historic=fort', 'node', 3034504597),
      ('Phare de Goulphar', 'phare-de-goulphar', 47.31, -3.23, 'lighthouse', 'osm:way/63697430', 'man_made=lighthouse', 'way', 63697430),
      ('Phare de Lanvaon', 'phare-de-lanvaon', 48.61, -4.54, 'lighthouse', 'osm:way/232642575', 'man_made=lighthouse', 'way', 232642575),
      ('Phare du Cap Fréhel', 'phare-du-cap-frehel', 48.68, -2.32, 'lighthouse', 'osm:way/135722236', 'man_made=lighthouse', 'way', 135722236),
      ('Château de Fontenay', 'chateau-de-fontenay', 48.05, -1.7, 'castle', 'osm:node/4968595050', 'historic=castle', 'node', 4968595050),
      ('Château de Kéralio', 'chateau-de-keralio', 48.82, -3.25, 'castle', 'osm:node/3029844736', 'historic=castle', 'node', 3029844736),
      ('Château de la Sécardais', 'chateau-de-la-secardais', 48.3, -1.46, 'castle', 'osm:node/4990866348', 'historic=castle', 'node', 4990866348),
      ('Château de Lupin', 'chateau-de-lupin', 48.68, -1.94, 'castle', 'osm:node/4990866347', 'historic=castle', 'node', 4990866347),
      ('Château du Bot', 'chateau-du-bot', 47.81, -3.3, 'castle', 'osm:node/4674932670', 'historic=castle', 'node', 4674932670),
      ('Fort de Taillefer', 'fort-de-taillefer', 47.36, -3.16, 'fortification', 'osm:node/4354560524', 'historic=fort', 'node', 4354560524),
      ('Le Vieux Pont Suspendu', 'le-vieux-pont-suspendu', 47.64, -2.95, 'monument', 'osm:way/37106950', 'historic=monument', 'way', 37106950),
      ('Observatoire', 'observatoire-n48-5193-w1-5153', 48.52, -1.52, 'observatory', 'osm:node/4715006920', 'tourism=viewpoint', 'node', 4715006920),
      ('Observatoire', 'observatoire-n47-7609-w3-3239', 47.76, -3.32, 'observatory', 'osm:node/5590864486', 'leisure=bird_hide', 'node', 5590864486),
      ('Observatoire', 'observatoire-n47-7686-w3-5019', 47.77, -3.5, 'observatory', 'osm:node/6022818160', 'leisure=bird_hide', 'node', 6022818160),
      ('Observatoire de Kersanton', 'observatoire-de-kersanton', 48.35, -4.3, 'observatory', 'osm:node/11897628369', 'leisure=bird_hide', 'node', 11897628369),
      ('Observatoire de l''étang du Hézo', 'observatoire-de-l-etang-du-hezo', 47.58, -2.7, 'observatory', 'osm:node/14080691020', 'leisure=bird_hide', 'node', 14080691020),
      ('Observatoire de Lanveur', 'observatoire-de-lanveur', 48.36, -4.3, 'observatory', 'osm:node/11897628406', 'leisure=bird_hide', 'node', 11897628406),
      ('Observatoire de Penfoul', 'observatoire-de-penfoul', 48.33, -4.31, 'observatory', 'osm:node/10299619646', 'leisure=bird_hide', 'node', 10299619646),
      ('Observatoire de Pennaras', 'observatoire-de-pennaras', 48.33, -4.3, 'observatory', 'osm:node/6739769293', 'leisure=bird_hide', 'node', 6739769293),
      ('Observatoire ornithologique', 'observatoire-ornithologique-n48-0698-w2-0120', 48.07, -2.01, 'observatory', 'osm:node/10556615855', 'leisure=bird_hide', 'node', 10556615855),
      ('Observatoire ornithologique', 'observatoire-ornithologique-n48-0751-w2-0137', 48.08, -2.01, 'observatory', 'osm:node/10556663392', 'leisure=bird_hide', 'node', 10556663392),
      ('Observatoire ornithologique de la Musse', 'observatoire-ornithologique-de-la-musse', 48.51, -1.51, 'observatory', 'osm:node/4714905290', 'tourism=viewpoint', 'node', 4714905290),
      ('Phare de l''île de Batz', 'phare-de-l-ile-de-batz', 48.75, -4.03, 'lighthouse', 'osm:way/72268409', 'man_made=lighthouse', 'way', 72268409),
      ('Phare de la Teignouse', 'phare-de-la-teignouse', 47.46, -3.05, 'lighthouse', 'osm:node/1370799982', 'man_made=lighthouse', 'node', 1370799982),
      ('Phare de Pontusval', 'phare-de-pontusval', 48.68, -4.35, 'lighthouse', 'osm:node/1865624218', 'man_made=lighthouse', 'node', 1865624218),
      ('Phare des Grands Cardinaux', 'phare-des-grands-cardinaux', 47.32, -2.83, 'lighthouse', 'osm:node/2883454480', 'man_made=lighthouse', 'node', 2883454480),
      ('Château de la Grand''Ville', 'chateau-de-la-grand-ville', 48.58, -2.99, 'castle', 'osm:node/5599719757', 'historic=castle', 'node', 5599719757),
      ('Château de Mesléan', 'chateau-de-meslean', 48.44, -4.46, 'castle', 'osm:node/1920516166', 'historic=castle', 'node', 1920516166),
      ('Château de Trémohar', 'chateau-de-tremohar', 47.63, -2.57, 'castle', 'osm:node/2580167031', 'historic=castle', 'node', 2580167031),
      ('Lech de Pen-er-Pont', 'lech-de-pen-er-pont', 47.7, -3.13, 'monument', 'osm:node/5283040087', 'historic=monument', 'node', 5283040087),
      ('Abbaye Saint-Maurice', 'abbaye-saint-maurice', 47.8, -3.53, 'ruins', 'osm:node/4728503207', 'historic=ruins', 'node', 4728503207),
      ('Batterie Basse de Cornouaille', 'batterie-basse-de-cornouaille', 48.33, -4.57, 'ruins', 'osm:node/6227948399', 'historic=ruins', 'node', 6227948399),
      ('Château de Beaumont', 'chateau-de-beaumont', 48.3, -2.09, 'castle', 'osm:node/5599719764', 'historic=castle', 'node', 5599719764),
      ('Château de Coat-Trédrez', 'chateau-de-coat-tredrez', 48.71, -3.55, 'castle', 'osm:node/1258865133', 'historic=castle', 'node', 1258865133),
      ('Château de Lezergué', 'chateau-de-lezergue', 48.01, -4.02, 'castle', 'osm:node/4938217715', 'historic=castle', 'node', 4938217715),
      ('Château de Sourdéac', 'chateau-de-sourdeac', 47.73, -2.12, 'castle', 'osm:node/4674932671', 'historic=castle', 'node', 4674932671),
      ('Château de Talhouët', 'chateau-de-talhouet', 47.72, -2.37, 'castle', 'osm:node/4567694428', 'historic=castle', 'node', 4567694428),
      ('Château de Troménec', 'chateau-de-tromenec', 48.59, -4.56, 'castle', 'osm:node/4938217712', 'historic=castle', 'node', 4938217712),
      ('Château du Hénant', 'chateau-du-henant', 47.83, -3.76, 'castle', 'osm:node/4938217711', 'historic=castle', 'node', 4938217711),
      ('Fort du Minou', 'fort-du-minou', 48.34, -4.61, 'ruins', 'osm:node/2012913656', 'historic=ruins', 'node', 2012913656),
      ('Phare d''Eckmühl', 'phare-d-eckmuhl', 47.8, -4.37, 'lighthouse', 'osm:way/33779845', 'man_made=lighthouse', 'way', 33779845),
      ('Phare de Kermorvan', 'phare-de-kermorvan', 48.36, -4.79, 'lighthouse', 'osm:way/232707096', 'man_made=lighthouse', 'way', 232707096),
      ('Phare de Langoz', 'phare-de-langoz', 47.83, -4.16, 'lighthouse', 'osm:way/93512248', 'man_made=lighthouse', 'way', 93512248),
      ('Phare de Mean Ruz', 'phare-de-mean-ruz', 48.84, -3.48, 'lighthouse', 'osm:way/81963847', 'man_made=lighthouse', 'way', 81963847),
      ('Phare de Port-Navalo', 'phare-de-port-navalo', 47.55, -2.92, 'lighthouse', 'osm:way/171076270', 'man_made=lighthouse', 'way', 171076270),
      ('Phare de Roscoff', 'phare-de-roscoff', 48.72, -3.98, 'lighthouse', 'osm:way/72072235', 'man_made=lighthouse', 'way', 72072235),
      ('Réserve Ornithologique Koh Kastel', 'reserve-ornithologique-koh-kastel', 47.37, -3.26, 'bird_reserve', 'osm:way/40402853', 'boundary=protected_area', 'way', 40402853),
      ('Ruines du château de La Chèze', 'ruines-du-chateau-de-la-cheze', 48.13, -2.66, 'ruins', 'osm:node/5599719758', 'historic=ruins', 'node', 5599719758),
      ('Anciens Fours à chaux', 'anciens-fours-a-chaux', 48.04, -1.72, 'ruins', 'osm:node/6110181120', 'historic=ruins', 'node', 6110181120),
      ('Butte de César', 'butte-de-cesar', 47.54, -2.87, 'viewpoint', 'osm:node/1675115889', 'tourism=viewpoint', 'node', 1675115889),
      ('Château de Boutavent', 'chateau-de-boutavent', 48.07, -2.05, 'castle', 'osm:node/3001278312', 'historic=castle', 'node', 3001278312),
      ('Château de Cargouët', 'chateau-de-cargouet', 48.45, -2.6, 'ruins', 'osm:node/5599719768', 'historic=ruins', 'node', 5599719768),
      ('Château de Coëtquen', 'chateau-de-coetquen', 48.47, -1.94, 'ruins', 'osm:node/5599719778', 'historic=ruins', 'node', 5599719778),
      ('Château de la Touche-à-la Vache', 'chateau-de-la-touche-a-la-vache', 48.52, -2.2, 'ruins', 'osm:node/4893955029', 'historic=ruins', 'node', 4893955029),
      ('Château de Perrien', 'chateau-de-perrien', 48.48, -3.02, 'ruins', 'osm:node/5599719766', 'historic=ruins', 'node', 5599719766),
      ('Château du Bois de la Salle', 'chateau-du-bois-de-la-salle', 48.62, -2.93, 'castle', 'osm:node/5599719774', 'historic=castle', 'node', 5599719774),
      ('Ensemble fortifié de La Ferrière', 'ensemble-fortifie-de-la-ferriere', 47.32, -3.11, 'fortification', 'osm:node/4309832845', 'historic=fort', 'node', 4309832845),
      ('Fort du Cabellou', 'fort-du-cabellou', 47.86, -3.92, 'fortification', 'osm:node/430910388', 'historic=fort', 'node', 430910388),
      ('La Citadelle', 'la-citadelle', 47.35, -3.15, 'fortification', 'osm:way/147054705', 'historic=fort', 'way', 147054705),
      ('observatoire', 'observatoire-n48-1988-w1-5808', 48.2, -1.58, 'observatory', 'osm:node/3761248071', 'leisure=bird_hide', 'node', 3761248071),
      ('Observatoire', 'observatoire-n48-2460-w3-3935', 48.25, -3.39, 'observatory', 'osm:node/4938382192', 'leisure=bird_hide', 'node', 4938382192),
      ('Observatoire aquatique', 'observatoire-aquatique', 48.2, -4.09, 'observatory', 'osm:node/4507117298', 'unknown', 'node', 4507117298),
      ('Observatoire astronomique de la pointe du Diable', 'observatoire-astronomique-de-la-pointe-du-diable', 48.36, -4.57, 'observatory', 'osm:way/359597183', 'unknown', 'way', 359597183),
      ('Observatoire de l''Astro-Club Alnitak', 'observatoire-de-l-astro-club-alnitak', 48.44, -4.15, 'observatory', 'osm:node/14062411951', 'man_made=observatory', 'node', 14062411951),
      ('Observatoire faune', 'observatoire-faune', 47.8, -4.27, 'observatory', 'osm:way/184001154', 'unknown', 'way', 184001154),
      ('Observatoire n°1', 'observatoire-n-1-n47-6138-w2-7166', 47.61, -2.72, 'observatory', 'osm:way/173491752', 'leisure=bird_hide', 'way', 173491752),
      ('Observatoire n°3', 'observatoire-n-3', 47.62, -2.72, 'observatory', 'osm:way/125425427', 'leisure=bird_hide', 'way', 125425427),
      ('Observatoire nº 1', 'observatoire-n-1-n47-5411-w2-7344', 47.54, -2.73, 'observatory', 'osm:way/299846400', 'tourism=viewpoint', 'way', 299846400),
      ('Observatoire nº 2', 'observatoire-n-2', 47.54, -2.74, 'observatory', 'osm:way/299846399', 'tourism=viewpoint', 'way', 299846399),
      ('Observatoire ornithologique', 'observatoire-ornithologique-n48-7816-w3-5771', 48.78, -3.58, 'observatory', 'osm:way/265721290', 'tower:type=observation', 'way', 265721290),
      ('Phare de la Balue', 'phare-de-la-balue', 48.63, -2, 'lighthouse', 'osm:way/54974026', 'man_made=lighthouse', 'way', 54974026),
      ('Phare de La Croix', 'phare-de-la-croix-n47-8693-w3-9181', 47.87, -3.92, 'lighthouse', 'osm:way/118445466', 'man_made=lighthouse', 'way', 118445466),
      ('Réserve ornithologique du Verdelet', 'reserve-ornithologique-du-verdelet', 48.6, -2.56, 'bird_reserve', 'osm:way/26809265', 'leisure=nature_reserve', 'way', 26809265),
      ('Restes du château', 'restes-du-chateau', 48.32, -3.06, 'ruins', 'osm:node/2293790132', 'historic=ruins', 'node', 2293790132),
      ('Ruines de la chapelle de Lochrist et calvaire', 'ruines-de-la-chapelle-de-lochrist-et-calvaire', 48.07, -3.88, 'ruins', 'osm:node/4938073668', 'historic=ruins', 'node', 4938073668),
      ('Vestiges de l''ancien château de Crénan', 'vestiges-de-l-ancien-chateau-de-crenan', 48.42, -2.89, 'ruins', 'osm:node/5599719759', 'historic=ruins', 'node', 5599719759),
      ('Viaduc de Port-Nieux', 'viaduc-de-port-nieux', 48.63, -2.33, 'bridge', 'osm:way/320177779', 'bridge=viaduct', 'way', 320177779),
      ('Village déserté fortifié de Goarem-ar-Manec''h', 'village-deserte-fortifie-de-goarem-ar-manec-h', 48.4, -3.83, 'ruins', 'osm:node/1686968468', 'historic=ruins', 'node', 1686968468)
  ) AS v(
    name,
    slug,
    latitude,
    longitude,
    photo_atlas_type,
    source_external_id,
    source_type,
    osm_type,
    osm_id
  )
),
typed_spots AS (
  SELECT
    e.*,
    st.id AS spot_type_id
  FROM editorial_spots AS e
  LEFT JOIN public.spot_types AS st
    ON st.slug = e.photo_atlas_type
)
  SELECT
    (SELECT count(*)
     FROM public.spots AS s
     JOIN typed_spots AS t
       ON s.source = 'osm'
      AND s.source_external_id = t.normalized_source_external_id),
    (SELECT count(*)
     FROM public.spots AS s
     JOIN typed_spots AS t
       ON s.source = 'osm'
      AND s.source_external_id = t.normalized_source_external_id
     WHERE s.status IS DISTINCT FROM 'candidate'),
    (SELECT count(*)
     FROM public.spots AS s
     JOIN typed_spots AS t
       ON s.source = 'osm'
      AND s.source_external_id = t.normalized_source_external_id
     WHERE s.source IS DISTINCT FROM 'osm'),
    (SELECT count(*)
     FROM public.spots AS s
     JOIN typed_spots AS t
       ON s.source = 'osm'
      AND s.source_external_id = t.normalized_source_external_id
     WHERE s.slug IS DISTINCT FROM t.slug),
    (SELECT count(*)
     FROM public.spots AS s
     JOIN typed_spots AS t
       ON s.source = 'osm'
      AND s.source_external_id = t.normalized_source_external_id
     WHERE s.spot_type IS DISTINCT FROM t.photo_atlas_type
        OR s.spot_type_id IS DISTINCT FROM t.spot_type_id),
    (SELECT count(*)
     FROM public.spots AS s
     JOIN typed_spots AS t
       ON s.source = 'osm'
      AND s.source_external_id = t.normalized_source_external_id
     WHERE s.source_external_id IS DISTINCT FROM t.normalized_source_external_id),
    (SELECT count(*)
     FROM public.spots AS s
     WHERE s.region = 'Bretagne'
       AND s.source = 'osm'
       AND NOT EXISTS (
         SELECT 1
         FROM typed_spots AS t
         WHERE t.normalized_source_external_id = s.source_external_id
       )),
    (SELECT count(*)
     FROM public.spots AS s
     WHERE s.region = 'Bretagne'
       AND s.source = 'osm'
       AND s.status = 'candidate'
       AND NOT EXISTS (
         SELECT 1
         FROM typed_spots AS t
         WHERE t.normalized_source_external_id = s.source_external_id
       )),
    (SELECT count(*)
     FROM public.spots AS s
     WHERE s.region = 'Bretagne'
       AND s.source = 'osm'
       AND s.status = 'verified'
       AND NOT EXISTS (
         SELECT 1
         FROM typed_spots AS t
         WHERE t.normalized_source_external_id = s.source_external_id
       )),
    (SELECT count(*)
     FROM public.spots AS s
     WHERE s.region = 'Bretagne'
       AND s.source = 'osm'
       AND s.status = 'rejected'
       AND NOT EXISTS (
         SELECT 1
         FROM typed_spots AS t
         WHERE t.normalized_source_external_id = s.source_external_id
       ))
  INTO
    v_found_target_count,
    v_wrong_status_count,
    v_wrong_source_count,
    v_wrong_slug_count,
    v_wrong_type_count,
    v_wrong_source_id_count,
    v_non_target_bretagne_total_before,
    v_non_target_candidate_before,
    v_non_target_verified_before,
    v_non_target_rejected_before;

  IF v_found_target_count <> v_expected_count THEN
    RAISE EXCEPTION 'bretagne publish aborted: expected % target spots, got %.', v_expected_count, v_found_target_count;
  END IF;

  IF v_wrong_status_count <> 0 THEN
    RAISE EXCEPTION 'bretagne publish aborted: % target spots are not candidate.', v_wrong_status_count;
  END IF;

  IF v_wrong_source_count <> 0 THEN
    RAISE EXCEPTION 'bretagne publish aborted: % target spots are not source=osm.', v_wrong_source_count;
  END IF;

  IF v_wrong_slug_count <> 0 THEN
    RAISE EXCEPTION 'bretagne publish aborted: % target spots have slug mismatches.', v_wrong_slug_count;
  END IF;

  IF v_wrong_type_count <> 0 THEN
    RAISE EXCEPTION 'bretagne publish aborted: % target spots have type mismatches.', v_wrong_type_count;
  END IF;

  IF v_wrong_source_id_count <> 0 THEN
    RAISE EXCEPTION 'bretagne publish aborted: % target spots have source_external_id mismatches.', v_wrong_source_id_count;
  END IF;

  WITH editorial_spots AS (
  SELECT
    name,
    slug,
    latitude::double precision AS latitude,
    longitude::double precision AS longitude,
    photo_atlas_type,
    source_external_id,
    regexp_replace(source_external_id, '^osm:', '') AS normalized_source_external_id,
    source_type,
    osm_type,
    osm_id::bigint AS osm_id
  FROM (
    VALUES
      ('Phare de la Jument', 'phare-de-la-jument', 48.42, -5.13, 'lighthouse', 'osm:node/117081598', 'man_made=lighthouse', 'node', 117081598),
      ('Phare de Pen-Men', 'phare-de-pen-men', 47.65, -3.51, 'lighthouse', 'osm:node/255359392', 'man_made=lighthouse', 'node', 255359392),
      ('Phare des Roches-Douvres', 'phare-des-roches-douvres', 49.11, -2.81, 'lighthouse', 'osm:node/1378041353', 'man_made=lighthouse', 'node', 1378041353),
      ('Phare du Four', 'phare-du-four', 48.52, -4.81, 'lighthouse', 'osm:node/1269267113', 'man_made=lighthouse', 'node', 1269267113),
      ('Phare du Petit Minou', 'phare-du-petit-minou', 48.34, -4.61, 'lighthouse', 'osm:node/1370801434', 'man_made=lighthouse', 'node', 1370801434),
      ('Phare des Sept-Îles', 'phare-des-sept-iles', 48.88, -3.49, 'lighthouse', 'osm:node/6793206641', 'man_made=lighthouse', 'node', 6793206641),
      ('Phare de la Croix', 'phare-de-la-croix-le-trieux', 48.84, -3.05, 'lighthouse', 'osm:node/1543882146', 'man_made=lighthouse', 'node', 1543882146),
      ('Phare de Tévennec', 'phare-de-tevennec', 48.07, -4.8, 'lighthouse', 'osm:node/1269200222', 'man_made=lighthouse', 'node', 1269200222),
      ('Phare de Trézien', 'phare-de-trezien', 48.42, -4.78, 'lighthouse', 'osm:node/1370801507', 'man_made=lighthouse', 'node', 1370801507),
      ('Phare des Moutons', 'phare-des-moutons', 47.77, -4.03, 'lighthouse', 'osm:node/1395067584', 'man_made=lighthouse', 'node', 1395067584),
      ('Phare des Pierres-Noires', 'phare-des-pierres-noires', 48.31, -4.91, 'lighthouse', 'osm:node/1370801478', 'man_made=lighthouse', 'node', 1370801478),
      ('Phare du Créac''h', 'phare-du-creac-h', 48.46, -5.13, 'lighthouse', 'osm:node/13138447296', 'man_made=lighthouse', 'node', 13138447296),
      ('Phare du Grand-Jardin', 'phare-du-grand-jardin', 48.67, -2.08, 'lighthouse', 'osm:way/94677643', 'man_made=lighthouse', 'way', 94677643),
      ('Phare du Millier', 'phare-du-millier', 48.1, -4.47, 'lighthouse', 'osm:node/535700544', 'man_made=lighthouse', 'node', 535700544),
      ('Phare du Portzic', 'phare-du-portzic', 48.36, -4.53, 'lighthouse', 'osm:node/1370801418', 'man_made=lighthouse', 'node', 1370801418),
      ('Phare du Rosédo', 'phare-du-rosedo', 48.86, -3, 'lighthouse', 'osm:node/2715566908', 'man_made=lighthouse', 'node', 2715566908),
      ('Château de Fougères', 'chateau-de-fougeres', 48.35, -1.21, 'castle', 'osm:way/1429681256', 'historic=castle', 'way', 1429681256),
      ('Observatoire du marais de Séné', 'observatoire-du-marais-de-sene', 47.62, -2.71, 'observatory', 'osm:node/7786979338', 'tourism=viewpoint', 'node', 7786979338),
      ('Château de Rustéphan', 'chateau-de-rustephan', 47.86, -3.77, 'ruins', 'osm:node/4938217707', 'historic=ruins', 'node', 4938217707),
      ('Phare de Kéréon', 'phare-de-kereon', 48.44, -5.03, 'lighthouse', 'osm:way/627188299', 'man_made=lighthouse', 'way', 627188299),
      ('Phare de Kergadec', 'phare-de-kergadec', 48.02, -4.55, 'lighthouse', 'osm:node/602214530', 'man_made=lighthouse', 'node', 602214530),
      ('Phare de l''Aber Ildut', 'phare-de-l-aber-ildut', 48.47, -4.76, 'lighthouse', 'osm:node/1269226414', 'man_made=lighthouse', 'node', 1269226414),
      ('Phare de l''île de Sein', 'phare-de-l-ile-de-sein', 48.04, -4.87, 'lighthouse', 'osm:way/364993683', 'man_made=lighthouse', 'way', 364993683),
      ('Phare de l''Île Vierge', 'phare-de-l-ile-vierge', 48.64, -4.57, 'lighthouse', 'osm:way/93055283', 'man_made=lighthouse', 'way', 93055283),
      ('Phare de la Vieille', 'phare-de-la-vieille', 48.04, -4.76, 'lighthouse', 'osm:way/737263555', 'man_made=lighthouse', 'way', 737263555),
      ('Phare du Toulinguet', 'phare-du-toulinguet', 48.28, -4.63, 'lighthouse', 'osm:node/1269394756', 'man_made=lighthouse', 'node', 1269394756),
      ('Phare et fort de Penfret', 'phare-et-fort-de-penfret', 47.72, -3.95, 'lighthouse', 'osm:node/5907022932', 'man_made=lighthouse', 'node', 5907022932),
      ('Fort Cigogne', 'fort-cigogne', 47.72, -3.99, 'fortification', 'osm:node/3034504597', 'historic=fort', 'node', 3034504597),
      ('Phare de Goulphar', 'phare-de-goulphar', 47.31, -3.23, 'lighthouse', 'osm:way/63697430', 'man_made=lighthouse', 'way', 63697430),
      ('Phare de Lanvaon', 'phare-de-lanvaon', 48.61, -4.54, 'lighthouse', 'osm:way/232642575', 'man_made=lighthouse', 'way', 232642575),
      ('Phare du Cap Fréhel', 'phare-du-cap-frehel', 48.68, -2.32, 'lighthouse', 'osm:way/135722236', 'man_made=lighthouse', 'way', 135722236),
      ('Château de Fontenay', 'chateau-de-fontenay', 48.05, -1.7, 'castle', 'osm:node/4968595050', 'historic=castle', 'node', 4968595050),
      ('Château de Kéralio', 'chateau-de-keralio', 48.82, -3.25, 'castle', 'osm:node/3029844736', 'historic=castle', 'node', 3029844736),
      ('Château de la Sécardais', 'chateau-de-la-secardais', 48.3, -1.46, 'castle', 'osm:node/4990866348', 'historic=castle', 'node', 4990866348),
      ('Château de Lupin', 'chateau-de-lupin', 48.68, -1.94, 'castle', 'osm:node/4990866347', 'historic=castle', 'node', 4990866347),
      ('Château du Bot', 'chateau-du-bot', 47.81, -3.3, 'castle', 'osm:node/4674932670', 'historic=castle', 'node', 4674932670),
      ('Fort de Taillefer', 'fort-de-taillefer', 47.36, -3.16, 'fortification', 'osm:node/4354560524', 'historic=fort', 'node', 4354560524),
      ('Le Vieux Pont Suspendu', 'le-vieux-pont-suspendu', 47.64, -2.95, 'monument', 'osm:way/37106950', 'historic=monument', 'way', 37106950),
      ('Observatoire', 'observatoire-n48-5193-w1-5153', 48.52, -1.52, 'observatory', 'osm:node/4715006920', 'tourism=viewpoint', 'node', 4715006920),
      ('Observatoire', 'observatoire-n47-7609-w3-3239', 47.76, -3.32, 'observatory', 'osm:node/5590864486', 'leisure=bird_hide', 'node', 5590864486),
      ('Observatoire', 'observatoire-n47-7686-w3-5019', 47.77, -3.5, 'observatory', 'osm:node/6022818160', 'leisure=bird_hide', 'node', 6022818160),
      ('Observatoire de Kersanton', 'observatoire-de-kersanton', 48.35, -4.3, 'observatory', 'osm:node/11897628369', 'leisure=bird_hide', 'node', 11897628369),
      ('Observatoire de l''étang du Hézo', 'observatoire-de-l-etang-du-hezo', 47.58, -2.7, 'observatory', 'osm:node/14080691020', 'leisure=bird_hide', 'node', 14080691020),
      ('Observatoire de Lanveur', 'observatoire-de-lanveur', 48.36, -4.3, 'observatory', 'osm:node/11897628406', 'leisure=bird_hide', 'node', 11897628406),
      ('Observatoire de Penfoul', 'observatoire-de-penfoul', 48.33, -4.31, 'observatory', 'osm:node/10299619646', 'leisure=bird_hide', 'node', 10299619646),
      ('Observatoire de Pennaras', 'observatoire-de-pennaras', 48.33, -4.3, 'observatory', 'osm:node/6739769293', 'leisure=bird_hide', 'node', 6739769293),
      ('Observatoire ornithologique', 'observatoire-ornithologique-n48-0698-w2-0120', 48.07, -2.01, 'observatory', 'osm:node/10556615855', 'leisure=bird_hide', 'node', 10556615855),
      ('Observatoire ornithologique', 'observatoire-ornithologique-n48-0751-w2-0137', 48.08, -2.01, 'observatory', 'osm:node/10556663392', 'leisure=bird_hide', 'node', 10556663392),
      ('Observatoire ornithologique de la Musse', 'observatoire-ornithologique-de-la-musse', 48.51, -1.51, 'observatory', 'osm:node/4714905290', 'tourism=viewpoint', 'node', 4714905290),
      ('Phare de l''île de Batz', 'phare-de-l-ile-de-batz', 48.75, -4.03, 'lighthouse', 'osm:way/72268409', 'man_made=lighthouse', 'way', 72268409),
      ('Phare de la Teignouse', 'phare-de-la-teignouse', 47.46, -3.05, 'lighthouse', 'osm:node/1370799982', 'man_made=lighthouse', 'node', 1370799982),
      ('Phare de Pontusval', 'phare-de-pontusval', 48.68, -4.35, 'lighthouse', 'osm:node/1865624218', 'man_made=lighthouse', 'node', 1865624218),
      ('Phare des Grands Cardinaux', 'phare-des-grands-cardinaux', 47.32, -2.83, 'lighthouse', 'osm:node/2883454480', 'man_made=lighthouse', 'node', 2883454480),
      ('Château de la Grand''Ville', 'chateau-de-la-grand-ville', 48.58, -2.99, 'castle', 'osm:node/5599719757', 'historic=castle', 'node', 5599719757),
      ('Château de Mesléan', 'chateau-de-meslean', 48.44, -4.46, 'castle', 'osm:node/1920516166', 'historic=castle', 'node', 1920516166),
      ('Château de Trémohar', 'chateau-de-tremohar', 47.63, -2.57, 'castle', 'osm:node/2580167031', 'historic=castle', 'node', 2580167031),
      ('Lech de Pen-er-Pont', 'lech-de-pen-er-pont', 47.7, -3.13, 'monument', 'osm:node/5283040087', 'historic=monument', 'node', 5283040087),
      ('Abbaye Saint-Maurice', 'abbaye-saint-maurice', 47.8, -3.53, 'ruins', 'osm:node/4728503207', 'historic=ruins', 'node', 4728503207),
      ('Batterie Basse de Cornouaille', 'batterie-basse-de-cornouaille', 48.33, -4.57, 'ruins', 'osm:node/6227948399', 'historic=ruins', 'node', 6227948399),
      ('Château de Beaumont', 'chateau-de-beaumont', 48.3, -2.09, 'castle', 'osm:node/5599719764', 'historic=castle', 'node', 5599719764),
      ('Château de Coat-Trédrez', 'chateau-de-coat-tredrez', 48.71, -3.55, 'castle', 'osm:node/1258865133', 'historic=castle', 'node', 1258865133),
      ('Château de Lezergué', 'chateau-de-lezergue', 48.01, -4.02, 'castle', 'osm:node/4938217715', 'historic=castle', 'node', 4938217715),
      ('Château de Sourdéac', 'chateau-de-sourdeac', 47.73, -2.12, 'castle', 'osm:node/4674932671', 'historic=castle', 'node', 4674932671),
      ('Château de Talhouët', 'chateau-de-talhouet', 47.72, -2.37, 'castle', 'osm:node/4567694428', 'historic=castle', 'node', 4567694428),
      ('Château de Troménec', 'chateau-de-tromenec', 48.59, -4.56, 'castle', 'osm:node/4938217712', 'historic=castle', 'node', 4938217712),
      ('Château du Hénant', 'chateau-du-henant', 47.83, -3.76, 'castle', 'osm:node/4938217711', 'historic=castle', 'node', 4938217711),
      ('Fort du Minou', 'fort-du-minou', 48.34, -4.61, 'ruins', 'osm:node/2012913656', 'historic=ruins', 'node', 2012913656),
      ('Phare d''Eckmühl', 'phare-d-eckmuhl', 47.8, -4.37, 'lighthouse', 'osm:way/33779845', 'man_made=lighthouse', 'way', 33779845),
      ('Phare de Kermorvan', 'phare-de-kermorvan', 48.36, -4.79, 'lighthouse', 'osm:way/232707096', 'man_made=lighthouse', 'way', 232707096),
      ('Phare de Langoz', 'phare-de-langoz', 47.83, -4.16, 'lighthouse', 'osm:way/93512248', 'man_made=lighthouse', 'way', 93512248),
      ('Phare de Mean Ruz', 'phare-de-mean-ruz', 48.84, -3.48, 'lighthouse', 'osm:way/81963847', 'man_made=lighthouse', 'way', 81963847),
      ('Phare de Port-Navalo', 'phare-de-port-navalo', 47.55, -2.92, 'lighthouse', 'osm:way/171076270', 'man_made=lighthouse', 'way', 171076270),
      ('Phare de Roscoff', 'phare-de-roscoff', 48.72, -3.98, 'lighthouse', 'osm:way/72072235', 'man_made=lighthouse', 'way', 72072235),
      ('Réserve Ornithologique Koh Kastel', 'reserve-ornithologique-koh-kastel', 47.37, -3.26, 'bird_reserve', 'osm:way/40402853', 'boundary=protected_area', 'way', 40402853),
      ('Ruines du château de La Chèze', 'ruines-du-chateau-de-la-cheze', 48.13, -2.66, 'ruins', 'osm:node/5599719758', 'historic=ruins', 'node', 5599719758),
      ('Anciens Fours à chaux', 'anciens-fours-a-chaux', 48.04, -1.72, 'ruins', 'osm:node/6110181120', 'historic=ruins', 'node', 6110181120),
      ('Butte de César', 'butte-de-cesar', 47.54, -2.87, 'viewpoint', 'osm:node/1675115889', 'tourism=viewpoint', 'node', 1675115889),
      ('Château de Boutavent', 'chateau-de-boutavent', 48.07, -2.05, 'castle', 'osm:node/3001278312', 'historic=castle', 'node', 3001278312),
      ('Château de Cargouët', 'chateau-de-cargouet', 48.45, -2.6, 'ruins', 'osm:node/5599719768', 'historic=ruins', 'node', 5599719768),
      ('Château de Coëtquen', 'chateau-de-coetquen', 48.47, -1.94, 'ruins', 'osm:node/5599719778', 'historic=ruins', 'node', 5599719778),
      ('Château de la Touche-à-la Vache', 'chateau-de-la-touche-a-la-vache', 48.52, -2.2, 'ruins', 'osm:node/4893955029', 'historic=ruins', 'node', 4893955029),
      ('Château de Perrien', 'chateau-de-perrien', 48.48, -3.02, 'ruins', 'osm:node/5599719766', 'historic=ruins', 'node', 5599719766),
      ('Château du Bois de la Salle', 'chateau-du-bois-de-la-salle', 48.62, -2.93, 'castle', 'osm:node/5599719774', 'historic=castle', 'node', 5599719774),
      ('Ensemble fortifié de La Ferrière', 'ensemble-fortifie-de-la-ferriere', 47.32, -3.11, 'fortification', 'osm:node/4309832845', 'historic=fort', 'node', 4309832845),
      ('Fort du Cabellou', 'fort-du-cabellou', 47.86, -3.92, 'fortification', 'osm:node/430910388', 'historic=fort', 'node', 430910388),
      ('La Citadelle', 'la-citadelle', 47.35, -3.15, 'fortification', 'osm:way/147054705', 'historic=fort', 'way', 147054705),
      ('observatoire', 'observatoire-n48-1988-w1-5808', 48.2, -1.58, 'observatory', 'osm:node/3761248071', 'leisure=bird_hide', 'node', 3761248071),
      ('Observatoire', 'observatoire-n48-2460-w3-3935', 48.25, -3.39, 'observatory', 'osm:node/4938382192', 'leisure=bird_hide', 'node', 4938382192),
      ('Observatoire aquatique', 'observatoire-aquatique', 48.2, -4.09, 'observatory', 'osm:node/4507117298', 'unknown', 'node', 4507117298),
      ('Observatoire astronomique de la pointe du Diable', 'observatoire-astronomique-de-la-pointe-du-diable', 48.36, -4.57, 'observatory', 'osm:way/359597183', 'unknown', 'way', 359597183),
      ('Observatoire de l''Astro-Club Alnitak', 'observatoire-de-l-astro-club-alnitak', 48.44, -4.15, 'observatory', 'osm:node/14062411951', 'man_made=observatory', 'node', 14062411951),
      ('Observatoire faune', 'observatoire-faune', 47.8, -4.27, 'observatory', 'osm:way/184001154', 'unknown', 'way', 184001154),
      ('Observatoire n°1', 'observatoire-n-1-n47-6138-w2-7166', 47.61, -2.72, 'observatory', 'osm:way/173491752', 'leisure=bird_hide', 'way', 173491752),
      ('Observatoire n°3', 'observatoire-n-3', 47.62, -2.72, 'observatory', 'osm:way/125425427', 'leisure=bird_hide', 'way', 125425427),
      ('Observatoire nº 1', 'observatoire-n-1-n47-5411-w2-7344', 47.54, -2.73, 'observatory', 'osm:way/299846400', 'tourism=viewpoint', 'way', 299846400),
      ('Observatoire nº 2', 'observatoire-n-2', 47.54, -2.74, 'observatory', 'osm:way/299846399', 'tourism=viewpoint', 'way', 299846399),
      ('Observatoire ornithologique', 'observatoire-ornithologique-n48-7816-w3-5771', 48.78, -3.58, 'observatory', 'osm:way/265721290', 'tower:type=observation', 'way', 265721290),
      ('Phare de la Balue', 'phare-de-la-balue', 48.63, -2, 'lighthouse', 'osm:way/54974026', 'man_made=lighthouse', 'way', 54974026),
      ('Phare de La Croix', 'phare-de-la-croix-n47-8693-w3-9181', 47.87, -3.92, 'lighthouse', 'osm:way/118445466', 'man_made=lighthouse', 'way', 118445466),
      ('Réserve ornithologique du Verdelet', 'reserve-ornithologique-du-verdelet', 48.6, -2.56, 'bird_reserve', 'osm:way/26809265', 'leisure=nature_reserve', 'way', 26809265),
      ('Restes du château', 'restes-du-chateau', 48.32, -3.06, 'ruins', 'osm:node/2293790132', 'historic=ruins', 'node', 2293790132),
      ('Ruines de la chapelle de Lochrist et calvaire', 'ruines-de-la-chapelle-de-lochrist-et-calvaire', 48.07, -3.88, 'ruins', 'osm:node/4938073668', 'historic=ruins', 'node', 4938073668),
      ('Vestiges de l''ancien château de Crénan', 'vestiges-de-l-ancien-chateau-de-crenan', 48.42, -2.89, 'ruins', 'osm:node/5599719759', 'historic=ruins', 'node', 5599719759),
      ('Viaduc de Port-Nieux', 'viaduc-de-port-nieux', 48.63, -2.33, 'bridge', 'osm:way/320177779', 'bridge=viaduct', 'way', 320177779),
      ('Village déserté fortifié de Goarem-ar-Manec''h', 'village-deserte-fortifie-de-goarem-ar-manec-h', 48.4, -3.83, 'ruins', 'osm:node/1686968468', 'historic=ruins', 'node', 1686968468)
  ) AS v(
    name,
    slug,
    latitude,
    longitude,
    photo_atlas_type,
    source_external_id,
    source_type,
    osm_type,
    osm_id
  )
),
typed_spots AS (
  SELECT
    e.*,
    st.id AS spot_type_id
  FROM editorial_spots AS e
  LEFT JOIN public.spot_types AS st
    ON st.slug = e.photo_atlas_type
)
  UPDATE public.spots AS s
  SET status = 'verified'
  FROM typed_spots AS t
  WHERE s.source = 'osm'
    AND s.source_external_id = t.normalized_source_external_id
    AND s.status = 'candidate';

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  IF v_updated_count <> v_expected_count THEN
    RAISE EXCEPTION 'bretagne publish aborted: expected % updated rows, got %.', v_expected_count, v_updated_count;
  END IF;

  WITH editorial_spots AS (
  SELECT
    name,
    slug,
    latitude::double precision AS latitude,
    longitude::double precision AS longitude,
    photo_atlas_type,
    source_external_id,
    regexp_replace(source_external_id, '^osm:', '') AS normalized_source_external_id,
    source_type,
    osm_type,
    osm_id::bigint AS osm_id
  FROM (
    VALUES
      ('Phare de la Jument', 'phare-de-la-jument', 48.42, -5.13, 'lighthouse', 'osm:node/117081598', 'man_made=lighthouse', 'node', 117081598),
      ('Phare de Pen-Men', 'phare-de-pen-men', 47.65, -3.51, 'lighthouse', 'osm:node/255359392', 'man_made=lighthouse', 'node', 255359392),
      ('Phare des Roches-Douvres', 'phare-des-roches-douvres', 49.11, -2.81, 'lighthouse', 'osm:node/1378041353', 'man_made=lighthouse', 'node', 1378041353),
      ('Phare du Four', 'phare-du-four', 48.52, -4.81, 'lighthouse', 'osm:node/1269267113', 'man_made=lighthouse', 'node', 1269267113),
      ('Phare du Petit Minou', 'phare-du-petit-minou', 48.34, -4.61, 'lighthouse', 'osm:node/1370801434', 'man_made=lighthouse', 'node', 1370801434),
      ('Phare des Sept-Îles', 'phare-des-sept-iles', 48.88, -3.49, 'lighthouse', 'osm:node/6793206641', 'man_made=lighthouse', 'node', 6793206641),
      ('Phare de la Croix', 'phare-de-la-croix-le-trieux', 48.84, -3.05, 'lighthouse', 'osm:node/1543882146', 'man_made=lighthouse', 'node', 1543882146),
      ('Phare de Tévennec', 'phare-de-tevennec', 48.07, -4.8, 'lighthouse', 'osm:node/1269200222', 'man_made=lighthouse', 'node', 1269200222),
      ('Phare de Trézien', 'phare-de-trezien', 48.42, -4.78, 'lighthouse', 'osm:node/1370801507', 'man_made=lighthouse', 'node', 1370801507),
      ('Phare des Moutons', 'phare-des-moutons', 47.77, -4.03, 'lighthouse', 'osm:node/1395067584', 'man_made=lighthouse', 'node', 1395067584),
      ('Phare des Pierres-Noires', 'phare-des-pierres-noires', 48.31, -4.91, 'lighthouse', 'osm:node/1370801478', 'man_made=lighthouse', 'node', 1370801478),
      ('Phare du Créac''h', 'phare-du-creac-h', 48.46, -5.13, 'lighthouse', 'osm:node/13138447296', 'man_made=lighthouse', 'node', 13138447296),
      ('Phare du Grand-Jardin', 'phare-du-grand-jardin', 48.67, -2.08, 'lighthouse', 'osm:way/94677643', 'man_made=lighthouse', 'way', 94677643),
      ('Phare du Millier', 'phare-du-millier', 48.1, -4.47, 'lighthouse', 'osm:node/535700544', 'man_made=lighthouse', 'node', 535700544),
      ('Phare du Portzic', 'phare-du-portzic', 48.36, -4.53, 'lighthouse', 'osm:node/1370801418', 'man_made=lighthouse', 'node', 1370801418),
      ('Phare du Rosédo', 'phare-du-rosedo', 48.86, -3, 'lighthouse', 'osm:node/2715566908', 'man_made=lighthouse', 'node', 2715566908),
      ('Château de Fougères', 'chateau-de-fougeres', 48.35, -1.21, 'castle', 'osm:way/1429681256', 'historic=castle', 'way', 1429681256),
      ('Observatoire du marais de Séné', 'observatoire-du-marais-de-sene', 47.62, -2.71, 'observatory', 'osm:node/7786979338', 'tourism=viewpoint', 'node', 7786979338),
      ('Château de Rustéphan', 'chateau-de-rustephan', 47.86, -3.77, 'ruins', 'osm:node/4938217707', 'historic=ruins', 'node', 4938217707),
      ('Phare de Kéréon', 'phare-de-kereon', 48.44, -5.03, 'lighthouse', 'osm:way/627188299', 'man_made=lighthouse', 'way', 627188299),
      ('Phare de Kergadec', 'phare-de-kergadec', 48.02, -4.55, 'lighthouse', 'osm:node/602214530', 'man_made=lighthouse', 'node', 602214530),
      ('Phare de l''Aber Ildut', 'phare-de-l-aber-ildut', 48.47, -4.76, 'lighthouse', 'osm:node/1269226414', 'man_made=lighthouse', 'node', 1269226414),
      ('Phare de l''île de Sein', 'phare-de-l-ile-de-sein', 48.04, -4.87, 'lighthouse', 'osm:way/364993683', 'man_made=lighthouse', 'way', 364993683),
      ('Phare de l''Île Vierge', 'phare-de-l-ile-vierge', 48.64, -4.57, 'lighthouse', 'osm:way/93055283', 'man_made=lighthouse', 'way', 93055283),
      ('Phare de la Vieille', 'phare-de-la-vieille', 48.04, -4.76, 'lighthouse', 'osm:way/737263555', 'man_made=lighthouse', 'way', 737263555),
      ('Phare du Toulinguet', 'phare-du-toulinguet', 48.28, -4.63, 'lighthouse', 'osm:node/1269394756', 'man_made=lighthouse', 'node', 1269394756),
      ('Phare et fort de Penfret', 'phare-et-fort-de-penfret', 47.72, -3.95, 'lighthouse', 'osm:node/5907022932', 'man_made=lighthouse', 'node', 5907022932),
      ('Fort Cigogne', 'fort-cigogne', 47.72, -3.99, 'fortification', 'osm:node/3034504597', 'historic=fort', 'node', 3034504597),
      ('Phare de Goulphar', 'phare-de-goulphar', 47.31, -3.23, 'lighthouse', 'osm:way/63697430', 'man_made=lighthouse', 'way', 63697430),
      ('Phare de Lanvaon', 'phare-de-lanvaon', 48.61, -4.54, 'lighthouse', 'osm:way/232642575', 'man_made=lighthouse', 'way', 232642575),
      ('Phare du Cap Fréhel', 'phare-du-cap-frehel', 48.68, -2.32, 'lighthouse', 'osm:way/135722236', 'man_made=lighthouse', 'way', 135722236),
      ('Château de Fontenay', 'chateau-de-fontenay', 48.05, -1.7, 'castle', 'osm:node/4968595050', 'historic=castle', 'node', 4968595050),
      ('Château de Kéralio', 'chateau-de-keralio', 48.82, -3.25, 'castle', 'osm:node/3029844736', 'historic=castle', 'node', 3029844736),
      ('Château de la Sécardais', 'chateau-de-la-secardais', 48.3, -1.46, 'castle', 'osm:node/4990866348', 'historic=castle', 'node', 4990866348),
      ('Château de Lupin', 'chateau-de-lupin', 48.68, -1.94, 'castle', 'osm:node/4990866347', 'historic=castle', 'node', 4990866347),
      ('Château du Bot', 'chateau-du-bot', 47.81, -3.3, 'castle', 'osm:node/4674932670', 'historic=castle', 'node', 4674932670),
      ('Fort de Taillefer', 'fort-de-taillefer', 47.36, -3.16, 'fortification', 'osm:node/4354560524', 'historic=fort', 'node', 4354560524),
      ('Le Vieux Pont Suspendu', 'le-vieux-pont-suspendu', 47.64, -2.95, 'monument', 'osm:way/37106950', 'historic=monument', 'way', 37106950),
      ('Observatoire', 'observatoire-n48-5193-w1-5153', 48.52, -1.52, 'observatory', 'osm:node/4715006920', 'tourism=viewpoint', 'node', 4715006920),
      ('Observatoire', 'observatoire-n47-7609-w3-3239', 47.76, -3.32, 'observatory', 'osm:node/5590864486', 'leisure=bird_hide', 'node', 5590864486),
      ('Observatoire', 'observatoire-n47-7686-w3-5019', 47.77, -3.5, 'observatory', 'osm:node/6022818160', 'leisure=bird_hide', 'node', 6022818160),
      ('Observatoire de Kersanton', 'observatoire-de-kersanton', 48.35, -4.3, 'observatory', 'osm:node/11897628369', 'leisure=bird_hide', 'node', 11897628369),
      ('Observatoire de l''étang du Hézo', 'observatoire-de-l-etang-du-hezo', 47.58, -2.7, 'observatory', 'osm:node/14080691020', 'leisure=bird_hide', 'node', 14080691020),
      ('Observatoire de Lanveur', 'observatoire-de-lanveur', 48.36, -4.3, 'observatory', 'osm:node/11897628406', 'leisure=bird_hide', 'node', 11897628406),
      ('Observatoire de Penfoul', 'observatoire-de-penfoul', 48.33, -4.31, 'observatory', 'osm:node/10299619646', 'leisure=bird_hide', 'node', 10299619646),
      ('Observatoire de Pennaras', 'observatoire-de-pennaras', 48.33, -4.3, 'observatory', 'osm:node/6739769293', 'leisure=bird_hide', 'node', 6739769293),
      ('Observatoire ornithologique', 'observatoire-ornithologique-n48-0698-w2-0120', 48.07, -2.01, 'observatory', 'osm:node/10556615855', 'leisure=bird_hide', 'node', 10556615855),
      ('Observatoire ornithologique', 'observatoire-ornithologique-n48-0751-w2-0137', 48.08, -2.01, 'observatory', 'osm:node/10556663392', 'leisure=bird_hide', 'node', 10556663392),
      ('Observatoire ornithologique de la Musse', 'observatoire-ornithologique-de-la-musse', 48.51, -1.51, 'observatory', 'osm:node/4714905290', 'tourism=viewpoint', 'node', 4714905290),
      ('Phare de l''île de Batz', 'phare-de-l-ile-de-batz', 48.75, -4.03, 'lighthouse', 'osm:way/72268409', 'man_made=lighthouse', 'way', 72268409),
      ('Phare de la Teignouse', 'phare-de-la-teignouse', 47.46, -3.05, 'lighthouse', 'osm:node/1370799982', 'man_made=lighthouse', 'node', 1370799982),
      ('Phare de Pontusval', 'phare-de-pontusval', 48.68, -4.35, 'lighthouse', 'osm:node/1865624218', 'man_made=lighthouse', 'node', 1865624218),
      ('Phare des Grands Cardinaux', 'phare-des-grands-cardinaux', 47.32, -2.83, 'lighthouse', 'osm:node/2883454480', 'man_made=lighthouse', 'node', 2883454480),
      ('Château de la Grand''Ville', 'chateau-de-la-grand-ville', 48.58, -2.99, 'castle', 'osm:node/5599719757', 'historic=castle', 'node', 5599719757),
      ('Château de Mesléan', 'chateau-de-meslean', 48.44, -4.46, 'castle', 'osm:node/1920516166', 'historic=castle', 'node', 1920516166),
      ('Château de Trémohar', 'chateau-de-tremohar', 47.63, -2.57, 'castle', 'osm:node/2580167031', 'historic=castle', 'node', 2580167031),
      ('Lech de Pen-er-Pont', 'lech-de-pen-er-pont', 47.7, -3.13, 'monument', 'osm:node/5283040087', 'historic=monument', 'node', 5283040087),
      ('Abbaye Saint-Maurice', 'abbaye-saint-maurice', 47.8, -3.53, 'ruins', 'osm:node/4728503207', 'historic=ruins', 'node', 4728503207),
      ('Batterie Basse de Cornouaille', 'batterie-basse-de-cornouaille', 48.33, -4.57, 'ruins', 'osm:node/6227948399', 'historic=ruins', 'node', 6227948399),
      ('Château de Beaumont', 'chateau-de-beaumont', 48.3, -2.09, 'castle', 'osm:node/5599719764', 'historic=castle', 'node', 5599719764),
      ('Château de Coat-Trédrez', 'chateau-de-coat-tredrez', 48.71, -3.55, 'castle', 'osm:node/1258865133', 'historic=castle', 'node', 1258865133),
      ('Château de Lezergué', 'chateau-de-lezergue', 48.01, -4.02, 'castle', 'osm:node/4938217715', 'historic=castle', 'node', 4938217715),
      ('Château de Sourdéac', 'chateau-de-sourdeac', 47.73, -2.12, 'castle', 'osm:node/4674932671', 'historic=castle', 'node', 4674932671),
      ('Château de Talhouët', 'chateau-de-talhouet', 47.72, -2.37, 'castle', 'osm:node/4567694428', 'historic=castle', 'node', 4567694428),
      ('Château de Troménec', 'chateau-de-tromenec', 48.59, -4.56, 'castle', 'osm:node/4938217712', 'historic=castle', 'node', 4938217712),
      ('Château du Hénant', 'chateau-du-henant', 47.83, -3.76, 'castle', 'osm:node/4938217711', 'historic=castle', 'node', 4938217711),
      ('Fort du Minou', 'fort-du-minou', 48.34, -4.61, 'ruins', 'osm:node/2012913656', 'historic=ruins', 'node', 2012913656),
      ('Phare d''Eckmühl', 'phare-d-eckmuhl', 47.8, -4.37, 'lighthouse', 'osm:way/33779845', 'man_made=lighthouse', 'way', 33779845),
      ('Phare de Kermorvan', 'phare-de-kermorvan', 48.36, -4.79, 'lighthouse', 'osm:way/232707096', 'man_made=lighthouse', 'way', 232707096),
      ('Phare de Langoz', 'phare-de-langoz', 47.83, -4.16, 'lighthouse', 'osm:way/93512248', 'man_made=lighthouse', 'way', 93512248),
      ('Phare de Mean Ruz', 'phare-de-mean-ruz', 48.84, -3.48, 'lighthouse', 'osm:way/81963847', 'man_made=lighthouse', 'way', 81963847),
      ('Phare de Port-Navalo', 'phare-de-port-navalo', 47.55, -2.92, 'lighthouse', 'osm:way/171076270', 'man_made=lighthouse', 'way', 171076270),
      ('Phare de Roscoff', 'phare-de-roscoff', 48.72, -3.98, 'lighthouse', 'osm:way/72072235', 'man_made=lighthouse', 'way', 72072235),
      ('Réserve Ornithologique Koh Kastel', 'reserve-ornithologique-koh-kastel', 47.37, -3.26, 'bird_reserve', 'osm:way/40402853', 'boundary=protected_area', 'way', 40402853),
      ('Ruines du château de La Chèze', 'ruines-du-chateau-de-la-cheze', 48.13, -2.66, 'ruins', 'osm:node/5599719758', 'historic=ruins', 'node', 5599719758),
      ('Anciens Fours à chaux', 'anciens-fours-a-chaux', 48.04, -1.72, 'ruins', 'osm:node/6110181120', 'historic=ruins', 'node', 6110181120),
      ('Butte de César', 'butte-de-cesar', 47.54, -2.87, 'viewpoint', 'osm:node/1675115889', 'tourism=viewpoint', 'node', 1675115889),
      ('Château de Boutavent', 'chateau-de-boutavent', 48.07, -2.05, 'castle', 'osm:node/3001278312', 'historic=castle', 'node', 3001278312),
      ('Château de Cargouët', 'chateau-de-cargouet', 48.45, -2.6, 'ruins', 'osm:node/5599719768', 'historic=ruins', 'node', 5599719768),
      ('Château de Coëtquen', 'chateau-de-coetquen', 48.47, -1.94, 'ruins', 'osm:node/5599719778', 'historic=ruins', 'node', 5599719778),
      ('Château de la Touche-à-la Vache', 'chateau-de-la-touche-a-la-vache', 48.52, -2.2, 'ruins', 'osm:node/4893955029', 'historic=ruins', 'node', 4893955029),
      ('Château de Perrien', 'chateau-de-perrien', 48.48, -3.02, 'ruins', 'osm:node/5599719766', 'historic=ruins', 'node', 5599719766),
      ('Château du Bois de la Salle', 'chateau-du-bois-de-la-salle', 48.62, -2.93, 'castle', 'osm:node/5599719774', 'historic=castle', 'node', 5599719774),
      ('Ensemble fortifié de La Ferrière', 'ensemble-fortifie-de-la-ferriere', 47.32, -3.11, 'fortification', 'osm:node/4309832845', 'historic=fort', 'node', 4309832845),
      ('Fort du Cabellou', 'fort-du-cabellou', 47.86, -3.92, 'fortification', 'osm:node/430910388', 'historic=fort', 'node', 430910388),
      ('La Citadelle', 'la-citadelle', 47.35, -3.15, 'fortification', 'osm:way/147054705', 'historic=fort', 'way', 147054705),
      ('observatoire', 'observatoire-n48-1988-w1-5808', 48.2, -1.58, 'observatory', 'osm:node/3761248071', 'leisure=bird_hide', 'node', 3761248071),
      ('Observatoire', 'observatoire-n48-2460-w3-3935', 48.25, -3.39, 'observatory', 'osm:node/4938382192', 'leisure=bird_hide', 'node', 4938382192),
      ('Observatoire aquatique', 'observatoire-aquatique', 48.2, -4.09, 'observatory', 'osm:node/4507117298', 'unknown', 'node', 4507117298),
      ('Observatoire astronomique de la pointe du Diable', 'observatoire-astronomique-de-la-pointe-du-diable', 48.36, -4.57, 'observatory', 'osm:way/359597183', 'unknown', 'way', 359597183),
      ('Observatoire de l''Astro-Club Alnitak', 'observatoire-de-l-astro-club-alnitak', 48.44, -4.15, 'observatory', 'osm:node/14062411951', 'man_made=observatory', 'node', 14062411951),
      ('Observatoire faune', 'observatoire-faune', 47.8, -4.27, 'observatory', 'osm:way/184001154', 'unknown', 'way', 184001154),
      ('Observatoire n°1', 'observatoire-n-1-n47-6138-w2-7166', 47.61, -2.72, 'observatory', 'osm:way/173491752', 'leisure=bird_hide', 'way', 173491752),
      ('Observatoire n°3', 'observatoire-n-3', 47.62, -2.72, 'observatory', 'osm:way/125425427', 'leisure=bird_hide', 'way', 125425427),
      ('Observatoire nº 1', 'observatoire-n-1-n47-5411-w2-7344', 47.54, -2.73, 'observatory', 'osm:way/299846400', 'tourism=viewpoint', 'way', 299846400),
      ('Observatoire nº 2', 'observatoire-n-2', 47.54, -2.74, 'observatory', 'osm:way/299846399', 'tourism=viewpoint', 'way', 299846399),
      ('Observatoire ornithologique', 'observatoire-ornithologique-n48-7816-w3-5771', 48.78, -3.58, 'observatory', 'osm:way/265721290', 'tower:type=observation', 'way', 265721290),
      ('Phare de la Balue', 'phare-de-la-balue', 48.63, -2, 'lighthouse', 'osm:way/54974026', 'man_made=lighthouse', 'way', 54974026),
      ('Phare de La Croix', 'phare-de-la-croix-n47-8693-w3-9181', 47.87, -3.92, 'lighthouse', 'osm:way/118445466', 'man_made=lighthouse', 'way', 118445466),
      ('Réserve ornithologique du Verdelet', 'reserve-ornithologique-du-verdelet', 48.6, -2.56, 'bird_reserve', 'osm:way/26809265', 'leisure=nature_reserve', 'way', 26809265),
      ('Restes du château', 'restes-du-chateau', 48.32, -3.06, 'ruins', 'osm:node/2293790132', 'historic=ruins', 'node', 2293790132),
      ('Ruines de la chapelle de Lochrist et calvaire', 'ruines-de-la-chapelle-de-lochrist-et-calvaire', 48.07, -3.88, 'ruins', 'osm:node/4938073668', 'historic=ruins', 'node', 4938073668),
      ('Vestiges de l''ancien château de Crénan', 'vestiges-de-l-ancien-chateau-de-crenan', 48.42, -2.89, 'ruins', 'osm:node/5599719759', 'historic=ruins', 'node', 5599719759),
      ('Viaduc de Port-Nieux', 'viaduc-de-port-nieux', 48.63, -2.33, 'bridge', 'osm:way/320177779', 'bridge=viaduct', 'way', 320177779),
      ('Village déserté fortifié de Goarem-ar-Manec''h', 'village-deserte-fortifie-de-goarem-ar-manec-h', 48.4, -3.83, 'ruins', 'osm:node/1686968468', 'historic=ruins', 'node', 1686968468)
  ) AS v(
    name,
    slug,
    latitude,
    longitude,
    photo_atlas_type,
    source_external_id,
    source_type,
    osm_type,
    osm_id
  )
),
typed_spots AS (
  SELECT
    e.*,
    st.id AS spot_type_id
  FROM editorial_spots AS e
  LEFT JOIN public.spot_types AS st
    ON st.slug = e.photo_atlas_type
)
  SELECT
    (SELECT count(*)
     FROM public.spots AS s
     JOIN typed_spots AS t
       ON s.source = 'osm'
      AND s.source_external_id = t.normalized_source_external_id
     WHERE s.status = 'verified'),
    (SELECT count(*)
     FROM public.spots AS s
     JOIN typed_spots AS t
       ON s.source = 'osm'
      AND s.source_external_id = t.normalized_source_external_id
     WHERE s.name IS DISTINCT FROM t.name
        OR s.slug IS DISTINCT FROM t.slug
        OR s.source IS DISTINCT FROM 'osm'
        OR s.source_external_id IS DISTINCT FROM t.normalized_source_external_id
        OR s.source_type IS DISTINCT FROM t.source_type
        OR s.status IS DISTINCT FROM 'verified'
        OR s.spot_type IS DISTINCT FROM t.photo_atlas_type
        OR s.spot_type_id IS DISTINCT FROM t.spot_type_id
        OR abs(ST_Y(s.position::geometry) - t.latitude) > 0.0000001
        OR abs(ST_X(s.position::geometry) - t.longitude) > 0.0000001),
    (SELECT count(*)
     FROM (
       SELECT s.source, s.source_external_id, count(*) AS row_count
       FROM public.spots AS s
       JOIN typed_spots AS t
         ON s.source = 'osm'
        AND s.source_external_id = t.normalized_source_external_id
       GROUP BY s.source, s.source_external_id
       HAVING count(*) > 1
     ) AS duplicate_sources),
    (SELECT count(*)
     FROM (
       SELECT s.slug, count(*) AS row_count
       FROM public.spots AS s
       JOIN typed_spots AS t
         ON s.slug = t.slug
       GROUP BY s.slug
       HAVING count(*) > 1
     ) AS duplicate_slugs),
    (SELECT count(*)
     FROM public.spots AS s
     WHERE s.region = 'Bretagne'
       AND s.source = 'osm'
       AND NOT EXISTS (
         SELECT 1
         FROM typed_spots AS t
         WHERE t.normalized_source_external_id = s.source_external_id
       )),
    (SELECT count(*)
     FROM public.spots AS s
     WHERE s.region = 'Bretagne'
       AND s.source = 'osm'
       AND s.status = 'candidate'
       AND NOT EXISTS (
         SELECT 1
         FROM typed_spots AS t
         WHERE t.normalized_source_external_id = s.source_external_id
       )),
    (SELECT count(*)
     FROM public.spots AS s
     WHERE s.region = 'Bretagne'
       AND s.source = 'osm'
       AND s.status = 'verified'
       AND NOT EXISTS (
         SELECT 1
         FROM typed_spots AS t
         WHERE t.normalized_source_external_id = s.source_external_id
       )),
    (SELECT count(*)
     FROM public.spots AS s
     WHERE s.region = 'Bretagne'
       AND s.source = 'osm'
       AND s.status = 'rejected'
       AND NOT EXISTS (
         SELECT 1
         FROM typed_spots AS t
         WHERE t.normalized_source_external_id = s.source_external_id
       ))
  INTO
    v_post_verified_count,
    v_post_identity_mismatch_count,
    v_post_duplicate_source_count,
    v_post_duplicate_slug_count,
    v_non_target_bretagne_total_after,
    v_non_target_candidate_after,
    v_non_target_verified_after,
    v_non_target_rejected_after;

  IF v_post_verified_count <> v_expected_count THEN
    RAISE EXCEPTION 'bretagne publish aborted: post-check verified count failed (%/%).', v_post_verified_count, v_expected_count;
  END IF;

  IF v_post_identity_mismatch_count <> 0 THEN
    RAISE EXCEPTION 'bretagne publish aborted: % post-check identity mismatches detected.', v_post_identity_mismatch_count;
  END IF;

  IF v_post_duplicate_source_count <> 0 THEN
    RAISE EXCEPTION 'bretagne publish aborted: % duplicate source/source_external_id pairs detected after publish.', v_post_duplicate_source_count;
  END IF;

  IF v_post_duplicate_slug_count <> 0 THEN
    RAISE EXCEPTION 'bretagne publish aborted: % duplicate slugs detected after publish.', v_post_duplicate_slug_count;
  END IF;

  IF v_non_target_bretagne_total_after <> v_non_target_bretagne_total_before THEN
    RAISE EXCEPTION 'bretagne publish aborted: non-target Bretagne total changed (% -> %).', v_non_target_bretagne_total_before, v_non_target_bretagne_total_after;
  END IF;

  IF v_non_target_candidate_after <> v_non_target_candidate_before THEN
    RAISE EXCEPTION 'bretagne publish aborted: non-target Bretagne candidate count changed (% -> %).', v_non_target_candidate_before, v_non_target_candidate_after;
  END IF;

  IF v_non_target_verified_after <> v_non_target_verified_before THEN
    RAISE EXCEPTION 'bretagne publish aborted: non-target Bretagne verified count changed (% -> %).', v_non_target_verified_before, v_non_target_verified_after;
  END IF;

  IF v_non_target_rejected_after <> v_non_target_rejected_before THEN
    RAISE EXCEPTION 'bretagne publish aborted: non-target Bretagne rejected count changed (% -> %).', v_non_target_rejected_before, v_non_target_rejected_after;
  END IF;

  SELECT count(*) INTO v_after_total FROM public.spots;

  IF v_after_total <> v_before_total THEN
    RAISE EXCEPTION 'bretagne publish aborted: total spot count changed (% -> %).', v_before_total, v_after_total;
  END IF;
END $$;

COMMIT;
