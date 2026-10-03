-- PhotoAtlas Aquitaine editorial dry-run
-- Read-only planning file. No data changes.

with editorial_premium as (
  select * from (
    ('Banc d''Arguin', 'banc-d-arguin', 'sandbank', 'Littoral', 80, 40, 54, 'HIGH', 44.57, -1.26, 'way/42726876', 'natural=coastline', 'Grande zone littorale nommée, distincte et associée à une réserve naturelle explicitement documentée.'),
    ('Dune du Pilat', 'dune-du-pilat', 'dune', 'Littoral', 88, 64, 75, 'HIGH', 44.58, -1.22, 'relation/2244861', 'natural=dune', 'Grande dune explicitement documentée en natural=dune et landform=dune_system, avec contexte local riche.'),
    ('Feu de Sainte Barbe', 'feu-de-sainte-barbe', 'lighthouse', 'Maritime', 80, 56, 52, 'HIGH', 43.4, -1.66, 'node/2013114667', 'man_made=lighthouse', 'Feu maritime identifié avec description locale explicite, structure technique et contexte littoral fort.'),
    ('Phare d''Hourtin', 'phare-d-hourtin', 'lighthouse', 'Maritime', 89, 82, 66, 'HIGH', 45.14, -1.16, 'way/513934973', 'man_made=lighthouse', 'Phare patrimonial documenté, structure distincte et contexte littoral cohérent.'),
    ('Phare de Ciboure', 'phare-de-ciboure', 'lighthouse', 'Maritime', 90, 90, 62, 'HIGH', 43.38, -1.67, 'way/72598412', 'man_made=lighthouse', 'Phare patrimonial documenté, avec description locale, heritage, ref:mhs et contexte portuaire fort.'),
    ('Phare de Contis', 'phare-de-contis', 'lighthouse', 'Maritime', 88, 82, 62, 'HIGH', 44.09, -1.32, 'way/201248452', 'man_made=lighthouse', 'Phare patrimonial documenté, structure distincte et contexte littoral lisible.'),
    ('Phare de la Pointe de Grave', 'phare-de-la-pointe-de-grave', 'lighthouse', 'Maritime', 89, 82, 66, 'HIGH', 45.57, -1.07, 'way/759021127', 'man_made=lighthouse', 'Phare patrimonial très documenté, structure distincte et contexte portuaire/littoral dense.'),
    ('Phare de Patiras', 'phare-de-patiras', 'lighthouse', 'Maritime', 85, 64, 66, 'HIGH', 45.2, -0.72, 'way/162906928', 'man_made=lighthouse', 'Phare identifié et documenté, avec structure distincte et contexte maritime cohérent.'),
    ('Phare du Cap-Ferret', 'phare-du-cap-ferret', 'lighthouse', 'Maritime', 88, 82, 62, 'HIGH', 44.65, -1.25, 'way/715849418', 'man_made=lighthouse', 'Phare patrimonial très documenté, structure très caractérisée et contexte littoral riche.'),
    ('Phare Saint-Nicolas', 'phare-saint-nicolas', 'lighthouse', 'Maritime', 84, 56, 66, 'HIGH', 45.56, -1.08, 'way/192421345', 'man_made=lighthouse', 'Phare identifié avec documentation technique et structure distincte.'),
    ('Port de Gujan', 'port-de-gujan', 'oyster_harbour', 'Maritime', 80, 48, 50, 'HIGH', 44.64, -1.08, 'way/285592011', 'harbour=yes', 'Port ostréicole explicitement décrit, structure portuaire lisible et contexte local dense.'),
    ('Port de la Mole', 'port-de-la-mole', 'oyster_harbour', 'Maritime', 80, 48, 52, 'HIGH', 44.64, -1.05, 'node/7512119236', 'leisure=marina', 'Port ostréicole explicitement décrit, destination locale identifiable et contexte portuaire cohérent.'),
    ('Port de Larros', 'port-de-larros', 'oyster_harbour', 'Maritime', 82, 56, 62, 'HIGH', 44.64, -1.07, 'way/444290457', 'harbour=yes', 'Port ostréicole explicitement décrit, structure portuaire lisible et contexte local dense.'),
    ('Port de Meyran', 'port-de-meyran', 'oyster_harbour', 'Maritime', 80, 48, 50, 'HIGH', 44.64, -1.1, 'way/286188443', 'harbour=yes', 'Port ostréicole explicitement décrit, destination locale identifiable et contexte portuaire cohérent.'),
    ('Réserve ornithologique du Teich', 'reserve-ornithologique-du-teich', 'bird_reserve', 'Nature', 80, 56, 50, 'HIGH', 44.65, -1.04, 'way/279790575', 'leisure=nature_reserve', 'Réserve naturelle ornithologique explicitement nommée, protégée et structurée par plusieurs observatoires.'),
    ('Observatoire de Bordeaux', 'observatoire-de-bordeaux', 'observatory', 'Observation', 80, 56, 52, 'HIGH', 44.83, -0.53, 'way/305715700', 'man_made=observatory', 'Fonction d''observation explicitement établie, documentation croisée et contexte local de visite.'),
    ('Observatoire Sainte-Cécile', 'observatoire-sainte-cecile', 'observatory', 'Observation', 85, 66, 64, 'HIGH', 44.66, -1.18, 'way/113325940', 'tower:type=observation', 'Fonction d''observation explicitement établie, documentation locale présente, contexte littoral et urbain lisible.'),
    ('Phare de la Pointe Saint-Martin', 'phare-de-la-pointe-saint-martin', 'viewpoint', 'Relief', 83, 70, 51, 'HIGH', 43.49, -1.55, 'way/71996554', 'tourism=viewpoint', 'Phare patrimonial et visitable, avec viewpoint associé, documentation croisée et contexte littoral lisible.')
  ) as t(
    name,
    slug,
    photo_atlas_type,
    photo_atlas_family,
    premium_score,
    remarkable_score,
    photographic_score,
    confidence,
    latitude,
    longitude,
    source_external_id,
    source_type,
    editorial_reason
  )
),
resolved_types as (
  select
    e.*,
    st.id as spot_type_id,
    st.slug as spot_type_slug,
    st.name as spot_type_name
  from editorial_premium e
  left join public.spot_types st
    on st.slug = e.photo_atlas_type
),
compatibility_counts as (
  select
    rt.photo_atlas_type,
    count(*) filter (where spc.spot_type_id is not null) as compat_count,
    string_agg(pt.slug, ', ' order by pt.slug) as compat_photo_types
  from resolved_types rt
  left join public.spot_types st
    on st.slug = rt.photo_atlas_type
  left join public.spot_photo_compatibility spc
    on spc.spot_type_id = st.id
  left join public.photo_types pt
    on pt.id = spc.photo_type_id
  group by rt.photo_atlas_type
),
existing_match as (
  select
    rt.name,
    rt.slug,
    rt.photo_atlas_type,
    rt.photo_atlas_family,
    rt.premium_score,
    rt.remarkable_score,
    rt.photographic_score,
    rt.confidence,
    rt.latitude as editorial_latitude,
    rt.longitude as editorial_longitude,
    rt.source_external_id,
    s.id as spot_id,
    s.slug as existing_slug,
    s.name as existing_name,
    s.source as existing_source,
    s.source_external_id as existing_source_external_id,
    s.spot_type as existing_spot_type,
    s.spot_type_id as existing_spot_type_id,
    st.slug as existing_spot_type_slug,
    st.name as existing_spot_type_name,
    st_y(s.position::geometry) as existing_latitude,
    st_x(s.position::geometry) as existing_longitude,
    case
      when s.id is null then 'new'
      when s.slug = rt.slug and s.source = 'osm' and s.source_external_id = rt.source_external_id then 'existing'
      else 'potential_duplicate'
    end as match_status
  from resolved_types rt
  left join public.spots s
    on s.slug = rt.slug
    or (rt.source_external_id <> '' and s.source = 'osm' and s.source_external_id = rt.source_external_id)
    or (
      abs(st_y(s.position::geometry) - rt.latitude) < 0.01
      and abs(st_x(s.position::geometry) - rt.longitude) < 0.01
    )
  left join public.spot_types st
    on st.id = s.spot_type_id
)
select
  'premium_count' as section,
  count(*) as premium_count
