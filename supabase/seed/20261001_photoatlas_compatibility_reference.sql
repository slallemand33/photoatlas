begin;

with root_types(slug, name, description) as (
  values
    ('littoral', 'Littoral', 'Famille des spots cotiers orientes mer, sable, falaises et marais littoraux.'),
    ('maritime', 'Maritime', 'Famille des infrastructures et reperes lies aux ports, jetees et activites maritimes.'),
    ('nature', 'Nature', 'Famille des spots naturels continentaux, humides ou reserves biologiques.'),
    ('relief', 'Relief', 'Famille des spots de montagne, de points hauts et de formes du terrain.'),
    ('architecture', 'Architecture & patrimoine', 'Famille des sujets batis, historiques ou contemporains.'),
    ('observation', 'Observation', 'Famille des sites dedies a l observation du ciel ou des panoramas specialises.'),
    ('faune', 'Faune', 'Famille des lieux principalement motives par l observation animale.'),
    ('structures', 'Structures', 'Famille des ouvrages techniques ou industriels servant de sujet principal.')
)
insert into public.spot_types (slug, name, parent_id, description)
select slug, name, null, description
from root_types
on conflict (slug) do nothing;

with leaf_types(slug, name, parent_slug, description) as (
  values
    ('beach', 'Plage', 'littoral', 'Spot principal centre sur une plage ou un front de mer sableux.'),
    ('dune', 'Dune', 'littoral', 'Spot principal centre sur une dune ou un systeme dunaire.'),
    ('sandbank', 'Banc de sable', 'littoral', 'Spot principal centre sur un banc de sable ou une langue sableuse.'),
    ('sea_cliff', 'Falaise maritime', 'littoral', 'Spot principal centre sur une falaise en bord de mer.'),
    ('rocky_coast', 'Cote rocheuse', 'littoral', 'Spot principal centre sur un littoral rocheux.'),
    ('bay', 'Baie / anse', 'littoral', 'Spot principal centre sur une baie, une anse ou un rentrant cotier.'),
    ('estuary', 'Estuaire', 'littoral', 'Spot principal centre sur une embouchure ou un estuaire.'),
    ('coastal_marsh', 'Marais cotier', 'littoral', 'Spot principal centre sur des marais littoraux ou pres-sales.'),

    ('harbour', 'Port', 'maritime', 'Spot principal centre sur un port, une marina ou un bassin portuaire.'),
    ('oyster_harbour', 'Port ostreicole', 'maritime', 'Spot principal centre sur un port ostreicole et ses cabanes ou pontons.'),
    ('pier', 'Jetee', 'maritime', 'Spot principal centre sur une jetee ou un acces avance sur l eau.'),
    ('quay', 'Quai', 'maritime', 'Spot principal centre sur un quai, une promenade portuaire ou un linteau de bassin.'),
    ('ponton', 'Ponton', 'maritime', 'Spot principal centre sur un ponton leger ou un embarcadere.'),
    ('lighthouse', 'Phare', 'maritime', 'Spot principal centre sur un phare ou un feu maritime majeur.'),
    ('lock', 'Ecluse', 'maritime', 'Spot principal centre sur une ecluse ou un ouvrage de navigation lie a l eau.'),

    ('forest', 'Foret', 'nature', 'Spot principal centre sur un milieu forestier.'),
    ('lake', 'Lac', 'nature', 'Spot principal centre sur un lac naturel ou retenue d allure lacustre.'),
    ('pond', 'Etang', 'nature', 'Spot principal centre sur un etang ou un petit plan d eau.'),
    ('river', 'Riviere', 'nature', 'Spot principal centre sur un cours d eau ou une portion de riviere.'),
    ('waterfall', 'Cascade', 'nature', 'Spot principal centre sur une cascade ou chute d eau.'),
    ('wetland', 'Zone humide', 'nature', 'Spot principal centre sur une zone humide interieure.'),
    ('nature_reserve', 'Reserve naturelle', 'nature', 'Spot principal centre sur une reserve naturelle.'),
    ('bird_reserve', 'Reserve ornithologique', 'nature', 'Spot principal centre sur une reserve ornithologique ou avifaune.'),
    ('countryside', 'Prairie / campagne', 'nature', 'Spot principal centre sur un paysage rural ouvert ou agricole.'),

    ('mountain', 'Montagne', 'relief', 'Spot principal centre sur un massif montagneux.'),
    ('summit', 'Sommet', 'relief', 'Spot principal centre sur un sommet ou point haut culminant.'),
    ('mountain_pass', 'Col', 'relief', 'Spot principal centre sur un col ou passage entre reliefs.'),
    ('valley', 'Vallee', 'relief', 'Spot principal centre sur une vallee.'),
    ('gorge', 'Gorge', 'relief', 'Spot principal centre sur une gorge ou canyon etroit.'),
    ('plateau', 'Plateau', 'relief', 'Spot principal centre sur un plateau ou haut plat ouvert.'),
    ('viewpoint', 'Point de vue', 'relief', 'Spot principal centre sur un belvedere ou un point de vue reconnu.'),

    ('castle', 'Chateau', 'architecture', 'Spot principal centre sur un chateau.'),
    ('religious_building', 'Eglise / edifice religieux', 'architecture', 'Spot principal centre sur un edifice religieux.'),
    ('abbey', 'Abbaye', 'architecture', 'Spot principal centre sur une abbaye.'),
    ('fortification', 'Fortification', 'architecture', 'Spot principal centre sur une fortification.'),
    ('ruins', 'Ruines', 'architecture', 'Spot principal centre sur des ruines.'),
    ('monument', 'Monument', 'architecture', 'Spot principal centre sur un monument isole.'),
    ('bridge', 'Pont', 'architecture', 'Spot principal centre sur un pont ou viaduc.'),
    ('village', 'Village remarquable', 'architecture', 'Spot principal centre sur un village patrimonial ou remarquable.'),
    ('modern_architecture', 'Architecture contemporaine', 'architecture', 'Spot principal centre sur une architecture contemporaine.'),
    ('industrial_architecture', 'Architecture industrielle', 'architecture', 'Spot principal centre sur une architecture industrielle ou technique patrimoniale.'),

    ('observatory', 'Observatoire', 'observation', 'Spot principal centre sur un observatoire, une tour d observation ou un equipement de lecture du paysage ou du ciel.'),
    ('dark_sky_site', 'Site astronomique', 'observation', 'Spot principal centre sur un site connu pour l observation du ciel nocturne.'),

    ('wildlife_site', 'Site d''observation animale', 'faune', 'Spot principal centre sur l observation de la faune.'),
    ('animal_colony', 'Colonie animale', 'faune', 'Spot principal centre sur une colonie animale identifiee.'),
    ('wildlife_park', 'Parc animalier', 'faune', 'Spot principal centre sur un parc animalier ou reserve amenagee.'),

    ('mill', 'Moulin', 'structures', 'Spot principal centre sur un moulin.'),
    ('quarry', 'Carriere', 'structures', 'Spot principal centre sur une carriere ou excavation remarquable.'),
    ('dam', 'Barrage', 'structures', 'Spot principal centre sur un barrage.'),
    ('wind_farm', 'Eoliennes', 'structures', 'Spot principal centre sur un parc eolien.'),
    ('infrastructure', 'Infrastructure', 'structures', 'Spot principal centre sur une infrastructure technique sans type plus precis.'),

    ('other', 'Autre', null, 'Type de secours lorsque la classification normalisee n est pas encore determinee.')
)
insert into public.spot_types (slug, name, parent_id, description)
select
  leaf_types.slug,
  leaf_types.name,
  parent.id,
  leaf_types.description
