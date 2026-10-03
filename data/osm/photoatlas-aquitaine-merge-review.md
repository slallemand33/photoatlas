=== CONTRÔLE DE FUSION PREMIUM AQUITAINE ===

### Spots existants

| Spot | Donnée actuelle | Donnée éditoriale | Différence | Action proposée |
|---|---|---|---|---|
| Dune du Pilat | type actuel: dune; source OSM: relation/2244861; coord. seed: 44.5889775, -1.2142045 | type éditorial: dune; représentations: relation/2244861, node/9597543783, node/3726353536, node/1785218583; coord. éditoriales: 44.58, -1.22 | type identique; plusieurs représentations OSM côté éditorial; écart de coordonnées d'environ 1099 m | NO_CHANGE |
| Banc d'Arguin | type actuel: nature; source OSM: relation/2244863; coord. seed: 44.5829443, -1.2384633 | type éditorial: sandbank; représentation principale: way/42726876; coord. éditoriales: 44.57, -1.26 | changement de classification + changement de représentation OSM principale + écart d'environ 2232 m | MANUAL_REVIEW |
| Port de Larros | type actuel: harbour; source OSM: relation/3789458; coord. seed: 44.6438004, -1.0718774 | type éditorial: oyster_harbour; représentations: way/444290457, relation/3789458; coord. éditoriales: 44.64, -1.07 | conflit entre type éditorial et type attendu du mapping; la relation historique existe toujours; écart d'environ 448 m | NO_CHANGE |
| Phare du Cap-Ferret | type actuel: lighthouse; source OSM: way/715849418; coord. seed: 44.6459630, -1.2488155 | type éditorial: lighthouse; représentation principale: way/715849418; coord. éditoriales: 44.65, -1.25 | type identique; même représentation principale; écart d'environ 459 m | NO_CHANGE |
| Réserve ornithologique du Teich | type actuel: nature; source OSM: way/279790575; coord. seed: 44.6467880, -1.0359566 | type éditorial: bird_reserve; représentation principale: way/279790575; coord. éditoriales: 44.65, -1.04 | différence de classification; représentation OSM identique; écart d'environ 479 m | UPDATE_SPOT_TYPE_ONLY |
| Observatoire Sainte-Cécile | type actuel: architecture; source OSM: way/113325940; coord. seed: 44.6593442, -1.1753685 | type éditorial: observatory; représentation principale: way/113325940; coord. éditoriales: 44.66, -1.18 | différence de classification; représentation OSM identique; écart d'environ 374 m; tags source: man_made=tower, tower:type=observation | UPDATE_SPOT_TYPE_ONLY |

### Différences de types

| Spot | Type actuel | Type éditorial | Type PhotoAtlas attendu | spot_type_id attendu | Lecture technique |
|---|---|---|---|---|---|
| Dune du Pilat | dune | dune | dune | lookup public.spot_types.id where slug = dune | différence de type: aucune |
| Banc d'Arguin | nature | sandbank | sandbank | lookup public.spot_types.id where slug = sandbank | la cible PhotoAtlas attendue est plus spécifique que le type actuel |
| Port de Larros | harbour | oyster_harbour | harbour | lookup public.spot_types.id where slug = harbour | le mapping pilote et l'attendu de fusion restent harbour |
| Phare du Cap-Ferret | lighthouse | lighthouse | lighthouse | lookup public.spot_types.id where slug = lighthouse | différence de type: aucune |
| Réserve ornithologique du Teich | nature | bird_reserve | bird_reserve | lookup public.spot_types.id where slug = bird_reserve | la cible PhotoAtlas attendue est plus spécifique que le type actuel |
| Observatoire Sainte-Cécile | architecture | observatory | observatory | lookup public.spot_types.id where slug = observatory | la cible PhotoAtlas attendue est plus spécifique que le type actuel |

### Différences de coordonnées

