WITH editorial_spots AS (
  SELECT
    place_key,
    name,
    latitude::double precision AS latitude,
    longitude::double precision AS longitude,
    photo_atlas_type,
    photo_atlas_family,
    osm_type,
    osm_id::bigint AS osm_id,
    source_external_id,
    regexp_replace(source_external_id, '^osm:', '') AS normalized_source_external_id,
    slug,
    modified_slug
  FROM (
    VALUES
    ('osm:node/117081598', 'Phare de la Jument', 48.42, -5.13, 'lighthouse', 'Maritime', 'node', 117081598, 'osm:node/117081598', 'phare-de-la-jument', false),
    ('osm:node/255359392', 'Phare de Pen-Men', 47.65, -3.51, 'lighthouse', 'Maritime', 'node', 255359392, 'osm:node/255359392', 'phare-de-pen-men', false),
    ('osm:node/1378041353', 'Phare des Roches-Douvres', 49.11, -2.81, 'lighthouse', 'Maritime', 'node', 1378041353, 'osm:node/1378041353', 'phare-des-roches-douvres', false),
    ('osm:node/1269267113', 'Phare du Four', 48.52, -4.81, 'lighthouse', 'Maritime', 'node', 1269267113, 'osm:node/1269267113', 'phare-du-four', false),
    ('osm:node/1370801434', 'Phare du Petit Minou', 48.34, -4.61, 'lighthouse', 'Maritime', 'node', 1370801434, 'osm:node/1370801434', 'phare-du-petit-minou', false),
    ('osm:node/6793206641', 'Phare des Sept-Îles', 48.88, -3.49, 'lighthouse', 'Maritime', 'node', 6793206641, 'osm:node/6793206641', 'phare-des-sept-iles', false),
    ('osm:node/1543882146', 'Phare de la Croix', 48.84, -3.05, 'lighthouse', 'Maritime', 'node', 1543882146, 'osm:node/1543882146', 'phare-de-la-croix-le-trieux', true),
    ('osm:node/1269200222', 'Phare de Tévennec', 48.07, -4.8, 'lighthouse', 'Maritime', 'node', 1269200222, 'osm:node/1269200222', 'phare-de-tevennec', false),
    ('osm:node/1370801507', 'Phare de Trézien', 48.42, -4.78, 'lighthouse', 'Maritime', 'node', 1370801507, 'osm:node/1370801507', 'phare-de-trezien', false),
    ('osm:node/1395067584', 'Phare des Moutons', 47.77, -4.03, 'lighthouse', 'Maritime', 'node', 1395067584, 'osm:node/1395067584', 'phare-des-moutons', false),
    ('osm:node/1370801478', 'Phare des Pierres-Noires', 48.31, -4.91, 'lighthouse', 'Maritime', 'node', 1370801478, 'osm:node/1370801478', 'phare-des-pierres-noires', false),
    ('osm:node/13138447296', 'Phare du Créac''h', 48.46, -5.13, 'lighthouse', 'Maritime', 'node', 13138447296, 'osm:node/13138447296', 'phare-du-creac-h', false),
    ('osm:way/94677643', 'Phare du Grand-Jardin', 48.67, -2.08, 'lighthouse', 'Maritime', 'way', 94677643, 'osm:way/94677643', 'phare-du-grand-jardin', false),
    ('osm:node/535700544', 'Phare du Millier', 48.1, -4.47, 'lighthouse', 'Maritime', 'node', 535700544, 'osm:node/535700544', 'phare-du-millier', false),
    ('osm:node/1370801418', 'Phare du Portzic', 48.36, -4.53, 'lighthouse', 'Maritime', 'node', 1370801418, 'osm:node/1370801418', 'phare-du-portzic', false),
    ('osm:node/2715566908', 'Phare du Rosédo', 48.86, -3, 'lighthouse', 'Maritime', 'node', 2715566908, 'osm:node/2715566908', 'phare-du-rosedo', false),
    ('osm:way/1429681256', 'Château de Fougères', 48.35, -1.21, 'castle', 'Architecture', 'way', 1429681256, 'osm:way/1429681256', 'chateau-de-fougeres', false),
    ('osm:node/7786979338', 'Observatoire du marais de Séné', 47.62, -2.71, 'observatory', 'Observation', 'node', 7786979338, 'osm:node/7786979338', 'observatoire-du-marais-de-sene', false),
    ('osm:node/4938217707', 'Château de Rustéphan', 47.86, -3.77, 'ruins', 'Architecture', 'node', 4938217707, 'osm:node/4938217707', 'chateau-de-rustephan', false),
    ('osm:way/627188299', 'Phare de Kéréon', 48.44, -5.03, 'lighthouse', 'Maritime', 'way', 627188299, 'osm:way/627188299', 'phare-de-kereon', false),
    ('osm:node/602214530', 'Phare de Kergadec', 48.02, -4.55, 'lighthouse', 'Maritime', 'node', 602214530, 'osm:node/602214530', 'phare-de-kergadec', false),
    ('osm:node/1269226414', 'Phare de l''Aber Ildut', 48.47, -4.76, 'lighthouse', 'Maritime', 'node', 1269226414, 'osm:node/1269226414', 'phare-de-l-aber-ildut', false),
    ('osm:way/364993683', 'Phare de l''île de Sein', 48.04, -4.87, 'lighthouse', 'Maritime', 'way', 364993683, 'osm:way/364993683', 'phare-de-l-ile-de-sein', false),
    ('osm:way/93055283', 'Phare de l''Île Vierge', 48.64, -4.57, 'lighthouse', 'Maritime', 'way', 93055283, 'osm:way/93055283', 'phare-de-l-ile-vierge', false),
    ('osm:way/737263555', 'Phare de la Vieille', 48.04, -4.76, 'lighthouse', 'Maritime', 'way', 737263555, 'osm:way/737263555', 'phare-de-la-vieille', false),
    ('osm:node/1269394756', 'Phare du Toulinguet', 48.28, -4.63, 'lighthouse', 'Maritime', 'node', 1269394756, 'osm:node/1269394756', 'phare-du-toulinguet', false),
    ('osm:node/5907022932', 'Phare et fort de Penfret', 47.72, -3.95, 'lighthouse', 'Maritime', 'node', 5907022932, 'osm:node/5907022932', 'phare-et-fort-de-penfret', false),
    ('osm:node/3034504597', 'Fort Cigogne', 47.72, -3.99, 'fortification', 'Architecture', 'node', 3034504597, 'osm:node/3034504597', 'fort-cigogne', false),
    ('osm:way/63697430', 'Phare de Goulphar', 47.31, -3.23, 'lighthouse', 'Maritime', 'way', 63697430, 'osm:way/63697430', 'phare-de-goulphar', false),
    ('osm:way/232642575', 'Phare de Lanvaon', 48.61, -4.54, 'lighthouse', 'Maritime', 'way', 232642575, 'osm:way/232642575', 'phare-de-lanvaon', false),
    ('osm:way/135722236', 'Phare du Cap Fréhel', 48.68, -2.32, 'lighthouse', 'Maritime', 'way', 135722236, 'osm:way/135722236', 'phare-du-cap-frehel', false),
    ('osm:node/4968595050', 'Château de Fontenay', 48.05, -1.7, 'castle', 'Architecture', 'node', 4968595050, 'osm:node/4968595050', 'chateau-de-fontenay', false),
    ('osm:node/3029844736', 'Château de Kéralio', 48.82, -3.25, 'castle', 'Architecture', 'node', 3029844736, 'osm:node/3029844736', 'chateau-de-keralio', false),
    ('osm:node/4990866348', 'Château de la Sécardais', 48.3, -1.46, 'castle', 'Architecture', 'node', 4990866348, 'osm:node/4990866348', 'chateau-de-la-secardais', false),
    ('osm:node/4990866347', 'Château de Lupin', 48.68, -1.94, 'castle', 'Architecture', 'node', 4990866347, 'osm:node/4990866347', 'chateau-de-lupin', false),
    ('osm:node/4674932670', 'Château du Bot', 47.81, -3.3, 'castle', 'Architecture', 'node', 4674932670, 'osm:node/4674932670', 'chateau-du-bot', false),
    ('osm:node/4354560524', 'Fort de Taillefer', 47.36, -3.16, 'fortification', 'Architecture', 'node', 4354560524, 'osm:node/4354560524', 'fort-de-taillefer', false),
    ('osm:way/37106950', 'Le Vieux Pont Suspendu', 47.64, -2.95, 'monument', 'Architecture', 'way', 37106950, 'osm:way/37106950', 'le-vieux-pont-suspendu', false),
    ('osm:node/4715006920', 'Observatoire', 48.52, -1.52, 'observatory', 'Observation', 'node', 4715006920, 'osm:node/4715006920', 'observatoire-n48-5193-w1-5153', true),
    ('osm:node/5590864486', 'Observatoire', 47.76, -3.32, 'observatory', 'Observation', 'node', 5590864486, 'osm:node/5590864486', 'observatoire-n47-7609-w3-3239', true),
    ('osm:node/6022818160', 'Observatoire', 47.77, -3.5, 'observatory', 'Observation', 'node', 6022818160, 'osm:node/6022818160', 'observatoire-n47-7686-w3-5019', true),
    ('osm:node/11897628369', 'Observatoire de Kersanton', 48.35, -4.3, 'observatory', 'Observation', 'node', 11897628369, 'osm:node/11897628369', 'observatoire-de-kersanton', false),
    ('osm:node/14080691020', 'Observatoire de l''étang du Hézo', 47.58, -2.7, 'observatory', 'Observation', 'node', 14080691020, 'osm:node/14080691020', 'observatoire-de-l-etang-du-hezo', false),
    ('osm:node/11897628406', 'Observatoire de Lanveur', 48.36, -4.3, 'observatory', 'Observation', 'node', 11897628406, 'osm:node/11897628406', 'observatoire-de-lanveur', false),
    ('osm:node/10299619646', 'Observatoire de Penfoul', 48.33, -4.31, 'observatory', 'Observation', 'node', 10299619646, 'osm:node/10299619646', 'observatoire-de-penfoul', false),
    ('osm:node/6739769293', 'Observatoire de Pennaras', 48.33, -4.3, 'observatory', 'Observation', 'node', 6739769293, 'osm:node/6739769293', 'observatoire-de-pennaras', false),
    ('osm:node/10556615855', 'Observatoire ornithologique', 48.07, -2.01, 'observatory', 'Observation', 'node', 10556615855, 'osm:node/10556615855', 'observatoire-ornithologique-n48-0698-w2-0120', true),
    ('osm:node/10556663392', 'Observatoire ornithologique', 48.08, -2.01, 'observatory', 'Observation', 'node', 10556663392, 'osm:node/10556663392', 'observatoire-ornithologique-n48-0751-w2-0137', true),
    ('osm:node/4714905290', 'Observatoire ornithologique de la Musse', 48.51, -1.51, 'observatory', 'Observation', 'node', 4714905290, 'osm:node/4714905290', 'observatoire-ornithologique-de-la-musse', false),
    ('osm:way/72268409', 'Phare de l''île de Batz', 48.75, -4.03, 'lighthouse', 'Maritime', 'way', 72268409, 'osm:way/72268409', 'phare-de-l-ile-de-batz', false),
    ('osm:node/1370799982', 'Phare de la Teignouse', 47.46, -3.05, 'lighthouse', 'Maritime', 'node', 1370799982, 'osm:node/1370799982', 'phare-de-la-teignouse', false),
    ('osm:node/1865624218', 'Phare de Pontusval', 48.68, -4.35, 'lighthouse', 'Maritime', 'node', 1865624218, 'osm:node/1865624218', 'phare-de-pontusval', false),
    ('osm:node/2883454480', 'Phare des Grands Cardinaux', 47.32, -2.83, 'lighthouse', 'Maritime', 'node', 2883454480, 'osm:node/2883454480', 'phare-des-grands-cardinaux', false),
    ('osm:node/5599719757', 'Château de la Grand''Ville', 48.58, -2.99, 'castle', 'Architecture', 'node', 5599719757, 'osm:node/5599719757', 'chateau-de-la-grand-ville', false),
    ('osm:node/1920516166', 'Château de Mesléan', 48.44, -4.46, 'castle', 'Architecture', 'node', 1920516166, 'osm:node/1920516166', 'chateau-de-meslean', false),
    ('osm:node/2580167031', 'Château de Trémohar', 47.63, -2.57, 'castle', 'Architecture', 'node', 2580167031, 'osm:node/2580167031', 'chateau-de-tremohar', false),
    ('osm:node/5283040087', 'Lech de Pen-er-Pont', 47.7, -3.13, 'monument', 'Architecture', 'node', 5283040087, 'osm:node/5283040087', 'lech-de-pen-er-pont', false),
    ('osm:node/4728503207', 'Abbaye Saint-Maurice', 47.8, -3.53, 'ruins', 'Architecture', 'node', 4728503207, 'osm:node/4728503207', 'abbaye-saint-maurice', false),
    ('osm:node/6227948399', 'Batterie Basse de Cornouaille', 48.33, -4.57, 'ruins', 'Architecture', 'node', 6227948399, 'osm:node/6227948399', 'batterie-basse-de-cornouaille', false),
    ('osm:node/5599719764', 'Château de Beaumont', 48.3, -2.09, 'castle', 'Architecture', 'node', 5599719764, 'osm:node/5599719764', 'chateau-de-beaumont', false),
    ('osm:node/1258865133', 'Château de Coat-Trédrez', 48.71, -3.55, 'castle', 'Architecture', 'node', 1258865133, 'osm:node/1258865133', 'chateau-de-coat-tredrez', false),
    ('osm:node/4938217715', 'Château de Lezergué', 48.01, -4.02, 'castle', 'Architecture', 'node', 4938217715, 'osm:node/4938217715', 'chateau-de-lezergue', false),
    ('osm:node/4674932671', 'Château de Sourdéac', 47.73, -2.12, 'castle', 'Architecture', 'node', 4674932671, 'osm:node/4674932671', 'chateau-de-sourdeac', false),
    ('osm:node/4567694428', 'Château de Talhouët', 47.72, -2.37, 'castle', 'Architecture', 'node', 4567694428, 'osm:node/4567694428', 'chateau-de-talhouet', false),
    ('osm:node/4938217712', 'Château de Troménec', 48.59, -4.56, 'castle', 'Architecture', 'node', 4938217712, 'osm:node/4938217712', 'chateau-de-tromenec', false),
    ('osm:node/4938217711', 'Château du Hénant', 47.83, -3.76, 'castle', 'Architecture', 'node', 4938217711, 'osm:node/4938217711', 'chateau-du-henant', false),
    ('osm:node/2012913656', 'Fort du Minou', 48.34, -4.61, 'ruins', 'Architecture', 'node', 2012913656, 'osm:node/2012913656', 'fort-du-minou', false),
    ('osm:way/33779845', 'Phare d''Eckmühl', 47.8, -4.37, 'lighthouse', 'Maritime', 'way', 33779845, 'osm:way/33779845', 'phare-d-eckmuhl', false),
    ('osm:way/232707096', 'Phare de Kermorvan', 48.36, -4.79, 'lighthouse', 'Maritime', 'way', 232707096, 'osm:way/232707096', 'phare-de-kermorvan', false),
    ('osm:way/93512248', 'Phare de Langoz', 47.83, -4.16, 'lighthouse', 'Maritime', 'way', 93512248, 'osm:way/93512248', 'phare-de-langoz', false),
    ('osm:way/81963847', 'Phare de Mean Ruz', 48.84, -3.48, 'lighthouse', 'Maritime', 'way', 81963847, 'osm:way/81963847', 'phare-de-mean-ruz', false),
    ('osm:way/171076270', 'Phare de Port-Navalo', 47.55, -2.92, 'lighthouse', 'Maritime', 'way', 171076270, 'osm:way/171076270', 'phare-de-port-navalo', false),
    ('osm:way/72072235', 'Phare de Roscoff', 48.72, -3.98, 'lighthouse', 'Maritime', 'way', 72072235, 'osm:way/72072235', 'phare-de-roscoff', false),
    ('osm:way/40402853', 'Réserve Ornithologique Koh Kastel', 47.37, -3.26, 'bird_reserve', 'Nature', 'way', 40402853, 'osm:way/40402853', 'reserve-ornithologique-koh-kastel', false),
    ('osm:node/5599719758', 'Ruines du château de La Chèze', 48.13, -2.66, 'ruins', 'Architecture', 'node', 5599719758, 'osm:node/5599719758', 'ruines-du-chateau-de-la-cheze', false),
    ('osm:node/6110181120', 'Anciens Fours à chaux', 48.04, -1.72, 'ruins', 'Architecture', 'node', 6110181120, 'osm:node/6110181120', 'anciens-fours-a-chaux', false),
    ('osm:node/1675115889', 'Butte de César', 47.54, -2.87, 'viewpoint', 'Relief', 'node', 1675115889, 'osm:node/1675115889', 'butte-de-cesar', false),
    ('osm:node/3001278312', 'Château de Boutavent', 48.07, -2.05, 'castle', 'Architecture', 'node', 3001278312, 'osm:node/3001278312', 'chateau-de-boutavent', false),
    ('osm:node/5599719768', 'Château de Cargouët', 48.45, -2.6, 'ruins', 'Architecture', 'node', 5599719768, 'osm:node/5599719768', 'chateau-de-cargouet', false),
    ('osm:node/5599719778', 'Château de Coëtquen', 48.47, -1.94, 'ruins', 'Architecture', 'node', 5599719778, 'osm:node/5599719778', 'chateau-de-coetquen', false),
    ('osm:node/4893955029', 'Château de la Touche-à-la Vache', 48.52, -2.2, 'ruins', 'Architecture', 'node', 4893955029, 'osm:node/4893955029', 'chateau-de-la-touche-a-la-vache', false),
    ('osm:node/5599719766', 'Château de Perrien', 48.48, -3.02, 'ruins', 'Architecture', 'node', 5599719766, 'osm:node/5599719766', 'chateau-de-perrien', false),
    ('osm:node/5599719774', 'Château du Bois de la Salle', 48.62, -2.93, 'castle', 'Architecture', 'node', 5599719774, 'osm:node/5599719774', 'chateau-du-bois-de-la-salle', false),
    ('osm:node/4309832845', 'Ensemble fortifié de La Ferrière', 47.32, -3.11, 'fortification', 'Architecture', 'node', 4309832845, 'osm:node/4309832845', 'ensemble-fortifie-de-la-ferriere', false),
    ('osm:node/430910388', 'Fort du Cabellou', 47.86, -3.92, 'fortification', 'Architecture', 'node', 430910388, 'osm:node/430910388', 'fort-du-cabellou', false),
    ('osm:way/147054705', 'La Citadelle', 47.35, -3.15, 'fortification', 'Architecture', 'way', 147054705, 'osm:way/147054705', 'la-citadelle', false),
    ('osm:node/3761248071', 'observatoire', 48.2, -1.58, 'observatory', 'Observation', 'node', 3761248071, 'osm:node/3761248071', 'observatoire-n48-1988-w1-5808', true),
    ('osm:node/4938382192', 'Observatoire', 48.25, -3.39, 'observatory', 'Observation', 'node', 4938382192, 'osm:node/4938382192', 'observatoire-n48-2460-w3-3935', true),
    ('osm:node/4507117298', 'Observatoire aquatique', 48.2, -4.09, 'observatory', 'Observation', 'node', 4507117298, 'osm:node/4507117298', 'observatoire-aquatique', false),
    ('osm:way/359597183', 'Observatoire astronomique de la pointe du Diable', 48.36, -4.57, 'observatory', 'Observation', 'way', 359597183, 'osm:way/359597183', 'observatoire-astronomique-de-la-pointe-du-diable', false),
    ('osm:node/14062411951', 'Observatoire de l''Astro-Club Alnitak', 48.44, -4.15, 'observatory', 'Observation', 'node', 14062411951, 'osm:node/14062411951', 'observatoire-de-l-astro-club-alnitak', false),
    ('osm:way/184001154', 'Observatoire faune', 47.8, -4.27, 'observatory', 'Observation', 'way', 184001154, 'osm:way/184001154', 'observatoire-faune', false),
    ('osm:way/173491752', 'Observatoire n°1', 47.61, -2.72, 'observatory', 'Observation', 'way', 173491752, 'osm:way/173491752', 'observatoire-n-1-n47-6138-w2-7166', true),
    ('osm:way/125425427', 'Observatoire n°3', 47.62, -2.72, 'observatory', 'Observation', 'way', 125425427, 'osm:way/125425427', 'observatoire-n-3', false),
    ('osm:way/299846400', 'Observatoire nº 1', 47.54, -2.73, 'observatory', 'Observation', 'way', 299846400, 'osm:way/299846400', 'observatoire-n-1-n47-5411-w2-7344', true),
    ('osm:way/299846399', 'Observatoire nº 2', 47.54, -2.74, 'observatory', 'Observation', 'way', 299846399, 'osm:way/299846399', 'observatoire-n-2', false),
    ('osm:way/265721290', 'Observatoire ornithologique', 48.78, -3.58, 'observatory', 'Observation', 'way', 265721290, 'osm:way/265721290', 'observatoire-ornithologique-n48-7816-w3-5771', true),
    ('osm:way/54974026', 'Phare de la Balue', 48.63, -2, 'lighthouse', 'Maritime', 'way', 54974026, 'osm:way/54974026', 'phare-de-la-balue', false),
    ('osm:way/118445466', 'Phare de La Croix', 47.87, -3.92, 'lighthouse', 'Maritime', 'way', 118445466, 'osm:way/118445466', 'phare-de-la-croix-n47-8693-w3-9181', true),
    ('osm:way/26809265', 'Réserve ornithologique du Verdelet', 48.6, -2.56, 'bird_reserve', 'Nature', 'way', 26809265, 'osm:way/26809265', 'reserve-ornithologique-du-verdelet', false),
    ('osm:node/2293790132', 'Restes du château', 48.32, -3.06, 'ruins', 'Architecture', 'node', 2293790132, 'osm:node/2293790132', 'restes-du-chateau', false),
    ('osm:node/4938073668', 'Ruines de la chapelle de Lochrist et calvaire', 48.07, -3.88, 'ruins', 'Architecture', 'node', 4938073668, 'osm:node/4938073668', 'ruines-de-la-chapelle-de-lochrist-et-calvaire', false),
    ('osm:node/5599719759', 'Vestiges de l''ancien château de Crénan', 48.42, -2.89, 'ruins', 'Architecture', 'node', 5599719759, 'osm:node/5599719759', 'vestiges-de-l-ancien-chateau-de-crenan', false),
    ('osm:way/320177779', 'Viaduc de Port-Nieux', 48.63, -2.33, 'bridge', 'Architecture', 'way', 320177779, 'osm:way/320177779', 'viaduc-de-port-nieux', false),
    ('osm:node/1686968468', 'Village déserté fortifié de Goarem-ar-Manec''h', 48.4, -3.83, 'ruins', 'Architecture', 'node', 1686968468, 'osm:node/1686968468', 'village-deserte-fortifie-de-goarem-ar-manec-h', false)
  ) AS v(
    place_key,
    name,
    latitude,
    longitude,
    photo_atlas_type,
    photo_atlas_family,
    osm_type,
    osm_id,
    source_external_id,
    slug,
    modified_slug
  )
),
source_matches AS (
  SELECT
    e.place_key,
    e.name AS catalogue,
    e.slug AS expected_slug,
    e.photo_atlas_type AS expected_type,
    e.photo_atlas_family AS expected_family,
    e.source_external_id AS expected_source_id,
    e.normalized_source_external_id AS expected_normalized_source_id,
    e.modified_slug,
    s.id AS live_spot_id,
    s.name AS live_name,
    s.slug AS live_slug,
    s.status AS live_status,
    s.source AS live_source,
    s.source_external_id AS live_source_external_id,
    regexp_replace(coalesce(s.source_external_id, ''), '^osm:', '') AS live_normalized_source_external_id,
    s.spot_type_id AS live_spot_type_id,
    st.slug AS live_spot_type_slug,
    s.position,
    CASE
      WHEN s.position IS NOT NULL THEN round(ST_DistanceSphere(
        ST_SetSRID(ST_MakePoint(e.longitude, e.latitude), 4326),
        s.position::geometry
      ))::bigint
    END AS distance_metres
  FROM editorial_spots AS e
  LEFT JOIN public.spots AS s
    ON s.source = 'osm'
   AND regexp_replace(coalesce(s.source_external_id, ''), '^osm:', '') = e.normalized_source_external_id
  LEFT JOIN public.spot_types AS st
    ON st.id = s.spot_type_id
),
classified AS (
  SELECT
    e.place_key,
    e.name AS catalogue,
    e.slug AS expected_slug,
    e.photo_atlas_type AS type,
    e.photo_atlas_family AS family,
    e.osm_type,
    e.osm_id,
    e.source_external_id AS expected_source_id,
    e.modified_slug,
    count(sm.live_spot_id) FILTER (WHERE sm.live_spot_id IS NOT NULL) AS live_match_count,
    min(sm.live_spot_id::text) FILTER (WHERE sm.live_spot_id IS NOT NULL) AS existing_spot_id,
    min(sm.live_name) FILTER (WHERE sm.live_spot_id IS NOT NULL) AS current_name,
    min(sm.live_slug) FILTER (WHERE sm.live_spot_id IS NOT NULL) AS current_slug,
    min(sm.live_status) FILTER (WHERE sm.live_spot_id IS NOT NULL) AS status,
    min(sm.live_source) FILTER (WHERE sm.live_spot_id IS NOT NULL) AS current_source,
    min(sm.live_source_external_id) FILTER (WHERE sm.live_spot_id IS NOT NULL) AS current_source_id,
    min(sm.live_spot_type_id::text) FILTER (WHERE sm.live_spot_id IS NOT NULL) AS current_spot_type_id,
    min(sm.live_spot_type_slug) FILTER (WHERE sm.live_spot_id IS NOT NULL) AS current_type,
    min(sm.distance_metres) FILTER (WHERE sm.live_spot_id IS NOT NULL) AS distance_metres,
    (
      SELECT count(*)
      FROM public.spots AS s_slug
      WHERE s_slug.slug = e.slug
    ) AS slug_collision_count,
    CASE
      WHEN count(sm.live_spot_id) FILTER (WHERE sm.live_spot_id IS NOT NULL) = 0 THEN 'NOUVEAU'
      WHEN count(sm.live_spot_id) FILTER (WHERE sm.live_spot_id IS NOT NULL) > 1 THEN 'DOUBLON_AMBIGU'
      WHEN min(sm.live_slug) FILTER (WHERE sm.live_spot_id IS NOT NULL) = e.slug
       AND min(sm.live_spot_type_slug) FILTER (WHERE sm.live_spot_id IS NOT NULL) = e.photo_atlas_type
       AND min(sm.live_status) FILTER (WHERE sm.live_spot_id IS NOT NULL) = 'verified'
      THEN 'EXISTANT_CORRECT'
      ELSE 'EXISTANT_A_CORRIGER'
    END AS categorie,
    nullif(concat_ws(' | ',
      CASE WHEN count(sm.live_spot_id) FILTER (WHERE sm.live_spot_id IS NOT NULL AND sm.live_slug IS DISTINCT FROM e.slug) > 0 THEN format('slug actuel=%s attendu=%s', coalesce(min(sm.live_slug) FILTER (WHERE sm.live_spot_id IS NOT NULL), 'null'), e.slug) END,
      CASE WHEN count(sm.live_spot_id) FILTER (WHERE sm.live_spot_id IS NOT NULL AND sm.live_spot_type_slug IS DISTINCT FROM e.photo_atlas_type) > 0 THEN format('type actuel=%s attendu=%s', coalesce(min(sm.live_spot_type_slug) FILTER (WHERE sm.live_spot_id IS NOT NULL), 'null'), e.photo_atlas_type) END,
      CASE WHEN count(sm.live_spot_id) FILTER (WHERE sm.live_spot_id IS NOT NULL AND sm.live_status IS DISTINCT FROM 'verified') > 0 THEN format('status actuel=%s attendu=verified', coalesce(min(sm.live_status) FILTER (WHERE sm.live_spot_id IS NOT NULL), 'null')) END,
      CASE WHEN (SELECT count(*) FROM public.spots AS s_slug WHERE s_slug.slug = e.slug) > 0 THEN format('collision slug Supabase=%s', (SELECT count(*) FROM public.spots AS s_slug WHERE s_slug.slug = e.slug)) END
    ), '') AS details
  FROM editorial_spots AS e
  LEFT JOIN source_matches AS sm
    ON sm.place_key = e.place_key
  GROUP BY
    e.place_key,
    e.name,
    e.slug,
    e.photo_atlas_type,
    e.photo_atlas_family,
    e.osm_type,
    e.osm_id,
    e.source_external_id,
    e.modified_slug
)
SELECT
  section,
  row_order,
  catalogue,
  osm_key,
  type,
  categorie,
  existing_spot_id,
  status,
  current_slug,
  expected_slug,
  slug_collision,
  details,
  metric_name,
  metric_value