from editorial_premium

union all

select
  'type_coverage' as section,
  count(*) as premium_count
from compatibility_counts
;

select
  rt.name,
  rt.photo_atlas_type,
  rt.spot_type_id,
  rt.spot_type_slug,
  rt.spot_type_name
from resolved_types rt
order by rt.photo_atlas_type, rt.name;

select
  cc.photo_atlas_type,
  cc.compat_count,
  cc.compat_photo_types
from compatibility_counts cc
order by cc.photo_atlas_type;

select
  em.name,
  em.slug,
  em.match_status,
  em.existing_slug,
  em.existing_name,
  em.existing_source,
  em.existing_source_external_id,
  em.existing_spot_type,
  em.existing_spot_type_slug,
  em.existing_spot_type_name,
  round((em.existing_latitude - em.editorial_latitude)::numeric, 6) as latitude_delta,
  round((em.existing_longitude - em.editorial_longitude)::numeric, 6) as longitude_delta
from existing_match em
order by em.name;

select
  e.name,
  e.slug,
  e.photo_atlas_type,
  e.photo_atlas_family,
  e.latitude,
  e.longitude,
  e.source_external_id,
  e.source_type,
  e.premium_score,
  e.remarkable_score,
  e.photographic_score,
  e.confidence,
  e.editorial_reason
from editorial_premium e
left join public.spots s on s.slug = e.slug
where s.id is null
order by e.name;

select
  c.name,
  c.editorial,
  case
    when c.name in ('Dune du Pilat','Banc d''Arguin','Port de Larros','Phare du Cap-Ferret','Réserve ornithologique du Teich','Observatoire Sainte-Cécile','Port ostréicole de La Teste','Jetée d''Andernos','Jetée de Bélisaire','Plage du Moulleau') then 'yes'
    else 'no'
  end as exists_in_supabase,
  c.action
from (
  values
    ('Dune du Pilat', 'premium', 'keep existing'),
    ('Banc d''Arguin', 'premium', 'keep existing'),
    ('Port de Larros', 'premium', 'keep existing'),
    ('Port ostréicole de La Teste', 'review', 'keep review / no premium import'),
    ('Jetée d''Andernos', 'review', 'keep review / no premium import'),
    ('Jetée de Bélisaire', 'review', 'keep review / no premium import'),
    ('Phare du Cap-Ferret', 'premium', 'keep existing'),
    ('Plage du Moulleau', 'review', 'keep review / no premium import'),
    ('Réserve ornithologique du Teich', 'premium', 'keep existing'),
    ('Observatoire Sainte-Cécile', 'premium', 'keep existing')
) as c(name, editorial, action)
order by c.name;