from leaf_types
left join public.spot_types as parent
  on parent.slug = leaf_types.parent_slug
on conflict (slug) do nothing;

with photo_types(slug, name, description) as (
  values
    ('landscape', 'Paysage', 'Photographie de paysage au sens large, hors specialisation horaire ou meteorologique.'),
    ('sunrise', 'Lever de soleil', 'Photographie orientee lever de soleil et lumiere du matin.'),
    ('sunset', 'Coucher de soleil', 'Photographie orientee coucher de soleil et lumiere du soir.'),
    ('storm', 'Orages', 'Photographie de cellules orageuses, ciels dramatiques et eclairs.'),
    ('astro', 'Astro', 'Photographie nocturne du ciel, de la Voie Lactee et des scenes a dominante astronomique.')
)
insert into public.photo_types (slug, name, description)
select slug, name, description
from photo_types
on conflict (slug) do nothing;

with compatibility_matrix(spot_type_slug, landscape, sunrise, sunset, storm, astro) as (
  values
    ('beach', 1.00, 0.90, 1.00, 0.75, 0.60),
    ('dune', 1.00, 0.95, 1.00, 0.85, 0.70),
    ('sandbank', 0.95, 0.90, 0.95, 0.75, 0.65),
    ('sea_cliff', 1.00, 0.90, 0.95, 0.95, 0.75),
    ('rocky_coast', 0.95, 0.90, 0.95, 0.90, 0.70),
    ('bay', 0.95, 0.90, 0.95, 0.80, 0.65),
    ('estuary', 0.95, 0.90, 0.95, 0.80, 0.60),
    ('coastal_marsh', 0.85, 0.85, 0.85, 0.65, 0.55),

    ('harbour', 0.75, 0.70, 0.80, 0.70, 0.30),
    ('oyster_harbour', 0.90, 0.80, 0.90, 0.75, 0.35),
    ('pier', 0.85, 0.85, 0.90, 0.90, 0.55),
    ('quay', 0.75, 0.70, 0.80, 0.75, 0.30),
    ('lighthouse', 0.90, 0.85, 0.90, 1.00, 0.45),
    ('ponton', 0.75, 0.75, 0.85, 0.70, 0.45),
    ('lock', 0.70, 0.65, 0.70, 0.75, 0.30),

    ('forest', 0.95, 0.75, 0.70, 0.65, 0.65),
    ('lake', 0.95, 0.90, 0.95, 0.80, 0.80),
    ('pond', 0.90, 0.85, 0.90, 0.75, 0.70),
    ('river', 0.90, 0.80, 0.80, 0.75, 0.60),
    ('waterfall', 0.95, 0.70, 0.70, 0.70, 0.40),
    ('wetland', 0.90, 0.90, 0.90, 0.70, 0.60),
    ('nature_reserve', 0.90, 0.85, 0.80, 0.60, 0.50),
    ('bird_reserve', 0.85, 0.80, 0.75, 0.45, 0.35),
    ('countryside', 0.90, 0.90, 0.90, 0.75, 0.75),

    ('mountain', 1.00, 0.95, 1.00, 0.95, 0.85),
    ('summit', 1.00, 1.00, 1.00, 0.95, 0.90),
    ('mountain_pass', 0.90, 0.85, 0.85, 0.85, 0.80),
    ('valley', 0.95, 0.75, 0.80, 0.85, 0.65),
    ('gorge', 0.95, 0.65, 0.65, 0.80, 0.55),
    ('plateau', 0.95, 0.90, 0.95, 0.90, 0.90),
    ('viewpoint', 1.00, 0.95, 1.00, 0.90, 0.85),

    ('castle', 0.90, 0.75, 0.90, 0.90, 0.45),
    ('religious_building', 0.75, 0.65, 0.75, 0.75, 0.40),
    ('abbey', 0.80, 0.65, 0.80, 0.80, 0.45),
    ('fortification', 0.90, 0.75, 0.90, 0.95, 0.50),
    ('ruins', 0.90, 0.75, 0.90, 0.95, 0.60),
    ('monument', 0.75, 0.65, 0.75, 0.80, 0.40),
    ('bridge', 0.85, 0.80, 0.90, 0.85, 0.50),
    ('village', 0.90, 0.80, 0.90, 0.80, 0.45),
    ('modern_architecture', 0.75, 0.70, 0.80, 0.80, 0.35),
    ('industrial_architecture', 0.85, 0.75, 0.85, 0.90, 0.45),

    ('observatory', 0.70, 0.65, 0.65, 0.50, 0.90),
    ('dark_sky_site', 0.60, 0.55, 0.55, 0.40, 1.00),

    ('wildlife_site', 0.80, 0.85, 0.80, 0.40, 0.30),
    ('animal_colony', 0.75, 0.85, 0.80, 0.35, 0.20),
    ('wildlife_park', 0.65, 0.70, 0.65, 0.30, 0.15),

    ('mill', 0.90, 0.85, 0.95, 0.90, 0.50),
    ('quarry', 0.95, 0.80, 0.85, 0.90, 0.65),
    ('dam', 0.90, 0.80, 0.85, 0.90, 0.45),
    ('wind_farm', 0.80, 0.85, 0.90, 0.85, 0.50),
    ('infrastructure', 0.70, 0.65, 0.75, 0.80, 0.35),

    ('other', 0.50, 0.50, 0.50, 0.50, 0.50)
),
compatibility_rows(spot_type_slug, photo_type_slug, compatibility) as (
  select spot_type_slug, 'landscape', landscape from compatibility_matrix
  union all
  select spot_type_slug, 'sunrise', sunrise from compatibility_matrix
  union all
  select spot_type_slug, 'sunset', sunset from compatibility_matrix
  union all
  select spot_type_slug, 'storm', storm from compatibility_matrix
  union all
  select spot_type_slug, 'astro', astro from compatibility_matrix
)
insert into public.spot_photo_compatibility (spot_type_id, photo_type_id, compatibility)
select
  spot_types.id,
  photo_types.id,
  compatibility_rows.compatibility
from compatibility_rows
join public.spot_types as spot_types
  on spot_types.slug = compatibility_rows.spot_type_slug
join public.photo_types as photo_types
  on photo_types.slug = compatibility_rows.photo_type_slug
on conflict (spot_type_id, photo_type_id) do nothing;

commit;

select count(*) as root_family_count
from public.spot_types
where slug in (
  'littoral',
  'maritime',
  'nature',
  'relief',
  'architecture',
  'observation',
  'faune',
  'structures'
);

select count(*) as leaf_spot_type_count
from public.spot_types
where parent_id is not null
   or slug = 'other';

select count(*) as photo_type_count
from public.photo_types
where slug in ('landscape', 'sunrise', 'sunset', 'storm', 'astro');

select count(*) as spot_photo_compatibility_count
from public.spot_photo_compatibility
join public.spot_types on public.spot_types.id = public.spot_photo_compatibility.spot_type_id
join public.photo_types on public.photo_types.id = public.spot_photo_compatibility.photo_type_id
where (public.spot_types.parent_id is not null or public.spot_types.slug = 'other')
  and public.photo_types.slug in ('landscape', 'sunrise', 'sunset', 'storm', 'astro');