FROM (
  SELECT
    'DETAIL_105_SPOTS'::text AS section,
    row_number() OVER (ORDER BY type, catalogue) AS row_order,
    catalogue,
    format('%s/%s', osm_type, osm_id) AS osm_key,
    type,
    categorie,
    existing_spot_id,
    status,
    current_slug,
    expected_slug,
    slug_collision_count AS slug_collision,
    details,
    NULL::text AS metric_name,
    NULL::bigint AS metric_value
  FROM classified

  UNION ALL

  SELECT 'COMPTEURS', row_number() OVER (ORDER BY metric_name), NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'compteurs depuis classified', metric_name, metric_value
  FROM (
    SELECT 'catalogue'::text AS metric_name, count(*)::bigint AS metric_value FROM classified
    UNION ALL SELECT 'existant_correct', count(*)::bigint FROM classified WHERE categorie = 'EXISTANT_CORRECT'
    UNION ALL SELECT 'existant_a_corriger', count(*)::bigint FROM classified WHERE categorie = 'EXISTANT_A_CORRIGER'
    UNION ALL SELECT 'nouveau', count(*)::bigint FROM classified WHERE categorie = 'NOUVEAU'
    UNION ALL SELECT 'doublon_ambigu', count(*)::bigint FROM classified WHERE categorie = 'DOUBLON_AMBIGU'
    UNION ALL SELECT 'match_source_external_id', count(*)::bigint FROM classified WHERE live_match_count > 0
    UNION ALL SELECT 'aucun_match_source_external_id', count(*)::bigint FROM classified WHERE live_match_count = 0
  ) counts

  UNION ALL

  SELECT 'REPARTITION_PAR_TYPE', row_number() OVER (ORDER BY type, metric_name), NULL, NULL, type, NULL, NULL, NULL, NULL, NULL, NULL, 'repartition par type', metric_name, metric_value
  FROM (
    SELECT type, 'catalogue'::text AS metric_name, count(*)::bigint AS metric_value FROM classified GROUP BY type
    UNION ALL SELECT type, 'nouveau', count(*)::bigint FROM classified WHERE categorie = 'NOUVEAU' GROUP BY type
    UNION ALL SELECT type, 'existant_correct', count(*)::bigint FROM classified WHERE categorie = 'EXISTANT_CORRECT' GROUP BY type
    UNION ALL SELECT type, 'existant_a_corriger', count(*)::bigint FROM classified WHERE categorie = 'EXISTANT_A_CORRIGER' GROUP BY type
    UNION ALL SELECT type, 'doublon_ambigu', count(*)::bigint FROM classified WHERE categorie = 'DOUBLON_AMBIGU' GROUP BY type
  ) type_counts

  UNION ALL

  SELECT 'REPARTITION_PAR_STATUS', row_number() OVER (ORDER BY metric_name), NULL, NULL, NULL, NULL, NULL, metric_name, NULL, NULL, NULL, 'repartition par status', metric_name, metric_value
  FROM (
    SELECT coalesce(status, 'SANS_CORRESPONDANCE')::text AS metric_name, count(*)::bigint AS metric_value
    FROM classified
    GROUP BY coalesce(status, 'SANS_CORRESPONDANCE')
  ) status_counts

  UNION ALL

  SELECT 'FUTURES_OPERATIONS_POTENTIELLES', row_number() OVER (ORDER BY metric_name), NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'operations depuis classified', metric_name, metric_value
  FROM (
    SELECT 'potentiel_nouveau'::text AS metric_name, count(*)::bigint AS metric_value FROM classified WHERE categorie = 'NOUVEAU'
    UNION ALL SELECT 'potentiel_statut', count(*)::bigint FROM classified WHERE categorie = 'EXISTANT_A_CORRIGER' AND coalesce(details, '') LIKE '%status actuel=%'
    UNION ALL SELECT 'potentiel_type', count(*)::bigint FROM classified WHERE categorie = 'EXISTANT_A_CORRIGER' AND coalesce(details, '') LIKE '%type actuel=%'
    UNION ALL SELECT 'sans_action', count(*)::bigint FROM classified WHERE categorie = 'EXISTANT_CORRECT'
  ) future_counts

  UNION ALL

  SELECT 'SLUGS_CORRIGES', row_number() OVER (ORDER BY catalogue), catalogue, format('%s/%s', osm_type, osm_id), type, categorie, existing_spot_id, status, current_slug, expected_slug, slug_collision_count, details, NULL, NULL
  FROM classified
  WHERE modified_slug = true

  UNION ALL

  SELECT 'CONTROLE_COLLISIONS_SLUG_SUPABASE', row_number() OVER (ORDER BY catalogue), catalogue, format('%s/%s', osm_type, osm_id), type, categorie, existing_spot_id, status, current_slug, expected_slug, slug_collision_count, details, NULL, NULL
  FROM classified
  WHERE slug_collision_count > 0

  UNION ALL

  SELECT 'DOUBLONS_AMBIGUS', row_number() OVER (ORDER BY catalogue), catalogue, format('%s/%s', osm_type, osm_id), type, categorie, existing_spot_id, status, current_slug, expected_slug, slug_collision_count, details, NULL, NULL
  FROM classified
  WHERE categorie = 'DOUBLON_AMBIGU'
) report
ORDER BY
  CASE section
    WHEN 'DETAIL_105_SPOTS' THEN 1
    WHEN 'COMPTEURS' THEN 2
    WHEN 'REPARTITION_PAR_TYPE' THEN 3
    WHEN 'REPARTITION_PAR_STATUS' THEN 4
    WHEN 'FUTURES_OPERATIONS_POTENTIELLES' THEN 5
    WHEN 'SLUGS_CORRIGES' THEN 6
    WHEN 'CONTROLE_COLLISIONS_SLUG_SUPABASE' THEN 7
    WHEN 'DOUBLONS_AMBIGUS' THEN 8
    ELSE 99
  END,
  row_order;
