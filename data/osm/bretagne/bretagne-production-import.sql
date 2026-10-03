BEGIN;

DO $$
DECLARE
  v_expected_count integer := 105;
  v_before_total integer := 0;
  v_after_total integer := 0;
  v_row_count integer := 0;
  v_unique_place_key_count integer := 0;
  v_unique_slug_count integer := 0;
  v_unique_source_external_id_count integer := 0;
  v_unique_osm_count integer := 0;
  v_missing_type_count integer := 0;
  v_existing_source_external_id_count integer := 0;
  v_existing_slug_count integer := 0;
  v_inserted_count integer := 0;
  v_post_source_external_id_count integer := 0;
  v_post_slug_count integer := 0;
  v_post_candidate_count integer := 0;
  v_post_type_count integer := 0;
  v_post_identity_mismatch_count integer := 0;
  v_post_duplicate_source_count integer := 0;
  v_post_duplicate_slug_count integer := 0;
BEGIN
  SELECT count(*) INTO v_before_total FROM public.spots;

  WITH editorial_spots AS (
  SELECT
    place_key,
    name,
    slug,
    latitude::double precision AS latitude,
    longitude::double precision AS longitude,
    photo_atlas_type,
    photo_atlas_family,
    osm_type,
    osm_id::bigint AS osm_id,
    source_external_id,
    regexp_replace(source_external_id, '^osm:', '') AS normalized_source_external_id,
    source_type
  FROM (
    VALUES
      ('osm:node/117081598', 'Phare de la Jument', 'phare-de-la-jument', 48.42, -5.13, 'lighthouse', 'Maritime', 'node', 117081598, 'osm:node/117081598', 'man_made=lighthouse'),
      ('osm:node/255359392', 'Phare de Pen-Men', 'phare-de-pen-men', 47.65, -3.51, 'lighthouse', 'Maritime', 'node', 255359392, 'osm:node/255359392', 'man_made=lighthouse'),
      ('osm:node/1378041353', 'Phare des Roches-Douvres', 'phare-des-roches-douvres', 49.11, -2.81, 'lighthouse', 'Maritime', 'node', 1378041353, 'osm:node/1378041353', 'man_made=lighthouse'),
      ('osm:node/1269267113', 'Phare du Four', 'phare-du-four', 48.52, -4.81, 'lighthouse', 'Maritime', 'node', 1269267113, 'osm:node/1269267113', 'man_made=lighthouse'),
      ('osm:node/1370801434', 'Phare du Petit Minou', 'phare-du-petit-minou', 48.34, -4.61, 'lighthouse', 'Maritime', 'node', 1370801434, 'osm:node/1370801434', 'man_made=lighthouse'),
      ('osm:node/6793206641', 'Phare des Sept-Îles', 'phare-des-sept-iles', 48.88, -3.49, 'lighthouse', 'Maritime', 'node', 6793206641, 'osm:node/6793206641', 'man_made=lighthouse'),
      ('osm:node/1543882146', 'Phare de la Croix', 'phare-de-la-croix-le-trieux', 48.84, -3.05, 'lighthouse', 'Maritime', 'node', 1543882146, 'osm:node/1543882146', 'man_made=lighthouse'),
      ('osm:node/1269200222', 'Phare de Tévennec', 'phare-de-tevennec', 48.07, -4.8, 'lighthouse', 'Maritime', 'node', 1269200222, 'osm:node/1269200222', 'man_made=lighthouse'),
      ('osm:node/1370801507', 'Phare de Trézien', 'phare-de-trezien', 48.42, -4.78, 'lighthouse', 'Maritime', 'node', 1370801507, 'osm:node/1370801507', 'man_made=lighthouse'),
      ('osm:node/1395067584', 'Phare des Moutons', 'phare-des-moutons', 47.77, -4.03, 'lighthouse', 'Maritime', 'node', 1395067584, 'osm:node/1395067584', 'man_made=lighthouse'),
      ('osm:node/1370801478', 'Phare des Pierres-Noires', 'phare-des-pierres-noires', 48.31, -4.91, 'lighthouse', 'Maritime', 'node', 1370801478, 'osm:node/1370801478', 'man_made=lighthouse'),
      ('osm:node/13138447296', 'Phare du Créac''h', 'phare-du-creac-h', 48.46, -5.13, 'lighthouse', 'Maritime', 'node', 13138447296, 'osm:node/13138447296', 'man_made=lighthouse'),
      ('osm:way/94677643', 'Phare du Grand-Jardin', 'phare-du-grand-jardin', 48.67, -2.08, 'lighthouse', 'Maritime', 'way', 94677643, 'osm:way/94677643', 'man_made=lighthouse'),
      ('osm:node/535700544', 'Phare du Millier', 'phare-du-millier', 48.1, -4.47, 'lighthouse', 'Maritime', 'node', 535700544, 'osm:node/535700544', 'man_made=lighthouse'),
      ('osm:node/1370801418', 'Phare du Portzic', 'phare-du-portzic', 48.36, -4.53, 'lighthouse', 'Maritime', 'node', 1370801418, 'osm:node/1370801418', 'man_made=lighthouse'),
      ('osm:node/2715566908', 'Phare du Rosédo', 'phare-du-rosedo', 48.86, -3, 'lighthouse', 'Maritime', 'node', 2715566908, 'osm:node/2715566908', 'man_made=lighthouse'),
      ('osm:way/1429681256', 'Château de Fougères', 'chateau-de-fougeres', 48.35, -1.21, 'castle', 'Architecture', 'way', 1429681256, 'osm:way/1429681256', 'historic=castle'),
      ('osm:node/7786979338', 'Observatoire du marais de Séné', 'observatoire-du-marais-de-sene', 47.62, -2.71, 'observatory', 'Observation', 'node', 7786979338, 'osm:node/7786979338', 'tourism=viewpoint'),
      ('osm:node/4938217707', 'Château de Rustéphan', 'chateau-de-rustephan', 47.86, -3.77, 'ruins', 'Architecture', 'node', 4938217707, 'osm:node/4938217707', 'historic=ruins'),
      ('osm:way/627188299', 'Phare de Kéréon', 'phare-de-kereon', 48.44, -5.03, 'lighthouse', 'Maritime', 'way', 627188299, 'osm:way/627188299', 'man_made=lighthouse'),
      ('osm:node/602214530', 'Phare de Kergadec', 'phare-de-kergadec', 48.02, -4.55, 'lighthouse', 'Maritime', 'node', 602214530, 'osm:node/602214530', 'man_made=lighthouse'),
      ('osm:node/1269226414', 'Phare de l''Aber Ildut', 'phare-de-l-aber-ildut', 48.47, -4.76, 'lighthouse', 'Maritime', 'node', 1269226414, 'osm:node/1269226414', 'man_made=lighthouse'),
      ('osm:way/364993683', 'Phare de l''île de Sein', 'phare-de-l-ile-de-sein', 48.04, -4.87, 'lighthouse', 'Maritime', 'way', 364993683, 'osm:way/364993683', 'man_made=lighthouse'),
      ('osm:way/93055283', 'Phare de l''Île Vierge', 'phare-de-l-ile-vierge', 48.64, -4.57, 'lighthouse', 'Maritime', 'way', 93055283, 'osm:way/93055283', 'man_made=lighthouse'),
      ('osm:way/737263555', 'Phare de la Vieille', 'phare-de-la-vieille', 48.04, -4.76, 'lighthouse', 'Maritime', 'way', 737263555, 'osm:way/737263555', 'man_made=lighthouse'),
      ('osm:node/1269394756', 'Phare du Toulinguet', 'phare-du-toulinguet', 48.28, -4.63, 'lighthouse', 'Maritime', 'node', 1269394756, 'osm:node/1269394756', 'man_made=lighthouse'),
      ('osm:node/5907022932', 'Phare et fort de Penfret', 'phare-et-fort-de-penfret', 47.72, -3.95, 'lighthouse', 'Maritime', 'node', 5907022932, 'osm:node/5907022932', 'man_made=lighthouse'),
      ('osm:node/3034504597', 'Fort Cigogne', 'fort-cigogne', 47.72, -3.99, 'fortification', 'Architecture', 'node', 3034504597, 'osm:node/3034504597', 'historic=fort'),
      ('osm:way/63697430', 'Phare de Goulphar', 'phare-de-goulphar', 47.31, -3.23, 'lighthouse', 'Maritime', 'way', 63697430, 'osm:way/63697430', 'man_made=lighthouse'),
      ('osm:way/232642575', 'Phare de Lanvaon', 'phare-de-lanvaon', 48.61, -4.54, 'lighthouse', 'Maritime', 'way', 232642575, 'osm:way/232642575', 'man_made=lighthouse'),
      ('osm:way/135722236', 'Phare du Cap Fréhel', 'phare-du-cap-frehel', 48.68, -2.32, 'lighthouse', 'Maritime', 'way', 135722236, 'osm:way/135722236', 'man_made=lighthouse'),
      ('osm:node/4968595050', 'Château de Fontenay', 'chateau-de-fontenay', 48.05, -1.7, 'castle', 'Architecture', 'node', 4968595050, 'osm:node/4968595050', 'historic=castle'),
      ('osm:node/3029844736', 'Château de Kéralio', 'chateau-de-keralio', 48.82, -3.25, 'castle', 'Architecture', 'node', 3029844736, 'osm:node/3029844736', 'historic=castle'),
      ('osm:node/4990866348', 'Château de la Sécardais', 'chateau-de-la-secardais', 48.3, -1.46, 'castle', 'Architecture', 'node', 4990866348, 'osm:node/4990866348', 'historic=castle'),
      ('osm:node/4990866347', 'Château de Lupin', 'chateau-de-lupin', 48.68, -1.94, 'castle', 'Architecture', 'node', 4990866347, 'osm:node/4990866347', 'historic=castle'),
      ('osm:node/4674932670', 'Château du Bot', 'chateau-du-bot', 47.81, -3.3, 'castle', 'Architecture', 'node', 4674932670, 'osm:node/4674932670', 'historic=castle'),
      ('osm:node/4354560524', 'Fort de Taillefer', 'fort-de-taillefer', 47.36, -3.16, 'fortification', 'Architecture', 'node', 4354560524, 'osm:node/4354560524', 'historic=fort'),
      ('osm:way/37106950', 'Le Vieux Pont Suspendu', 'le-vieux-pont-suspendu', 47.64, -2.95, 'monument', 'Architecture', 'way', 37106950, 'osm:way/37106950', 'historic=monument'),
      ('osm:node/4715006920', 'Observatoire', 'observatoire-n48-5193-w1-5153', 48.52, -1.52, 'observatory', 'Observation', 'node', 4715006920, 'osm:node/4715006920', 'tourism=viewpoint'),
      ('osm:node/5590864486', 'Observatoire', 'observatoire-n47-7609-w3-3239', 47.76, -3.32, 'observatory', 'Observation', 'node', 5590864486, 'osm:node/5590864486', 'leisure=bird_hide'),
      ('osm:node/6022818160', 'Observatoire', 'observatoire-n47-7686-w3-5019', 47.77, -3.5, 'observatory', 'Observation', 'node', 6022818160, 'osm:node/6022818160', 'leisure=bird_hide'),
      ('osm:node/11897628369', 'Observatoire de Kersanton', 'observatoire-de-kersanton', 48.35, -4.3, 'observatory', 'Observation', 'node', 11897628369, 'osm:node/11897628369', 'leisure=bird_hide'),
      ('osm:node/14080691020', 'Observatoire de l''étang du Hézo', 'observatoire-de-l-etang-du-hezo', 47.58, -2.7, 'observatory', 'Observation', 'node', 14080691020, 'osm:node/14080691020', 'leisure=bird_hide'),
      ('osm:node/11897628406', 'Observatoire de Lanveur', 'observatoire-de-lanveur', 48.36, -4.3, 'observatory', 'Observation', 'node', 11897628406, 'osm:node/11897628406', 'leisure=bird_hide'),
      ('osm:node/10299619646', 'Observatoire de Penfoul', 'observatoire-de-penfoul', 48.33, -4.31, 'observatory', 'Observation', 'node', 10299619646, 'osm:node/10299619646', 'leisure=bird_hide'),
      ('osm:node/6739769293', 'Observatoire de Pennaras', 'observatoire-de-pennaras', 48.33, -4.3, 'observatory', 'Observation', 'node', 6739769293, 'osm:node/6739769293', 'leisure=bird_hide'),
      ('osm:node/10556615855', 'Observatoire ornithologique', 'observatoire-ornithologique-n48-0698-w2-0120', 48.07, -2.01, 'observatory', 'Observation', 'node', 10556615855, 'osm:node/10556615855', 'leisure=bird_hide'),
      ('osm:node/10556663392', 'Observatoire ornithologique', 'observatoire-ornithologique-n48-0751-w2-0137', 48.08, -2.01, 'observatory', 'Observation', 'node', 10556663392, 'osm:node/10556663392', 'leisure=bird_hide'),
      ('osm:node/4714905290', 'Observatoire ornithologique de la Musse', 'observatoire-ornithologique-de-la-musse', 48.51, -1.51, 'observatory', 'Observation', 'node', 4714905290, 'osm:node/4714905290', 'tourism=viewpoint'),
      ('osm:way/72268409', 'Phare de l''île de Batz', 'phare-de-l-ile-de-batz', 48.75, -4.03, 'lighthouse', 'Maritime', 'way', 72268409, 'osm:way/72268409', 'man_made=lighthouse'),
      ('osm:node/1370799982', 'Phare de la Teignouse', 'phare-de-la-teignouse', 47.46, -3.05, 'lighthouse', 'Maritime', 'node', 1370799982, 'osm:node/1370799982', 'man_made=lighthouse'),
      ('osm:node/1865624218', 'Phare de Pontusval', 'phare-de-pontusval', 48.68, -4.35, 'lighthouse', 'Maritime', 'node', 1865624218, 'osm:node/1865624218', 'man_made=lighthouse'),
      ('osm:node/2883454480', 'Phare des Grands Cardinaux', 'phare-des-grands-cardinaux', 47.32, -2.83, 'lighthouse', 'Maritime', 'node', 2883454480, 'osm:node/2883454480', 'man_made=lighthouse'),
      ('osm:node/5599719757', 'Château de la Grand''Ville', 'chateau-de-la-grand-ville', 48.58, -2.99, 'castle', 'Architecture', 'node', 5599719757, 'osm:node/5599719757', 'historic=castle'),
      ('osm:node/1920516166', 'Château de Mesléan', 'chateau-de-meslean', 48.44, -4.46, 'castle', 'Architecture', 'node', 1920516166, 'osm:node/1920516166', 'historic=castle'),
      ('osm:node/2580167031', 'Château de Trémohar', 'chateau-de-tremohar', 47.63, -2.57, 'castle', 'Architecture', 'node', 2580167031, 'osm:node/2580167031', 'historic=castle'),
      ('osm:node/5283040087', 'Lech de Pen-er-Pont', 'lech-de-pen-er-pont', 47.7, -3.13, 'monument', 'Architecture', 'node', 5283040087, 'osm:node/5283040087', 'historic=monument'),
      ('osm:node/4728503207', 'Abbaye Saint-Maurice', 'abbaye-saint-maurice', 47.8, -3.53, 'ruins', 'Architecture', 'node', 4728503207, 'osm:node/4728503207', 'historic=ruins'),
      ('osm:node/6227948399', 'Batterie Basse de Cornouaille', 'batterie-basse-de-cornouaille', 48.33, -4.57, 'ruins', 'Architecture', 'node', 6227948399, 'osm:node/6227948399', 'historic=ruins'),
      ('osm:node/5599719764', 'Château de Beaumont', 'chateau-de-beaumont', 48.3, -2.09, 'castle', 'Architecture', 'node', 5599719764, 'osm:node/5599719764', 'historic=castle'),
      ('osm:node/1258865133', 'Château de Coat-Trédrez', 'chateau-de-coat-tredrez', 48.71, -3.55, 'castle', 'Architecture', 'node', 1258865133, 'osm:node/1258865133', 'historic=castle'),
      ('osm:node/4938217715', 'Château de Lezergué', 'chateau-de-lezergue', 48.01, -4.02, 'castle', 'Architecture', 'node', 4938217715, 'osm:node/4938217715', 'historic=castle'),
      ('osm:node/4674932671', 'Château de Sourdéac', 'chateau-de-sourdeac', 47.73, -2.12, 'castle', 'Architecture', 'node', 4674932671, 'osm:node/4674932671', 'historic=castle'),
      ('osm:node/4567694428', 'Château de Talhouët', 'chateau-de-talhouet', 47.72, -2.37, 'castle', 'Architecture', 'node', 4567694428, 'osm:node/4567694428', 'historic=castle'),
      ('osm:node/4938217712', 'Château de Troménec', 'chateau-de-tromenec', 48.59, -4.56, 'castle', 'Architecture', 'node', 4938217712, 'osm:node/4938217712', 'historic=castle'),
      ('osm:node/4938217711', 'Château du Hénant', 'chateau-du-henant', 47.83, -3.76, 'castle', 'Architecture', 'node', 4938217711, 'osm:node/4938217711', 'historic=castle'),
      ('osm:node/2012913656', 'Fort du Minou', 'fort-du-minou', 48.34, -4.61, 'ruins', 'Architecture', 'node', 2012913656, 'osm:node/2012913656', 'historic=ruins'),
      ('osm:way/33779845', 'Phare d''Eckmühl', 'phare-d-eckmuhl', 47.8, -4.37, 'lighthouse', 'Maritime', 'way', 33779845, 'osm:way/33779845', 'man_made=lighthouse'),
      ('osm:way/232707096', 'Phare de Kermorvan', 'phare-de-kermorvan', 48.36, -4.79, 'lighthouse', 'Maritime', 'way', 232707096, 'osm:way/232707096', 'man_made=lighthouse'),
      ('osm:way/93512248', 'Phare de Langoz', 'phare-de-langoz', 47.83, -4.16, 'lighthouse', 'Maritime', 'way', 93512248, 'osm:way/93512248', 'man_made=lighthouse'),
      ('osm:way/81963847', 'Phare de Mean Ruz', 'phare-de-mean-ruz', 48.84, -3.48, 'lighthouse', 'Maritime', 'way', 81963847, 'osm:way/81963847', 'man_made=lighthouse'),
      ('osm:way/171076270', 'Phare de Port-Navalo', 'phare-de-port-navalo', 47.55, -2.92, 'lighthouse', 'Maritime', 'way', 171076270, 'osm:way/171076270', 'man_made=lighthouse'),
      ('osm:way/72072235', 'Phare de Roscoff', 'phare-de-roscoff', 48.72, -3.98, 'lighthouse', 'Maritime', 'way', 72072235, 'osm:way/72072235', 'man_made=lighthouse'),
      ('osm:way/40402853', 'Réserve Ornithologique Koh Kastel', 'reserve-ornithologique-koh-kastel', 47.37, -3.26, 'bird_reserve', 'Nature', 'way', 40402853, 'osm:way/40402853', 'boundary=protected_area'),
      ('osm:node/5599719758', 'Ruines du château de La Chèze', 'ruines-du-chateau-de-la-cheze', 48.13, -2.66, 'ruins', 'Architecture', 'node', 5599719758, 'osm:node/5599719758', 'historic=ruins'),
      ('osm:node/6110181120', 'Anciens Fours à chaux', 'anciens-fours-a-chaux', 48.04, -1.72, 'ruins', 'Architecture', 'node', 6110181120, 'osm:node/6110181120', 'historic=ruins'),
      ('osm:node/1675115889', 'Butte de César', 'butte-de-cesar', 47.54, -2.87, 'viewpoint', 'Relief', 'node', 1675115889, 'osm:node/1675115889', 'tourism=viewpoint'),
      ('osm:node/3001278312', 'Château de Boutavent', 'chateau-de-boutavent', 48.07, -2.05, 'castle', 'Architecture', 'node', 3001278312, 'osm:node/3001278312', 'historic=castle'),
      ('osm:node/5599719768', 'Château de Cargouët', 'chateau-de-cargouet', 48.45, -2.6, 'ruins', 'Architecture', 'node', 5599719768, 'osm:node/5599719768', 'historic=ruins'),
      ('osm:node/5599719778', 'Château de Coëtquen', 'chateau-de-coetquen', 48.47, -1.94, 'ruins', 'Architecture', 'node', 5599719778, 'osm:node/5599719778', 'historic=ruins'),
      ('osm:node/4893955029', 'Château de la Touche-à-la Vache', 'chateau-de-la-touche-a-la-vache', 48.52, -2.2, 'ruins', 'Architecture', 'node', 4893955029, 'osm:node/4893955029', 'historic=ruins'),
      ('osm:node/5599719766', 'Château de Perrien', 'chateau-de-perrien', 48.48, -3.02, 'ruins', 'Architecture', 'node', 5599719766, 'osm:node/5599719766', 'historic=ruins'),
      ('osm:node/5599719774', 'Château du Bois de la Salle', 'chateau-du-bois-de-la-salle', 48.62, -2.93, 'castle', 'Architecture', 'node', 5599719774, 'osm:node/5599719774', 'historic=castle'),
      ('osm:node/4309832845', 'Ensemble fortifié de La Ferrière', 'ensemble-fortifie-de-la-ferriere', 47.32, -3.11, 'fortification', 'Architecture', 'node', 4309832845, 'osm:node/4309832845', 'historic=fort'),
      ('osm:node/430910388', 'Fort du Cabellou', 'fort-du-cabellou', 47.86, -3.92, 'fortification', 'Architecture', 'node', 430910388, 'osm:node/430910388', 'historic=fort'),
      ('osm:way/147054705', 'La Citadelle', 'la-citadelle', 47.35, -3.15, 'fortification', 'Architecture', 'way', 147054705, 'osm:way/147054705', 'historic=fort'),
      ('osm:node/3761248071', 'observatoire', 'observatoire-n48-1988-w1-5808', 48.2, -1.58, 'observatory', 'Observation', 'node', 3761248071, 'osm:node/3761248071', 'leisure=bird_hide'),
      ('osm:node/4938382192', 'Observatoire', 'observatoire-n48-2460-w3-3935', 48.25, -3.39, 'observatory', 'Observation', 'node', 4938382192, 'osm:node/4938382192', 'leisure=bird_hide'),
      ('osm:node/4507117298', 'Observatoire aquatique', 'observatoire-aquatique', 48.2, -4.09, 'observatory', 'Observation', 'node', 4507117298, 'osm:node/4507117298', 'unknown'),
      ('osm:way/359597183', 'Observatoire astronomique de la pointe du Diable', 'observatoire-astronomique-de-la-pointe-du-diable', 48.36, -4.57, 'observatory', 'Observation', 'way', 359597183, 'osm:way/359597183', 'unknown'),
      ('osm:node/14062411951', 'Observatoire de l''Astro-Club Alnitak', 'observatoire-de-l-astro-club-alnitak', 48.44, -4.15, 'observatory', 'Observation', 'node', 14062411951, 'osm:node/14062411951', 'man_made=observatory'),
      ('osm:way/184001154', 'Observatoire faune', 'observatoire-faune', 47.8, -4.27, 'observatory', 'Observation', 'way', 184001154, 'osm:way/184001154', 'unknown'),
      ('osm:way/173491752', 'Observatoire n°1', 'observatoire-n-1-n47-6138-w2-7166', 47.61, -2.72, 'observatory', 'Observation', 'way', 173491752, 'osm:way/173491752', 'leisure=bird_hide'),
      ('osm:way/125425427', 'Observatoire n°3', 'observatoire-n-3', 47.62, -2.72, 'observatory', 'Observation', 'way', 125425427, 'osm:way/125425427', 'leisure=bird_hide'),
      ('osm:way/299846400', 'Observatoire nº 1', 'observatoire-n-1-n47-5411-w2-7344', 47.54, -2.73, 'observatory', 'Observation', 'way', 299846400, 'osm:way/299846400', 'tourism=viewpoint'),
      ('osm:way/299846399', 'Observatoire nº 2', 'observatoire-n-2', 47.54, -2.74, 'observatory', 'Observation', 'way', 299846399, 'osm:way/299846399', 'tourism=viewpoint'),
      ('osm:way/265721290', 'Observatoire ornithologique', 'observatoire-ornithologique-n48-7816-w3-5771', 48.78, -3.58, 'observatory', 'Observation', 'way', 265721290, 'osm:way/265721290', 'tower:type=observation'),
      ('osm:way/54974026', 'Phare de la Balue', 'phare-de-la-balue', 48.63, -2, 'lighthouse', 'Maritime', 'way', 54974026, 'osm:way/54974026', 'man_made=lighthouse'),
      ('osm:way/118445466', 'Phare de La Croix', 'phare-de-la-croix-n47-8693-w3-9181', 47.87, -3.92, 'lighthouse', 'Maritime', 'way', 118445466, 'osm:way/118445466', 'man_made=lighthouse'),
      ('osm:way/26809265', 'Réserve ornithologique du Verdelet', 'reserve-ornithologique-du-verdelet', 48.6, -2.56, 'bird_reserve', 'Nature', 'way', 26809265, 'osm:way/26809265', 'leisure=nature_reserve'),
      ('osm:node/2293790132', 'Restes du château', 'restes-du-chateau', 48.32, -3.06, 'ruins', 'Architecture', 'node', 2293790132, 'osm:node/2293790132', 'historic=ruins'),
      ('osm:node/4938073668', 'Ruines de la chapelle de Lochrist et calvaire', 'ruines-de-la-chapelle-de-lochrist-et-calvaire', 48.07, -3.88, 'ruins', 'Architecture', 'node', 4938073668, 'osm:node/4938073668', 'historic=ruins'),
      ('osm:node/5599719759', 'Vestiges de l''ancien château de Crénan', 'vestiges-de-l-ancien-chateau-de-crenan', 48.42, -2.89, 'ruins', 'Architecture', 'node', 5599719759, 'osm:node/5599719759', 'historic=ruins'),
      ('osm:way/320177779', 'Viaduc de Port-Nieux', 'viaduc-de-port-nieux', 48.63, -2.33, 'bridge', 'Architecture', 'way', 320177779, 'osm:way/320177779', 'bridge=viaduct'),
      ('osm:node/1686968468', 'Village déserté fortifié de Goarem-ar-Manec''h', 'village-deserte-fortifie-de-goarem-ar-manec-h', 48.4, -3.83, 'ruins', 'Architecture', 'node', 1686968468, 'osm:node/1686968468', 'historic=ruins')
  ) AS v(
    place_key,
    name,
    slug,
    latitude,
    longitude,
    photo_atlas_type,
    photo_atlas_family,
    osm_type,
    osm_id,
    source_external_id,
    source_type
  )
),
typed_spots AS (
  SELECT
    e.*,
    st.id AS spot_type_id
  FROM editorial_spots AS e
  LEFT JOIN public.spot_types AS st
    ON st.slug = e.photo_atlas_type
),
  precheck AS (
    SELECT
      (SELECT count(*) FROM typed_spots) AS row_count,
      (SELECT count(DISTINCT place_key) FROM typed_spots) AS unique_place_key_count,
      (SELECT count(DISTINCT slug) FROM typed_spots) AS unique_slug_count,
      (SELECT count(DISTINCT source_external_id) FROM typed_spots) AS unique_source_external_id_count,
      (SELECT count(DISTINCT format('%s/%s', osm_type, osm_id)) FROM typed_spots) AS unique_osm_count,
      (SELECT count(*) FROM typed_spots WHERE spot_type_id IS NULL) AS missing_type_count,
      (SELECT count(*)
       FROM typed_spots AS t
       JOIN public.spots AS s
         ON s.source = 'osm'
        AND s.source_external_id = t.normalized_source_external_id) AS existing_source_external_id_count,
      (SELECT count(*)
       FROM typed_spots AS t
       JOIN public.spots AS s
         ON s.slug = t.slug) AS existing_slug_count
  )
  SELECT
    row_count,
    unique_place_key_count,
    unique_slug_count,
    unique_source_external_id_count,
    unique_osm_count,
    missing_type_count,
    existing_source_external_id_count,
    existing_slug_count
  INTO
    v_row_count,
    v_unique_place_key_count,
    v_unique_slug_count,
    v_unique_source_external_id_count,
    v_unique_osm_count,
    v_missing_type_count,
    v_existing_source_external_id_count,
    v_existing_slug_count
  FROM precheck;

  IF v_row_count <> v_expected_count THEN
    RAISE EXCEPTION 'bretagne import aborted: expected % catalogue rows, got %', v_expected_count, v_row_count;
  END IF;

  IF v_unique_place_key_count <> v_expected_count THEN
    RAISE EXCEPTION 'bretagne import aborted: place_key uniqueness failed (%/%).', v_unique_place_key_count, v_expected_count;
  END IF;

  IF v_unique_slug_count <> v_expected_count THEN
    RAISE EXCEPTION 'bretagne import aborted: slug uniqueness failed (%/%).', v_unique_slug_count, v_expected_count;
  END IF;

  IF v_unique_source_external_id_count <> v_expected_count THEN
    RAISE EXCEPTION 'bretagne import aborted: source_external_id uniqueness failed (%/%).', v_unique_source_external_id_count, v_expected_count;
  END IF;

  IF v_unique_osm_count <> v_expected_count THEN
    RAISE EXCEPTION 'bretagne import aborted: osm identity uniqueness failed (%/%).', v_unique_osm_count, v_expected_count;
  END IF;

  IF v_missing_type_count <> 0 THEN
    RAISE EXCEPTION 'bretagne import aborted: % spot types missing in public.spot_types.', v_missing_type_count;
  END IF;

  IF v_existing_source_external_id_count <> 0 THEN
    RAISE EXCEPTION 'bretagne import aborted: % source_external_id values already exist in public.spots.', v_existing_source_external_id_count;
  END IF;

  IF v_existing_slug_count <> 0 THEN
    RAISE EXCEPTION 'bretagne import aborted: % slugs already exist in public.spots.', v_existing_slug_count;
  END IF;

  WITH editorial_spots AS (
  SELECT
    place_key,
    name,
    slug,
    latitude::double precision AS latitude,
    longitude::double precision AS longitude,
    photo_atlas_type,
    photo_atlas_family,
    osm_type,
    osm_id::bigint AS osm_id,
    source_external_id,
    regexp_replace(source_external_id, '^osm:', '') AS normalized_source_external_id,
    source_type
  FROM (
    VALUES
      ('osm:node/117081598', 'Phare de la Jument', 'phare-de-la-jument', 48.42, -5.13, 'lighthouse', 'Maritime', 'node', 117081598, 'osm:node/117081598', 'man_made=lighthouse'),
      ('osm:node/255359392', 'Phare de Pen-Men', 'phare-de-pen-men', 47.65, -3.51, 'lighthouse', 'Maritime', 'node', 255359392, 'osm:node/255359392', 'man_made=lighthouse'),
      ('osm:node/1378041353', 'Phare des Roches-Douvres', 'phare-des-roches-douvres', 49.11, -2.81, 'lighthouse', 'Maritime', 'node', 1378041353, 'osm:node/1378041353', 'man_made=lighthouse'),
      ('osm:node/1269267113', 'Phare du Four', 'phare-du-four', 48.52, -4.81, 'lighthouse', 'Maritime', 'node', 1269267113, 'osm:node/1269267113', 'man_made=lighthouse'),
      ('osm:node/1370801434', 'Phare du Petit Minou', 'phare-du-petit-minou', 48.34, -4.61, 'lighthouse', 'Maritime', 'node', 1370801434, 'osm:node/1370801434', 'man_made=lighthouse'),
      ('osm:node/6793206641', 'Phare des Sept-Îles', 'phare-des-sept-iles', 48.88, -3.49, 'lighthouse', 'Maritime', 'node', 6793206641, 'osm:node/6793206641', 'man_made=lighthouse'),
      ('osm:node/1543882146', 'Phare de la Croix', 'phare-de-la-croix-le-trieux', 48.84, -3.05, 'lighthouse', 'Maritime', 'node', 1543882146, 'osm:node/1543882146', 'man_made=lighthouse'),
      ('osm:node/1269200222', 'Phare de Tévennec', 'phare-de-tevennec', 48.07, -4.8, 'lighthouse', 'Maritime', 'node', 1269200222, 'osm:node/1269200222', 'man_made=lighthouse'),
      ('osm:node/1370801507', 'Phare de Trézien', 'phare-de-trezien', 48.42, -4.78, 'lighthouse', 'Maritime', 'node', 1370801507, 'osm:node/1370801507', 'man_made=lighthouse'),
      ('osm:node/1395067584', 'Phare des Moutons', 'phare-des-moutons', 47.77, -4.03, 'lighthouse', 'Maritime', 'node', 1395067584, 'osm:node/1395067584', 'man_made=lighthouse'),
      ('osm:node/1370801478', 'Phare des Pierres-Noires', 'phare-des-pierres-noires', 48.31, -4.91, 'lighthouse', 'Maritime', 'node', 1370801478, 'osm:node/1370801478', 'man_made=lighthouse'),
      ('osm:node/13138447296', 'Phare du Créac''h', 'phare-du-creac-h', 48.46, -5.13, 'lighthouse', 'Maritime', 'node', 13138447296, 'osm:node/13138447296', 'man_made=lighthouse'),
      ('osm:way/94677643', 'Phare du Grand-Jardin', 'phare-du-grand-jardin', 48.67, -2.08, 'lighthouse', 'Maritime', 'way', 94677643, 'osm:way/94677643', 'man_made=lighthouse'),
      ('osm:node/535700544', 'Phare du Millier', 'phare-du-millier', 48.1, -4.47, 'lighthouse', 'Maritime', 'node', 535700544, 'osm:node/535700544', 'man_made=lighthouse'),
      ('osm:node/1370801418', 'Phare du Portzic', 'phare-du-portzic', 48.36, -4.53, 'lighthouse', 'Maritime', 'node', 1370801418, 'osm:node/1370801418', 'man_made=lighthouse'),
      ('osm:node/2715566908', 'Phare du Rosédo', 'phare-du-rosedo', 48.86, -3, 'lighthouse', 'Maritime', 'node', 2715566908, 'osm:node/2715566908', 'man_made=lighthouse'),
      ('osm:way/1429681256', 'Château de Fougères', 'chateau-de-fougeres', 48.35, -1.21, 'castle', 'Architecture', 'way', 1429681256, 'osm:way/1429681256', 'historic=castle'),
      ('osm:node/7786979338', 'Observatoire du marais de Séné', 'observatoire-du-marais-de-sene', 47.62, -2.71, 'observatory', 'Observation', 'node', 7786979338, 'osm:node/7786979338', 'tourism=viewpoint'),
      ('osm:node/4938217707', 'Château de Rustéphan', 'chateau-de-rustephan', 47.86, -3.77, 'ruins', 'Architecture', 'node', 4938217707, 'osm:node/4938217707', 'historic=ruins'),
      ('osm:way/627188299', 'Phare de Kéréon', 'phare-de-kereon', 48.44, -5.03, 'lighthouse', 'Maritime', 'way', 627188299, 'osm:way/627188299', 'man_made=lighthouse'),
      ('osm:node/602214530', 'Phare de Kergadec', 'phare-de-kergadec', 48.02, -4.55, 'lighthouse', 'Maritime', 'node', 602214530, 'osm:node/602214530', 'man_made=lighthouse'),
      ('osm:node/1269226414', 'Phare de l''Aber Ildut', 'phare-de-l-aber-ildut', 48.47, -4.76, 'lighthouse', 'Maritime', 'node', 1269226414, 'osm:node/1269226414', 'man_made=lighthouse'),
      ('osm:way/364993683', 'Phare de l''île de Sein', 'phare-de-l-ile-de-sein', 48.04, -4.87, 'lighthouse', 'Maritime', 'way', 364993683, 'osm:way/364993683', 'man_made=lighthouse'),
      ('osm:way/93055283', 'Phare de l''Île Vierge', 'phare-de-l-ile-vierge', 48.64, -4.57, 'lighthouse', 'Maritime', 'way', 93055283, 'osm:way/93055283', 'man_made=lighthouse'),
      ('osm:way/737263555', 'Phare de la Vieille', 'phare-de-la-vieille', 48.04, -4.76, 'lighthouse', 'Maritime', 'way', 737263555, 'osm:way/737263555', 'man_made=lighthouse'),
      ('osm:node/1269394756', 'Phare du Toulinguet', 'phare-du-toulinguet', 48.28, -4.63, 'lighthouse', 'Maritime', 'node', 1269394756, 'osm:node/1269394756', 'man_made=lighthouse'),
      ('osm:node/5907022932', 'Phare et fort de Penfret', 'phare-et-fort-de-penfret', 47.72, -3.95, 'lighthouse', 'Maritime', 'node', 5907022932, 'osm:node/5907022932', 'man_made=lighthouse'),
      ('osm:node/3034504597', 'Fort Cigogne', 'fort-cigogne', 47.72, -3.99, 'fortification', 'Architecture', 'node', 3034504597, 'osm:node/3034504597', 'historic=fort'),
      ('osm:way/63697430', 'Phare de Goulphar', 'phare-de-goulphar', 47.31, -3.23, 'lighthouse', 'Maritime', 'way', 63697430, 'osm:way/63697430', 'man_made=lighthouse'),
      ('osm:way/232642575', 'Phare de Lanvaon', 'phare-de-lanvaon', 48.61, -4.54, 'lighthouse', 'Maritime', 'way', 232642575, 'osm:way/232642575', 'man_made=lighthouse'),
      ('osm:way/135722236', 'Phare du Cap Fréhel', 'phare-du-cap-frehel', 48.68, -2.32, 'lighthouse', 'Maritime', 'way', 135722236, 'osm:way/135722236', 'man_made=lighthouse'),
      ('osm:node/4968595050', 'Château de Fontenay', 'chateau-de-fontenay', 48.05, -1.7, 'castle', 'Architecture', 'node', 4968595050, 'osm:node/4968595050', 'historic=castle'),
      ('osm:node/3029844736', 'Château de Kéralio', 'chateau-de-keralio', 48.82, -3.25, 'castle', 'Architecture', 'node', 3029844736, 'osm:node/3029844736', 'historic=castle'),
      ('osm:node/4990866348', 'Château de la Sécardais', 'chateau-de-la-secardais', 48.3, -1.46, 'castle', 'Architecture', 'node', 4990866348, 'osm:node/4990866348', 'historic=castle'),
      ('osm:node/4990866347', 'Château de Lupin', 'chateau-de-lupin', 48.68, -1.94, 'castle', 'Architecture', 'node', 4990866347, 'osm:node/4990866347', 'historic=castle'),
      ('osm:node/4674932670', 'Château du Bot', 'chateau-du-bot', 47.81, -3.3, 'castle', 'Architecture', 'node', 4674932670, 'osm:node/4674932670', 'historic=castle'),
      ('osm:node/4354560524', 'Fort de Taillefer', 'fort-de-taillefer', 47.36, -3.16, 'fortification', 'Architecture', 'node', 4354560524, 'osm:node/4354560524', 'historic=fort'),
      ('osm:way/37106950', 'Le Vieux Pont Suspendu', 'le-vieux-pont-suspendu', 47.64, -2.95, 'monument', 'Architecture', 'way', 37106950, 'osm:way/37106950', 'historic=monument'),
      ('osm:node/4715006920', 'Observatoire', 'observatoire-n48-5193-w1-5153', 48.52, -1.52, 'observatory', 'Observation', 'node', 4715006920, 'osm:node/4715006920', 'tourism=viewpoint'),
      ('osm:node/5590864486', 'Observatoire', 'observatoire-n47-7609-w3-3239', 47.76, -3.32, 'observatory', 'Observation', 'node', 5590864486, 'osm:node/5590864486', 'leisure=bird_hide'),
      ('osm:node/6022818160', 'Observatoire', 'observatoire-n47-7686-w3-5019', 47.77, -3.5, 'observatory', 'Observation', 'node', 6022818160, 'osm:node/6022818160', 'leisure=bird_hide'),
      ('osm:node/11897628369', 'Observatoire de Kersanton', 'observatoire-de-kersanton', 48.35, -4.3, 'observatory', 'Observation', 'node', 11897628369, 'osm:node/11897628369', 'leisure=bird_hide'),
      ('osm:node/14080691020', 'Observatoire de l''étang du Hézo', 'observatoire-de-l-etang-du-hezo', 47.58, -2.7, 'observatory', 'Observation', 'node', 14080691020, 'osm:node/14080691020', 'leisure=bird_hide'),
      ('osm:node/11897628406', 'Observatoire de Lanveur', 'observatoire-de-lanveur', 48.36, -4.3, 'observatory', 'Observation', 'node', 11897628406, 'osm:node/11897628406', 'leisure=bird_hide'),
      ('osm:node/10299619646', 'Observatoire de Penfoul', 'observatoire-de-penfoul', 48.33, -4.31, 'observatory', 'Observation', 'node', 10299619646, 'osm:node/10299619646', 'leisure=bird_hide'),
      ('osm:node/6739769293', 'Observatoire de Pennaras', 'observatoire-de-pennaras', 48.33, -4.3, 'observatory', 'Observation', 'node', 6739769293, 'osm:node/6739769293', 'leisure=bird_hide'),
      ('osm:node/10556615855', 'Observatoire ornithologique', 'observatoire-ornithologique-n48-0698-w2-0120', 48.07, -2.01, 'observatory', 'Observation', 'node', 10556615855, 'osm:node/10556615855', 'leisure=bird_hide'),
      ('osm:node/10556663392', 'Observatoire ornithologique', 'observatoire-ornithologique-n48-0751-w2-0137', 48.08, -2.01, 'observatory', 'Observation', 'node', 10556663392, 'osm:node/10556663392', 'leisure=bird_hide'),
      ('osm:node/4714905290', 'Observatoire ornithologique de la Musse', 'observatoire-ornithologique-de-la-musse', 48.51, -1.51, 'observatory', 'Observation', 'node', 4714905290, 'osm:node/4714905290', 'tourism=viewpoint'),
      ('osm:way/72268409', 'Phare de l''île de Batz', 'phare-de-l-ile-de-batz', 48.75, -4.03, 'lighthouse', 'Maritime', 'way', 72268409, 'osm:way/72268409', 'man_made=lighthouse'),
      ('osm:node/1370799982', 'Phare de la Teignouse', 'phare-de-la-teignouse', 47.46, -3.05, 'lighthouse', 'Maritime', 'node', 1370799982, 'osm:node/1370799982', 'man_made=lighthouse'),
      ('osm:node/1865624218', 'Phare de Pontusval', 'phare-de-pontusval', 48.68, -4.35, 'lighthouse', 'Maritime', 'node', 1865624218, 'osm:node/1865624218', 'man_made=lighthouse'),
      ('osm:node/2883454480', 'Phare des Grands Cardinaux', 'phare-des-grands-cardinaux', 47.32, -2.83, 'lighthouse', 'Maritime', 'node', 2883454480, 'osm:node/2883454480', 'man_made=lighthouse'),
      ('osm:node/5599719757', 'Château de la Grand''Ville', 'chateau-de-la-grand-ville', 48.58, -2.99, 'castle', 'Architecture', 'node', 5599719757, 'osm:node/5599719757', 'historic=castle'),
      ('osm:node/1920516166', 'Château de Mesléan', 'chateau-de-meslean', 48.44, -4.46, 'castle', 'Architecture', 'node', 1920516166, 'osm:node/1920516166', 'historic=castle'),
      ('osm:node/2580167031', 'Château de Trémohar', 'chateau-de-tremohar', 47.63, -2.57, 'castle', 'Architecture', 'node', 2580167031, 'osm:node/2580167031', 'historic=castle'),
      ('osm:node/5283040087', 'Lech de Pen-er-Pont', 'lech-de-pen-er-pont', 47.7, -3.13, 'monument', 'Architecture', 'node', 5283040087, 'osm:node/5283040087', 'historic=monument'),
      ('osm:node/4728503207', 'Abbaye Saint-Maurice', 'abbaye-saint-maurice', 47.8, -3.53, 'ruins', 'Architecture', 'node', 4728503207, 'osm:node/4728503207', 'historic=ruins'),
      ('osm:node/6227948399', 'Batterie Basse de Cornouaille', 'batterie-basse-de-cornouaille', 48.33, -4.57, 'ruins', 'Architecture', 'node', 6227948399, 'osm:node/6227948399', 'historic=ruins'),
      ('osm:node/5599719764', 'Château de Beaumont', 'chateau-de-beaumont', 48.3, -2.09, 'castle', 'Architecture', 'node', 5599719764, 'osm:node/5599719764', 'historic=castle'),
      ('osm:node/1258865133', 'Château de Coat-Trédrez', 'chateau-de-coat-tredrez', 48.71, -3.55, 'castle', 'Architecture', 'node', 1258865133, 'osm:node/1258865133', 'historic=castle'),
      ('osm:node/4938217715', 'Château de Lezergué', 'chateau-de-lezergue', 48.01, -4.02, 'castle', 'Architecture', 'node', 4938217715, 'osm:node/4938217715', 'historic=castle'),
      ('osm:node/4674932671', 'Château de Sourdéac', 'chateau-de-sourdeac', 47.73, -2.12, 'castle', 'Architecture', 'node', 4674932671, 'osm:node/4674932671', 'historic=castle'),
      ('osm:node/4567694428', 'Château de Talhouët', 'chateau-de-talhouet', 47.72, -2.37, 'castle', 'Architecture', 'node', 4567694428, 'osm:node/4567694428', 'historic=castle'),
      ('osm:node/4938217712', 'Château de Troménec', 'chateau-de-tromenec', 48.59, -4.56, 'castle', 'Architecture', 'node', 4938217712, 'osm:node/4938217712', 'historic=castle'),
      ('osm:node/4938217711', 'Château du Hénant', 'chateau-du-henant', 47.83, -3.76, 'castle', 'Architecture', 'node', 4938217711, 'osm:node/4938217711', 'historic=castle'),
      ('osm:node/2012913656', 'Fort du Minou', 'fort-du-minou', 48.34, -4.61, 'ruins', 'Architecture', 'node', 2012913656, 'osm:node/2012913656', 'historic=ruins'),
      ('osm:way/33779845', 'Phare d''Eckmühl', 'phare-d-eckmuhl', 47.8, -4.37, 'lighthouse', 'Maritime', 'way', 33779845, 'osm:way/33779845', 'man_made=lighthouse'),
      ('osm:way/232707096', 'Phare de Kermorvan', 'phare-de-kermorvan', 48.36, -4.79, 'lighthouse', 'Maritime', 'way', 232707096, 'osm:way/232707096', 'man_made=lighthouse'),
      ('osm:way/93512248', 'Phare de Langoz', 'phare-de-langoz', 47.83, -4.16, 'lighthouse', 'Maritime', 'way', 93512248, 'osm:way/93512248', 'man_made=lighthouse'),
      ('osm:way/81963847', 'Phare de Mean Ruz', 'phare-de-mean-ruz', 48.84, -3.48, 'lighthouse', 'Maritime', 'way', 81963847, 'osm:way/81963847', 'man_made=lighthouse'),
      ('osm:way/171076270', 'Phare de Port-Navalo', 'phare-de-port-navalo', 47.55, -2.92, 'lighthouse', 'Maritime', 'way', 171076270, 'osm:way/171076270', 'man_made=lighthouse'),
      ('osm:way/72072235', 'Phare de Roscoff', 'phare-de-roscoff', 48.72, -3.98, 'lighthouse', 'Maritime', 'way', 72072235, 'osm:way/72072235', 'man_made=lighthouse'),
      ('osm:way/40402853', 'Réserve Ornithologique Koh Kastel', 'reserve-ornithologique-koh-kastel', 47.37, -3.26, 'bird_reserve', 'Nature', 'way', 40402853, 'osm:way/40402853', 'boundary=protected_area'),
      ('osm:node/5599719758', 'Ruines du château de La Chèze', 'ruines-du-chateau-de-la-cheze', 48.13, -2.66, 'ruins', 'Architecture', 'node', 5599719758, 'osm:node/5599719758', 'historic=ruins'),
      ('osm:node/6110181120', 'Anciens Fours à chaux', 'anciens-fours-a-chaux', 48.04, -1.72, 'ruins', 'Architecture', 'node', 6110181120, 'osm:node/6110181120', 'historic=ruins'),
      ('osm:node/1675115889', 'Butte de César', 'butte-de-cesar', 47.54, -2.87, 'viewpoint', 'Relief', 'node', 1675115889, 'osm:node/1675115889', 'tourism=viewpoint'),
      ('osm:node/3001278312', 'Château de Boutavent', 'chateau-de-boutavent', 48.07, -2.05, 'castle', 'Architecture', 'node', 3001278312, 'osm:node/3001278312', 'historic=castle'),
      ('osm:node/5599719768', 'Château de Cargouët', 'chateau-de-cargouet', 48.45, -2.6, 'ruins', 'Architecture', 'node', 5599719768, 'osm:node/5599719768', 'historic=ruins'),
      ('osm:node/5599719778', 'Château de Coëtquen', 'chateau-de-coetquen', 48.47, -1.94, 'ruins', 'Architecture', 'node', 5599719778, 'osm:node/5599719778', 'historic=ruins'),
      ('osm:node/4893955029', 'Château de la Touche-à-la Vache', 'chateau-de-la-touche-a-la-vache', 48.52, -2.2, 'ruins', 'Architecture', 'node', 4893955029, 'osm:node/4893955029', 'historic=ruins'),
      ('osm:node/5599719766', 'Château de Perrien', 'chateau-de-perrien', 48.48, -3.02, 'ruins', 'Architecture', 'node', 5599719766, 'osm:node/5599719766', 'historic=ruins'),
      ('osm:node/5599719774', 'Château du Bois de la Salle', 'chateau-du-bois-de-la-salle', 48.62, -2.93, 'castle', 'Architecture', 'node', 5599719774, 'osm:node/5599719774', 'historic=castle'),
      ('osm:node/4309832845', 'Ensemble fortifié de La Ferrière', 'ensemble-fortifie-de-la-ferriere', 47.32, -3.11, 'fortification', 'Architecture', 'node', 4309832845, 'osm:node/4309832845', 'historic=fort'),
      ('osm:node/430910388', 'Fort du Cabellou', 'fort-du-cabellou', 47.86, -3.92, 'fortification', 'Architecture', 'node', 430910388, 'osm:node/430910388', 'historic=fort'),
      ('osm:way/147054705', 'La Citadelle', 'la-citadelle', 47.35, -3.15, 'fortification', 'Architecture', 'way', 147054705, 'osm:way/147054705', 'historic=fort'),
      ('osm:node/3761248071', 'observatoire', 'observatoire-n48-1988-w1-5808', 48.2, -1.58, 'observatory', 'Observation', 'node', 3761248071, 'osm:node/3761248071', 'leisure=bird_hide'),
      ('osm:node/4938382192', 'Observatoire', 'observatoire-n48-2460-w3-3935', 48.25, -3.39, 'observatory', 'Observation', 'node', 4938382192, 'osm:node/4938382192', 'leisure=bird_hide'),
      ('osm:node/4507117298', 'Observatoire aquatique', 'observatoire-aquatique', 48.2, -4.09, 'observatory', 'Observation', 'node', 4507117298, 'osm:node/4507117298', 'unknown'),
      ('osm:way/359597183', 'Observatoire astronomique de la pointe du Diable', 'observatoire-astronomique-de-la-pointe-du-diable', 48.36, -4.57, 'observatory', 'Observation', 'way', 359597183, 'osm:way/359597183', 'unknown'),
      ('osm:node/14062411951', 'Observatoire de l''Astro-Club Alnitak', 'observatoire-de-l-astro-club-alnitak', 48.44, -4.15, 'observatory', 'Observation', 'node', 14062411951, 'osm:node/14062411951', 'man_made=observatory'),
      ('osm:way/184001154', 'Observatoire faune', 'observatoire-faune', 47.8, -4.27, 'observatory', 'Observation', 'way', 184001154, 'osm:way/184001154', 'unknown'),
      ('osm:way/173491752', 'Observatoire n°1', 'observatoire-n-1-n47-6138-w2-7166', 47.61, -2.72, 'observatory', 'Observation', 'way', 173491752, 'osm:way/173491752', 'leisure=bird_hide'),
      ('osm:way/125425427', 'Observatoire n°3', 'observatoire-n-3', 47.62, -2.72, 'observatory', 'Observation', 'way', 125425427, 'osm:way/125425427', 'leisure=bird_hide'),
      ('osm:way/299846400', 'Observatoire nº 1', 'observatoire-n-1-n47-5411-w2-7344', 47.54, -2.73, 'observatory', 'Observation', 'way', 299846400, 'osm:way/299846400', 'tourism=viewpoint'),
      ('osm:way/299846399', 'Observatoire nº 2', 'observatoire-n-2', 47.54, -2.74, 'observatory', 'Observation', 'way', 299846399, 'osm:way/299846399', 'tourism=viewpoint'),
      ('osm:way/265721290', 'Observatoire ornithologique', 'observatoire-ornithologique-n48-7816-w3-5771', 48.78, -3.58, 'observatory', 'Observation', 'way', 265721290, 'osm:way/265721290', 'tower:type=observation'),
      ('osm:way/54974026', 'Phare de la Balue', 'phare-de-la-balue', 48.63, -2, 'lighthouse', 'Maritime', 'way', 54974026, 'osm:way/54974026', 'man_made=lighthouse'),
      ('osm:way/118445466', 'Phare de La Croix', 'phare-de-la-croix-n47-8693-w3-9181', 47.87, -3.92, 'lighthouse', 'Maritime', 'way', 118445466, 'osm:way/118445466', 'man_made=lighthouse'),
      ('osm:way/26809265', 'Réserve ornithologique du Verdelet', 'reserve-ornithologique-du-verdelet', 48.6, -2.56, 'bird_reserve', 'Nature', 'way', 26809265, 'osm:way/26809265', 'leisure=nature_reserve'),
      ('osm:node/2293790132', 'Restes du château', 'restes-du-chateau', 48.32, -3.06, 'ruins', 'Architecture', 'node', 2293790132, 'osm:node/2293790132', 'historic=ruins'),
      ('osm:node/4938073668', 'Ruines de la chapelle de Lochrist et calvaire', 'ruines-de-la-chapelle-de-lochrist-et-calvaire', 48.07, -3.88, 'ruins', 'Architecture', 'node', 4938073668, 'osm:node/4938073668', 'historic=ruins'),
      ('osm:node/5599719759', 'Vestiges de l''ancien château de Crénan', 'vestiges-de-l-ancien-chateau-de-crenan', 48.42, -2.89, 'ruins', 'Architecture', 'node', 5599719759, 'osm:node/5599719759', 'historic=ruins'),
      ('osm:way/320177779', 'Viaduc de Port-Nieux', 'viaduc-de-port-nieux', 48.63, -2.33, 'bridge', 'Architecture', 'way', 320177779, 'osm:way/320177779', 'bridge=viaduct'),
      ('osm:node/1686968468', 'Village déserté fortifié de Goarem-ar-Manec''h', 'village-deserte-fortifie-de-goarem-ar-manec-h', 48.4, -3.83, 'ruins', 'Architecture', 'node', 1686968468, 'osm:node/1686968468', 'historic=ruins')
  ) AS v(
    place_key,
    name,
    slug,
    latitude,
    longitude,
    photo_atlas_type,
    photo_atlas_family,
    osm_type,
    osm_id,
    source_external_id,
    source_type
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
    status,
    spot_type_id
  )
  SELECT
    t.name,
    t.slug,
    ST_SetSRID(ST_MakePoint(t.longitude, t.latitude), 4326)::geography,
    'FR',
    'Bretagne',
    t.photo_atlas_type,
    'osm',
    regexp_replace(t.source_external_id, '^osm:', ''),
    t.source_type,
    'candidate',
    t.spot_type_id
  FROM typed_spots AS t;

  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;

  IF v_inserted_count <> v_expected_count THEN
    RAISE EXCEPTION 'bretagne import aborted: expected % inserted rows, got %.', v_expected_count, v_inserted_count;
  END IF;

  -- Les contrôles post-import sont exécutés dans des statements séparés du statement INSERT
  -- afin de lire les lignes réellement insérées dans le même bloc transactionnel.
  WITH editorial_spots AS (
  SELECT
    place_key,
    name,
    slug,
    latitude::double precision AS latitude,
    longitude::double precision AS longitude,
    photo_atlas_type,
    photo_atlas_family,
    osm_type,
    osm_id::bigint AS osm_id,
    source_external_id,
    regexp_replace(source_external_id, '^osm:', '') AS normalized_source_external_id,
    source_type
  FROM (
    VALUES
      ('osm:node/117081598', 'Phare de la Jument', 'phare-de-la-jument', 48.42, -5.13, 'lighthouse', 'Maritime', 'node', 117081598, 'osm:node/117081598', 'man_made=lighthouse'),
      ('osm:node/255359392', 'Phare de Pen-Men', 'phare-de-pen-men', 47.65, -3.51, 'lighthouse', 'Maritime', 'node', 255359392, 'osm:node/255359392', 'man_made=lighthouse'),
      ('osm:node/1378041353', 'Phare des Roches-Douvres', 'phare-des-roches-douvres', 49.11, -2.81, 'lighthouse', 'Maritime', 'node', 1378041353, 'osm:node/1378041353', 'man_made=lighthouse'),
      ('osm:node/1269267113', 'Phare du Four', 'phare-du-four', 48.52, -4.81, 'lighthouse', 'Maritime', 'node', 1269267113, 'osm:node/1269267113', 'man_made=lighthouse'),
      ('osm:node/1370801434', 'Phare du Petit Minou', 'phare-du-petit-minou', 48.34, -4.61, 'lighthouse', 'Maritime', 'node', 1370801434, 'osm:node/1370801434', 'man_made=lighthouse'),
      ('osm:node/6793206641', 'Phare des Sept-Îles', 'phare-des-sept-iles', 48.88, -3.49, 'lighthouse', 'Maritime', 'node', 6793206641, 'osm:node/6793206641', 'man_made=lighthouse'),
      ('osm:node/1543882146', 'Phare de la Croix', 'phare-de-la-croix-le-trieux', 48.84, -3.05, 'lighthouse', 'Maritime', 'node', 1543882146, 'osm:node/1543882146', 'man_made=lighthouse'),
      ('osm:node/1269200222', 'Phare de Tévennec', 'phare-de-tevennec', 48.07, -4.8, 'lighthouse', 'Maritime', 'node', 1269200222, 'osm:node/1269200222', 'man_made=lighthouse'),
      ('osm:node/1370801507', 'Phare de Trézien', 'phare-de-trezien', 48.42, -4.78, 'lighthouse', 'Maritime', 'node', 1370801507, 'osm:node/1370801507', 'man_made=lighthouse'),
      ('osm:node/1395067584', 'Phare des Moutons', 'phare-des-moutons', 47.77, -4.03, 'lighthouse', 'Maritime', 'node', 1395067584, 'osm:node/1395067584', 'man_made=lighthouse'),
      ('osm:node/1370801478', 'Phare des Pierres-Noires', 'phare-des-pierres-noires', 48.31, -4.91, 'lighthouse', 'Maritime', 'node', 1370801478, 'osm:node/1370801478', 'man_made=lighthouse'),
      ('osm:node/13138447296', 'Phare du Créac''h', 'phare-du-creac-h', 48.46, -5.13, 'lighthouse', 'Maritime', 'node', 13138447296, 'osm:node/13138447296', 'man_made=lighthouse'),
      ('osm:way/94677643', 'Phare du Grand-Jardin', 'phare-du-grand-jardin', 48.67, -2.08, 'lighthouse', 'Maritime', 'way', 94677643, 'osm:way/94677643', 'man_made=lighthouse'),
      ('osm:node/535700544', 'Phare du Millier', 'phare-du-millier', 48.1, -4.47, 'lighthouse', 'Maritime', 'node', 535700544, 'osm:node/535700544', 'man_made=lighthouse'),
      ('osm:node/1370801418', 'Phare du Portzic', 'phare-du-portzic', 48.36, -4.53, 'lighthouse', 'Maritime', 'node', 1370801418, 'osm:node/1370801418', 'man_made=lighthouse'),
      ('osm:node/2715566908', 'Phare du Rosédo', 'phare-du-rosedo', 48.86, -3, 'lighthouse', 'Maritime', 'node', 2715566908, 'osm:node/2715566908', 'man_made=lighthouse'),
      ('osm:way/1429681256', 'Château de Fougères', 'chateau-de-fougeres', 48.35, -1.21, 'castle', 'Architecture', 'way', 1429681256, 'osm:way/1429681256', 'historic=castle'),
      ('osm:node/7786979338', 'Observatoire du marais de Séné', 'observatoire-du-marais-de-sene', 47.62, -2.71, 'observatory', 'Observation', 'node', 7786979338, 'osm:node/7786979338', 'tourism=viewpoint'),
      ('osm:node/4938217707', 'Château de Rustéphan', 'chateau-de-rustephan', 47.86, -3.77, 'ruins', 'Architecture', 'node', 4938217707, 'osm:node/4938217707', 'historic=ruins'),
      ('osm:way/627188299', 'Phare de Kéréon', 'phare-de-kereon', 48.44, -5.03, 'lighthouse', 'Maritime', 'way', 627188299, 'osm:way/627188299', 'man_made=lighthouse'),
      ('osm:node/602214530', 'Phare de Kergadec', 'phare-de-kergadec', 48.02, -4.55, 'lighthouse', 'Maritime', 'node', 602214530, 'osm:node/602214530', 'man_made=lighthouse'),
      ('osm:node/1269226414', 'Phare de l''Aber Ildut', 'phare-de-l-aber-ildut', 48.47, -4.76, 'lighthouse', 'Maritime', 'node', 1269226414, 'osm:node/1269226414', 'man_made=lighthouse'),
      ('osm:way/364993683', 'Phare de l''île de Sein', 'phare-de-l-ile-de-sein', 48.04, -4.87, 'lighthouse', 'Maritime', 'way', 364993683, 'osm:way/364993683', 'man_made=lighthouse'),
      ('osm:way/93055283', 'Phare de l''Île Vierge', 'phare-de-l-ile-vierge', 48.64, -4.57, 'lighthouse', 'Maritime', 'way', 93055283, 'osm:way/93055283', 'man_made=lighthouse'),
      ('osm:way/737263555', 'Phare de la Vieille', 'phare-de-la-vieille', 48.04, -4.76, 'lighthouse', 'Maritime', 'way', 737263555, 'osm:way/737263555', 'man_made=lighthouse'),
      ('osm:node/1269394756', 'Phare du Toulinguet', 'phare-du-toulinguet', 48.28, -4.63, 'lighthouse', 'Maritime', 'node', 1269394756, 'osm:node/1269394756', 'man_made=lighthouse'),
      ('osm:node/5907022932', 'Phare et fort de Penfret', 'phare-et-fort-de-penfret', 47.72, -3.95, 'lighthouse', 'Maritime', 'node', 5907022932, 'osm:node/5907022932', 'man_made=lighthouse'),
      ('osm:node/3034504597', 'Fort Cigogne', 'fort-cigogne', 47.72, -3.99, 'fortification', 'Architecture', 'node', 3034504597, 'osm:node/3034504597', 'historic=fort'),
      ('osm:way/63697430', 'Phare de Goulphar', 'phare-de-goulphar', 47.31, -3.23, 'lighthouse', 'Maritime', 'way', 63697430, 'osm:way/63697430', 'man_made=lighthouse'),
      ('osm:way/232642575', 'Phare de Lanvaon', 'phare-de-lanvaon', 48.61, -4.54, 'lighthouse', 'Maritime', 'way', 232642575, 'osm:way/232642575', 'man_made=lighthouse'),
      ('osm:way/135722236', 'Phare du Cap Fréhel', 'phare-du-cap-frehel', 48.68, -2.32, 'lighthouse', 'Maritime', 'way', 135722236, 'osm:way/135722236', 'man_made=lighthouse'),
      ('osm:node/4968595050', 'Château de Fontenay', 'chateau-de-fontenay', 48.05, -1.7, 'castle', 'Architecture', 'node', 4968595050, 'osm:node/4968595050', 'historic=castle'),
      ('osm:node/3029844736', 'Château de Kéralio', 'chateau-de-keralio', 48.82, -3.25, 'castle', 'Architecture', 'node', 3029844736, 'osm:node/3029844736', 'historic=castle'),
      ('osm:node/4990866348', 'Château de la Sécardais', 'chateau-de-la-secardais', 48.3, -1.46, 'castle', 'Architecture', 'node', 4990866348, 'osm:node/4990866348', 'historic=castle'),
      ('osm:node/4990866347', 'Château de Lupin', 'chateau-de-lupin', 48.68, -1.94, 'castle', 'Architecture', 'node', 4990866347, 'osm:node/4990866347', 'historic=castle'),
      ('osm:node/4674932670', 'Château du Bot', 'chateau-du-bot', 47.81, -3.3, 'castle', 'Architecture', 'node', 4674932670, 'osm:node/4674932670', 'historic=castle'),
      ('osm:node/4354560524', 'Fort de Taillefer', 'fort-de-taillefer', 47.36, -3.16, 'fortification', 'Architecture', 'node', 4354560524, 'osm:node/4354560524', 'historic=fort'),
      ('osm:way/37106950', 'Le Vieux Pont Suspendu', 'le-vieux-pont-suspendu', 47.64, -2.95, 'monument', 'Architecture', 'way', 37106950, 'osm:way/37106950', 'historic=monument'),
      ('osm:node/4715006920', 'Observatoire', 'observatoire-n48-5193-w1-5153', 48.52, -1.52, 'observatory', 'Observation', 'node', 4715006920, 'osm:node/4715006920', 'tourism=viewpoint'),
      ('osm:node/5590864486', 'Observatoire', 'observatoire-n47-7609-w3-3239', 47.76, -3.32, 'observatory', 'Observation', 'node', 5590864486, 'osm:node/5590864486', 'leisure=bird_hide'),
      ('osm:node/6022818160', 'Observatoire', 'observatoire-n47-7686-w3-5019', 47.77, -3.5, 'observatory', 'Observation', 'node', 6022818160, 'osm:node/6022818160', 'leisure=bird_hide'),
      ('osm:node/11897628369', 'Observatoire de Kersanton', 'observatoire-de-kersanton', 48.35, -4.3, 'observatory', 'Observation', 'node', 11897628369, 'osm:node/11897628369', 'leisure=bird_hide'),
      ('osm:node/14080691020', 'Observatoire de l''étang du Hézo', 'observatoire-de-l-etang-du-hezo', 47.58, -2.7, 'observatory', 'Observation', 'node', 14080691020, 'osm:node/14080691020', 'leisure=bird_hide'),
      ('osm:node/11897628406', 'Observatoire de Lanveur', 'observatoire-de-lanveur', 48.36, -4.3, 'observatory', 'Observation', 'node', 11897628406, 'osm:node/11897628406', 'leisure=bird_hide'),
      ('osm:node/10299619646', 'Observatoire de Penfoul', 'observatoire-de-penfoul', 48.33, -4.31, 'observatory', 'Observation', 'node', 10299619646, 'osm:node/10299619646', 'leisure=bird_hide'),
      ('osm:node/6739769293', 'Observatoire de Pennaras', 'observatoire-de-pennaras', 48.33, -4.3, 'observatory', 'Observation', 'node', 6739769293, 'osm:node/6739769293', 'leisure=bird_hide'),
      ('osm:node/10556615855', 'Observatoire ornithologique', 'observatoire-ornithologique-n48-0698-w2-0120', 48.07, -2.01, 'observatory', 'Observation', 'node', 10556615855, 'osm:node/10556615855', 'leisure=bird_hide'),
      ('osm:node/10556663392', 'Observatoire ornithologique', 'observatoire-ornithologique-n48-0751-w2-0137', 48.08, -2.01, 'observatory', 'Observation', 'node', 10556663392, 'osm:node/10556663392', 'leisure=bird_hide'),
      ('osm:node/4714905290', 'Observatoire ornithologique de la Musse', 'observatoire-ornithologique-de-la-musse', 48.51, -1.51, 'observatory', 'Observation', 'node', 4714905290, 'osm:node/4714905290', 'tourism=viewpoint'),
      ('osm:way/72268409', 'Phare de l''île de Batz', 'phare-de-l-ile-de-batz', 48.75, -4.03, 'lighthouse', 'Maritime', 'way', 72268409, 'osm:way/72268409', 'man_made=lighthouse'),
      ('osm:node/1370799982', 'Phare de la Teignouse', 'phare-de-la-teignouse', 47.46, -3.05, 'lighthouse', 'Maritime', 'node', 1370799982, 'osm:node/1370799982', 'man_made=lighthouse'),
      ('osm:node/1865624218', 'Phare de Pontusval', 'phare-de-pontusval', 48.68, -4.35, 'lighthouse', 'Maritime', 'node', 1865624218, 'osm:node/1865624218', 'man_made=lighthouse'),
      ('osm:node/2883454480', 'Phare des Grands Cardinaux', 'phare-des-grands-cardinaux', 47.32, -2.83, 'lighthouse', 'Maritime', 'node', 2883454480, 'osm:node/2883454480', 'man_made=lighthouse'),
      ('osm:node/5599719757', 'Château de la Grand''Ville', 'chateau-de-la-grand-ville', 48.58, -2.99, 'castle', 'Architecture', 'node', 5599719757, 'osm:node/5599719757', 'historic=castle'),
      ('osm:node/1920516166', 'Château de Mesléan', 'chateau-de-meslean', 48.44, -4.46, 'castle', 'Architecture', 'node', 1920516166, 'osm:node/1920516166', 'historic=castle'),
      ('osm:node/2580167031', 'Château de Trémohar', 'chateau-de-tremohar', 47.63, -2.57, 'castle', 'Architecture', 'node', 2580167031, 'osm:node/2580167031', 'historic=castle'),
      ('osm:node/5283040087', 'Lech de Pen-er-Pont', 'lech-de-pen-er-pont', 47.7, -3.13, 'monument', 'Architecture', 'node', 5283040087, 'osm:node/5283040087', 'historic=monument'),
      ('osm:node/4728503207', 'Abbaye Saint-Maurice', 'abbaye-saint-maurice', 47.8, -3.53, 'ruins', 'Architecture', 'node', 4728503207, 'osm:node/4728503207', 'historic=ruins'),
      ('osm:node/6227948399', 'Batterie Basse de Cornouaille', 'batterie-basse-de-cornouaille', 48.33, -4.57, 'ruins', 'Architecture', 'node', 6227948399, 'osm:node/6227948399', 'historic=ruins'),
      ('osm:node/5599719764', 'Château de Beaumont', 'chateau-de-beaumont', 48.3, -2.09, 'castle', 'Architecture', 'node', 5599719764, 'osm:node/5599719764', 'historic=castle'),
      ('osm:node/1258865133', 'Château de Coat-Trédrez', 'chateau-de-coat-tredrez', 48.71, -3.55, 'castle', 'Architecture', 'node', 1258865133, 'osm:node/1258865133', 'historic=castle'),
      ('osm:node/4938217715', 'Château de Lezergué', 'chateau-de-lezergue', 48.01, -4.02, 'castle', 'Architecture', 'node', 4938217715, 'osm:node/4938217715', 'historic=castle'),
      ('osm:node/4674932671', 'Château de Sourdéac', 'chateau-de-sourdeac', 47.73, -2.12, 'castle', 'Architecture', 'node', 4674932671, 'osm:node/4674932671', 'historic=castle'),
      ('osm:node/4567694428', 'Château de Talhouët', 'chateau-de-talhouet', 47.72, -2.37, 'castle', 'Architecture', 'node', 4567694428, 'osm:node/4567694428', 'historic=castle'),
      ('osm:node/4938217712', 'Château de Troménec', 'chateau-de-tromenec', 48.59, -4.56, 'castle', 'Architecture', 'node', 4938217712, 'osm:node/4938217712', 'historic=castle'),
      ('osm:node/4938217711', 'Château du Hénant', 'chateau-du-henant', 47.83, -3.76, 'castle', 'Architecture', 'node', 4938217711, 'osm:node/4938217711', 'historic=castle'),
      ('osm:node/2012913656', 'Fort du Minou', 'fort-du-minou', 48.34, -4.61, 'ruins', 'Architecture', 'node', 2012913656, 'osm:node/2012913656', 'historic=ruins'),
      ('osm:way/33779845', 'Phare d''Eckmühl', 'phare-d-eckmuhl', 47.8, -4.37, 'lighthouse', 'Maritime', 'way', 33779845, 'osm:way/33779845', 'man_made=lighthouse'),
      ('osm:way/232707096', 'Phare de Kermorvan', 'phare-de-kermorvan', 48.36, -4.79, 'lighthouse', 'Maritime', 'way', 232707096, 'osm:way/232707096', 'man_made=lighthouse'),
      ('osm:way/93512248', 'Phare de Langoz', 'phare-de-langoz', 47.83, -4.16, 'lighthouse', 'Maritime', 'way', 93512248, 'osm:way/93512248', 'man_made=lighthouse'),
      ('osm:way/81963847', 'Phare de Mean Ruz', 'phare-de-mean-ruz', 48.84, -3.48, 'lighthouse', 'Maritime', 'way', 81963847, 'osm:way/81963847', 'man_made=lighthouse'),
      ('osm:way/171076270', 'Phare de Port-Navalo', 'phare-de-port-navalo', 47.55, -2.92, 'lighthouse', 'Maritime', 'way', 171076270, 'osm:way/171076270', 'man_made=lighthouse'),
      ('osm:way/72072235', 'Phare de Roscoff', 'phare-de-roscoff', 48.72, -3.98, 'lighthouse', 'Maritime', 'way', 72072235, 'osm:way/72072235', 'man_made=lighthouse'),
      ('osm:way/40402853', 'Réserve Ornithologique Koh Kastel', 'reserve-ornithologique-koh-kastel', 47.37, -3.26, 'bird_reserve', 'Nature', 'way', 40402853, 'osm:way/40402853', 'boundary=protected_area'),
      ('osm:node/5599719758', 'Ruines du château de La Chèze', 'ruines-du-chateau-de-la-cheze', 48.13, -2.66, 'ruins', 'Architecture', 'node', 5599719758, 'osm:node/5599719758', 'historic=ruins'),
      ('osm:node/6110181120', 'Anciens Fours à chaux', 'anciens-fours-a-chaux', 48.04, -1.72, 'ruins', 'Architecture', 'node', 6110181120, 'osm:node/6110181120', 'historic=ruins'),
      ('osm:node/1675115889', 'Butte de César', 'butte-de-cesar', 47.54, -2.87, 'viewpoint', 'Relief', 'node', 1675115889, 'osm:node/1675115889', 'tourism=viewpoint'),
      ('osm:node/3001278312', 'Château de Boutavent', 'chateau-de-boutavent', 48.07, -2.05, 'castle', 'Architecture', 'node', 3001278312, 'osm:node/3001278312', 'historic=castle'),
      ('osm:node/5599719768', 'Château de Cargouët', 'chateau-de-cargouet', 48.45, -2.6, 'ruins', 'Architecture', 'node', 5599719768, 'osm:node/5599719768', 'historic=ruins'),
      ('osm:node/5599719778', 'Château de Coëtquen', 'chateau-de-coetquen', 48.47, -1.94, 'ruins', 'Architecture', 'node', 5599719778, 'osm:node/5599719778', 'historic=ruins'),
      ('osm:node/4893955029', 'Château de la Touche-à-la Vache', 'chateau-de-la-touche-a-la-vache', 48.52, -2.2, 'ruins', 'Architecture', 'node', 4893955029, 'osm:node/4893955029', 'historic=ruins'),
      ('osm:node/5599719766', 'Château de Perrien', 'chateau-de-perrien', 48.48, -3.02, 'ruins', 'Architecture', 'node', 5599719766, 'osm:node/5599719766', 'historic=ruins'),
      ('osm:node/5599719774', 'Château du Bois de la Salle', 'chateau-du-bois-de-la-salle', 48.62, -2.93, 'castle', 'Architecture', 'node', 5599719774, 'osm:node/5599719774', 'historic=castle'),
      ('osm:node/4309832845', 'Ensemble fortifié de La Ferrière', 'ensemble-fortifie-de-la-ferriere', 47.32, -3.11, 'fortification', 'Architecture', 'node', 4309832845, 'osm:node/4309832845', 'historic=fort'),
      ('osm:node/430910388', 'Fort du Cabellou', 'fort-du-cabellou', 47.86, -3.92, 'fortification', 'Architecture', 'node', 430910388, 'osm:node/430910388', 'historic=fort'),
      ('osm:way/147054705', 'La Citadelle', 'la-citadelle', 47.35, -3.15, 'fortification', 'Architecture', 'way', 147054705, 'osm:way/147054705', 'historic=fort'),
      ('osm:node/3761248071', 'observatoire', 'observatoire-n48-1988-w1-5808', 48.2, -1.58, 'observatory', 'Observation', 'node', 3761248071, 'osm:node/3761248071', 'leisure=bird_hide'),
      ('osm:node/4938382192', 'Observatoire', 'observatoire-n48-2460-w3-3935', 48.25, -3.39, 'observatory', 'Observation', 'node', 4938382192, 'osm:node/4938382192', 'leisure=bird_hide'),
      ('osm:node/4507117298', 'Observatoire aquatique', 'observatoire-aquatique', 48.2, -4.09, 'observatory', 'Observation', 'node', 4507117298, 'osm:node/4507117298', 'unknown'),
      ('osm:way/359597183', 'Observatoire astronomique de la pointe du Diable', 'observatoire-astronomique-de-la-pointe-du-diable', 48.36, -4.57, 'observatory', 'Observation', 'way', 359597183, 'osm:way/359597183', 'unknown'),
      ('osm:node/14062411951', 'Observatoire de l''Astro-Club Alnitak', 'observatoire-de-l-astro-club-alnitak', 48.44, -4.15, 'observatory', 'Observation', 'node', 14062411951, 'osm:node/14062411951', 'man_made=observatory'),
      ('osm:way/184001154', 'Observatoire faune', 'observatoire-faune', 47.8, -4.27, 'observatory', 'Observation', 'way', 184001154, 'osm:way/184001154', 'unknown'),
      ('osm:way/173491752', 'Observatoire n°1', 'observatoire-n-1-n47-6138-w2-7166', 47.61, -2.72, 'observatory', 'Observation', 'way', 173491752, 'osm:way/173491752', 'leisure=bird_hide'),
      ('osm:way/125425427', 'Observatoire n°3', 'observatoire-n-3', 47.62, -2.72, 'observatory', 'Observation', 'way', 125425427, 'osm:way/125425427', 'leisure=bird_hide'),
      ('osm:way/299846400', 'Observatoire nº 1', 'observatoire-n-1-n47-5411-w2-7344', 47.54, -2.73, 'observatory', 'Observation', 'way', 299846400, 'osm:way/299846400', 'tourism=viewpoint'),
      ('osm:way/299846399', 'Observatoire nº 2', 'observatoire-n-2', 47.54, -2.74, 'observatory', 'Observation', 'way', 299846399, 'osm:way/299846399', 'tourism=viewpoint'),
      ('osm:way/265721290', 'Observatoire ornithologique', 'observatoire-ornithologique-n48-7816-w3-5771', 48.78, -3.58, 'observatory', 'Observation', 'way', 265721290, 'osm:way/265721290', 'tower:type=observation'),
      ('osm:way/54974026', 'Phare de la Balue', 'phare-de-la-balue', 48.63, -2, 'lighthouse', 'Maritime', 'way', 54974026, 'osm:way/54974026', 'man_made=lighthouse'),
      ('osm:way/118445466', 'Phare de La Croix', 'phare-de-la-croix-n47-8693-w3-9181', 47.87, -3.92, 'lighthouse', 'Maritime', 'way', 118445466, 'osm:way/118445466', 'man_made=lighthouse'),
      ('osm:way/26809265', 'Réserve ornithologique du Verdelet', 'reserve-ornithologique-du-verdelet', 48.6, -2.56, 'bird_reserve', 'Nature', 'way', 26809265, 'osm:way/26809265', 'leisure=nature_reserve'),
      ('osm:node/2293790132', 'Restes du château', 'restes-du-chateau', 48.32, -3.06, 'ruins', 'Architecture', 'node', 2293790132, 'osm:node/2293790132', 'historic=ruins'),
      ('osm:node/4938073668', 'Ruines de la chapelle de Lochrist et calvaire', 'ruines-de-la-chapelle-de-lochrist-et-calvaire', 48.07, -3.88, 'ruins', 'Architecture', 'node', 4938073668, 'osm:node/4938073668', 'historic=ruins'),
      ('osm:node/5599719759', 'Vestiges de l''ancien château de Crénan', 'vestiges-de-l-ancien-chateau-de-crenan', 48.42, -2.89, 'ruins', 'Architecture', 'node', 5599719759, 'osm:node/5599719759', 'historic=ruins'),
      ('osm:way/320177779', 'Viaduc de Port-Nieux', 'viaduc-de-port-nieux', 48.63, -2.33, 'bridge', 'Architecture', 'way', 320177779, 'osm:way/320177779', 'bridge=viaduct'),
      ('osm:node/1686968468', 'Village déserté fortifié de Goarem-ar-Manec''h', 'village-deserte-fortifie-de-goarem-ar-manec-h', 48.4, -3.83, 'ruins', 'Architecture', 'node', 1686968468, 'osm:node/1686968468', 'historic=ruins')
  ) AS v(
    place_key,
    name,
    slug,
    latitude,
    longitude,
    photo_atlas_type,
    photo_atlas_family,
    osm_type,
    osm_id,
    source_external_id,
    source_type
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
       ON s.slug = t.slug),
    (SELECT count(*)
     FROM public.spots AS s
     JOIN typed_spots AS t
       ON s.source = 'osm'
      AND s.source_external_id = t.normalized_source_external_id
     WHERE s.status = 'candidate'),
    (SELECT count(*)
     FROM public.spots AS s
     JOIN typed_spots AS t
       ON s.source = 'osm'
      AND s.source_external_id = t.normalized_source_external_id
     WHERE s.spot_type_id = t.spot_type_id
       AND s.spot_type = t.photo_atlas_type),
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
        OR s.status IS DISTINCT FROM 'candidate'
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
     ) AS duplicate_slugs)
  INTO
    v_post_source_external_id_count,
    v_post_slug_count,
    v_post_candidate_count,
    v_post_type_count,
    v_post_identity_mismatch_count,
    v_post_duplicate_source_count,
    v_post_duplicate_slug_count;

  IF v_post_source_external_id_count <> v_expected_count THEN
    RAISE EXCEPTION 'bretagne import aborted: post-check source_external_id presence failed (%/%).', v_post_source_external_id_count, v_expected_count;
  END IF;

  IF v_post_slug_count <> v_expected_count THEN
    RAISE EXCEPTION 'bretagne import aborted: post-check slug presence failed (%/%).', v_post_slug_count, v_expected_count;
  END IF;

  IF v_post_candidate_count <> v_expected_count THEN
    RAISE EXCEPTION 'bretagne import aborted: post-check candidate status failed (%/%).', v_post_candidate_count, v_expected_count;
  END IF;

  IF v_post_type_count <> v_expected_count THEN
    RAISE EXCEPTION 'bretagne import aborted: post-check type mapping failed (%/%).', v_post_type_count, v_expected_count;
  END IF;

  IF v_post_identity_mismatch_count <> 0 THEN
    RAISE EXCEPTION 'bretagne import aborted: % post-check identity mismatches detected.', v_post_identity_mismatch_count;
  END IF;

  IF v_post_duplicate_source_count <> 0 THEN
    RAISE EXCEPTION 'bretagne import aborted: % duplicate source/source_external_id pairs detected after insert.', v_post_duplicate_source_count;
  END IF;

  IF v_post_duplicate_slug_count <> 0 THEN
    RAISE EXCEPTION 'bretagne import aborted: % duplicate slugs detected after insert.', v_post_duplicate_slug_count;
  END IF;

  SELECT count(*) INTO v_after_total FROM public.spots;

  IF v_after_total - v_before_total <> v_expected_count THEN
    RAISE EXCEPTION 'bretagne import aborted: before/after row count delta is %, expected %.', v_after_total - v_before_total, v_expected_count;
  END IF;
END $$;

COMMIT;