| Spot | Latitude actuelle | Longitude actuelle | Latitude éditoriale | Longitude éditoriale | Écart approx. | Lecture |
|---|---:|---:|---:|---:|---:|---|
| Dune du Pilat | 44.5889775 | -1.2142045 | 44.58 | -1.22 | 1099 m | différence importante mais cohérente avec des représentations multiples d'une grande entité |
| Banc d'Arguin | 44.5829443 | -1.2384633 | 44.57 | -1.26 | 2232 m | différence importante, liée à une représentation OSM différente |
| Port de Larros | 44.6438004 | -1.0718774 | 44.64 | -1.07 | 448 m | différence modérée, sans justification d'écrasement automatique |
| Phare du Cap-Ferret | 44.6459630 | -1.2488155 | 44.65 | -1.25 | 459 m | différence modérée, sans justification d'écrasement automatique |
| Réserve ornithologique du Teich | 44.6467880 | -1.0359566 | 44.65 | -1.04 | 479 m | différence modérée, sans justification d'écrasement automatique |
| Observatoire Sainte-Cécile | 44.6593442 | -1.1753685 | 44.66 | -1.18 | 374 m | différence modérée, sans justification d'écrasement automatique |

### Actions proposées

| Spot | Action | Motif |
|---|---|---|
| Dune du Pilat | NO_CHANGE | le type actuel, le type éditorial et le type attendu sont déjà alignés; les autres différences concernent la géométrie représentative et les représentations OSM |
| Banc d'Arguin | MANUAL_REVIEW | le changement ne porte pas seulement sur le type: l'ancrage OSM principal et les coordonnées diffèrent aussi |
| Port de Larros | NO_CHANGE | le type actuel et le type attendu de fusion restent harbour; la divergence provient du catalogue éditorial, pas du mapping pilote |
| Phare du Cap-Ferret | NO_CHANGE | le type est déjà correct et aucune autre modification ne doit être proposée |
| Réserve ornithologique du Teich | UPDATE_SPOT_TYPE_ONLY | la différence utile et explicitement prévue porte sur le rattachement au type bird_reserve |
| Observatoire Sainte-Cécile | UPDATE_SPOT_TYPE_ONLY | la différence utile et explicitement prévue porte sur le rattachement au type observatory |

### Nouveaux spots

Les 12 nouveaux spots Premium ont été revérifiés uniquement sur les critères demandés.

| Spot | Type PhotoAtlas | spot_type_id attendu | Coordonnées valides |
|---|---|---|---|
| Feu de Sainte Barbe | lighthouse | lookup public.spot_types.id where slug = lighthouse | oui |
| Phare d'Hourtin | lighthouse | lookup public.spot_types.id where slug = lighthouse | oui |
| Phare de Ciboure | lighthouse | lookup public.spot_types.id where slug = lighthouse | oui |
| Phare de Contis | lighthouse | lookup public.spot_types.id where slug = lighthouse | oui |
| Phare de la Pointe de Grave | lighthouse | lookup public.spot_types.id where slug = lighthouse | oui |
| Phare de Patiras | lighthouse | lookup public.spot_types.id where slug = lighthouse | oui |
| Phare Saint-Nicolas | lighthouse | lookup public.spot_types.id where slug = lighthouse | oui |
| Port de Gujan | oyster_harbour | lookup public.spot_types.id where slug = oyster_harbour | oui |
| Port de la Mole | oyster_harbour | lookup public.spot_types.id where slug = oyster_harbour | oui |
| Port de Meyran | oyster_harbour | lookup public.spot_types.id where slug = oyster_harbour | oui |
| Observatoire de Bordeaux | observatory | lookup public.spot_types.id where slug = observatory | oui |
| Phare de la Pointe Saint-Martin | viewpoint | lookup public.spot_types.id where slug = viewpoint | oui |

### Compatibilités

Les 7 types utilisés par les 18 Premium sont présents dans le référentiel local et disposent chacun des 5 compatibilités attendues dans le seed de référence.

| Type | landscape | sunrise | sunset | storm | astro |
|---|---|---|---|---|---|
| bird_reserve | oui | oui | oui | oui | oui |
| dune | oui | oui | oui | oui | oui |
| lighthouse | oui | oui | oui | oui | oui |
| observatory | oui | oui | oui | oui | oui |
| oyster_harbour | oui | oui | oui | oui | oui |
| sandbank | oui | oui | oui | oui | oui |
| viewpoint | oui | oui | oui | oui | oui |

### Risques

- Le catalogue éditorial arrondit les coordonnées; il ne doit donc pas écraser automatiquement les positions des spots existants.
- Banc d'Arguin combine une différence de type, de représentation OSM et de position représentative; ce n'est pas un simple update de classification.
- Port de Larros présente une divergence entre type éditorial et type attendu de fusion; cette divergence doit être arbitrée hors import automatique.
- Dune du Pilat doit rester un seul spot malgré ses représentations OSM multiples.
- Aucune action proposée ne touche description, potentiels, status, nom ou coordonnées existantes.