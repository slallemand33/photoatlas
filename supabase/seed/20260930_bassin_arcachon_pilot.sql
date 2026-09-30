begin;

delete from public.spots
where slug in (
  'photoatlas-test-verified',
  'photoatlas-test-candidate',
  'photoatlas-test-rejected'
);

do $$
declare
  slug_conflict text;
  source_conflict text;
begin
  select s.slug
  into slug_conflict
  from public.spots as s
  where s.slug in (
    'dune-du-pilat',
    'banc-d-arguin',
    'port-ostreicole-de-la-teste',
    'observatoire-sainte-cecile',
    'plage-du-moulleau',
    'reserve-ornithologique-du-teich',
    'port-de-larros',
    'jetee-d-andernos',
    'phare-du-cap-ferret',
    'jetee-belisaire'
  )
  and (
    (s.slug = 'dune-du-pilat' and (s.source <> 'osm' or s.source_external_id is distinct from 'relation/2244861')) or
    (s.slug = 'banc-d-arguin' and (s.source <> 'osm' or s.source_external_id is distinct from 'relation/2244863')) or
    (s.slug = 'port-ostreicole-de-la-teste' and (s.source <> 'osm' or s.source_external_id is distinct from 'way/835299189')) or
    (s.slug = 'observatoire-sainte-cecile' and (s.source <> 'osm' or s.source_external_id is distinct from 'way/113325940')) or
    (s.slug = 'plage-du-moulleau' and (s.source <> 'osm' or s.source_external_id is distinct from 'way/41642437')) or
    (s.slug = 'reserve-ornithologique-du-teich' and (s.source <> 'osm' or s.source_external_id is distinct from 'way/279790575')) or
    (s.slug = 'port-de-larros' and (s.source <> 'osm' or s.source_external_id is distinct from 'relation/3789458')) or
    (s.slug = 'jetee-d-andernos' and (s.source <> 'osm' or s.source_external_id is distinct from 'way/51732433')) or
    (s.slug = 'phare-du-cap-ferret' and (s.source <> 'osm' or s.source_external_id is distinct from 'way/715849418')) or
    (s.slug = 'jetee-belisaire' and (s.source <> 'osm' or s.source_external_id is distinct from 'node/406370940'))
  )
  limit 1;

  if slug_conflict is not null then
    raise exception 'Seed pilote Bassin d''Arcachon interrompu : conflit detecte sur le slug %', slug_conflict;
  end if;

  select s.source || '/' || s.source_external_id
  into source_conflict
  from public.spots as s
  where (s.source, s.source_external_id) in (
    ('osm', 'relation/2244861'),
    ('osm', 'relation/2244863'),
    ('osm', 'way/835299189'),
    ('osm', 'way/113325940'),
    ('osm', 'way/41642437'),
    ('osm', 'way/279790575'),
    ('osm', 'relation/3789458'),
    ('osm', 'way/51732433'),
    ('osm', 'way/715849418'),
    ('osm', 'node/406370940')
  )
  and (
    (s.source = 'osm' and s.source_external_id = 'relation/2244861' and s.slug <> 'dune-du-pilat') or
    (s.source = 'osm' and s.source_external_id = 'relation/2244863' and s.slug <> 'banc-d-arguin') or
    (s.source = 'osm' and s.source_external_id = 'way/835299189' and s.slug <> 'port-ostreicole-de-la-teste') or
    (s.source = 'osm' and s.source_external_id = 'way/113325940' and s.slug <> 'observatoire-sainte-cecile') or
    (s.source = 'osm' and s.source_external_id = 'way/41642437' and s.slug <> 'plage-du-moulleau') or
    (s.source = 'osm' and s.source_external_id = 'way/279790575' and s.slug <> 'reserve-ornithologique-du-teich') or
    (s.source = 'osm' and s.source_external_id = 'relation/3789458' and s.slug <> 'port-de-larros') or
    (s.source = 'osm' and s.source_external_id = 'way/51732433' and s.slug <> 'jetee-d-andernos') or
    (s.source = 'osm' and s.source_external_id = 'way/715849418' and s.slug <> 'phare-du-cap-ferret') or
    (s.source = 'osm' and s.source_external_id = 'node/406370940' and s.slug <> 'jetee-belisaire')
  )
  limit 1;

  if source_conflict is not null then
    raise exception 'Seed pilote Bassin d''Arcachon interrompu : conflit detecte sur source/source_external_id %', source_conflict;
  end if;
end;
$$;

insert into public.spots (
  name,
  slug,
  position,
  country_code,
  region,
  locality,
  spot_type,
  source,
  source_external_id,
  source_type,
  status,
  description,
  landscape_potential,
  sunrise_potential,
  sunset_potential,
  astro_potential
)
values
  (
    'Dune du Pilat',
    'dune-du-pilat',
    st_setsrid(st_makepoint(-1.2142045, 44.5889775), 4326)::geography,
    'FR',
    'Nouvelle-Aquitaine',
    'La Teste-de-Buch',
    'dune',
    'osm',
    'relation/2244861',
    'natural=dune',
    'candidate',
    null,
    null,
    null,
    null,
    null
  ),
  (
    'Banc d''Arguin',
    'banc-d-arguin',
    st_setsrid(st_makepoint(-1.2384633, 44.5829443), 4326)::geography,
    'FR',
    'Nouvelle-Aquitaine',
    'La Teste-de-Buch',
    'nature',
    'osm',
    'relation/2244863',
    'natural=sand',
    'candidate',
    null,
    null,
    null,
    null,
    null
  ),
  (
    'Port ostréicole de La Teste',
    'port-ostreicole-de-la-teste',
    st_setsrid(st_makepoint(-1.1448522, 44.6416272), 4326)::geography,
    'FR',
    'Nouvelle-Aquitaine',
    'La Teste-de-Buch',
    'harbour',
    'osm',
    'way/835299189',
    'leisure=marina',
    'candidate',
    null,
    null,
    null,
    null,
    null
  ),
  (
    'Observatoire Sainte-Cécile',
    'observatoire-sainte-cecile',
    st_setsrid(st_makepoint(-1.1753685, 44.6593442), 4326)::geography,
    'FR',
    'Nouvelle-Aquitaine',
    'Arcachon',
    'architecture',
    'osm',
    'way/113325940',
    'man_made=tower',
    'candidate',
    null,
    null,
    null,
    null,
    null
  ),
  (
    'Plage du Moulleau',
    'plage-du-moulleau',
    st_setsrid(st_makepoint(-1.2033293, 44.6421543), 4326)::geography,
    'FR',
    'Nouvelle-Aquitaine',
    'Arcachon',
    'beach',
    'osm',
    'way/41642437',
    'natural=beach',
    'candidate',
    null,
    null,
    null,
    null,
    null
  ),
  (
    'Réserve ornithologique du Teich',
    'reserve-ornithologique-du-teich',
    st_setsrid(st_makepoint(-1.0359566, 44.6467880), 4326)::geography,
    'FR',
    'Nouvelle-Aquitaine',
    'Le Teich',
    'nature',
    'osm',
    'way/279790575',
    'leisure=nature_reserve',
    'candidate',
    null,
    null,
    null,
    null,
    null
  ),
  (
    'Port de Larros',
    'port-de-larros',
    st_setsrid(st_makepoint(-1.0718774, 44.6438004), 4326)::geography,
    'FR',
    'Nouvelle-Aquitaine',
    'Gujan-Mestras',
    'harbour',
    'osm',
    'relation/3789458',
    'leisure=marina',
    'candidate',
    null,
    null,
    null,
    null,
    null
  ),
  (
    'Jetée d''Andernos',
    'jetee-d-andernos',
    st_setsrid(st_makepoint(-1.1015538, 44.7386741), 4326)::geography,
    'FR',
    'Nouvelle-Aquitaine',
    'Andernos-les-Bains',
    'pier',
    'osm',
    'way/51732433',
    'highway=footway',
    'candidate',
    null,
    null,
    null,
    null,
    null
  ),
  (
    'Phare du Cap-Ferret',
    'phare-du-cap-ferret',
    st_setsrid(st_makepoint(-1.2488155, 44.6459630), 4326)::geography,
    'FR',
    'Nouvelle-Aquitaine',
    'Lège-Cap-Ferret',
    'lighthouse',
    'osm',
    'way/715849418',
    'man_made=lighthouse',
    'candidate',
    null,
    null,
    null,
    null,
    null
  ),
  (
    'Jetée Bélisaire',
    'jetee-belisaire',
    st_setsrid(st_makepoint(-1.2368569, 44.6563447), 4326)::geography,
    'FR',
    'Nouvelle-Aquitaine',
    'Lège-Cap-Ferret',
    'pier',
    'osm',
    'node/406370940',
    'amenity=ferry_terminal',
    'candidate',
    null,
    null,
    null,
    null,
    null
  )
on conflict (slug) do update
set
  name = excluded.name,
  position = excluded.position,
  country_code = excluded.country_code,
  region = excluded.region,
  locality = excluded.locality,
  spot_type = excluded.spot_type,
  source_type = excluded.source_type
where public.spots.source = excluded.source
  and public.spots.source_external_id is not distinct from excluded.source_external_id;

commit;

select count(*) as pilot_spot_count
from public.spots
where slug in (
  'dune-du-pilat',
  'banc-d-arguin',
  'port-ostreicole-de-la-teste',
  'observatoire-sainte-cecile',
  'plage-du-moulleau',
  'reserve-ornithologique-du-teich',
  'port-de-larros',
  'jetee-d-andernos',
  'phare-du-cap-ferret',
  'jetee-belisaire'
);

select slug, status
from public.spots
where slug in (
  'dune-du-pilat',
  'banc-d-arguin',
  'port-ostreicole-de-la-teste',
  'observatoire-sainte-cecile',
  'plage-du-moulleau',
  'reserve-ornithologique-du-teich',
  'port-de-larros',
  'jetee-d-andernos',
  'phare-du-cap-ferret',
  'jetee-belisaire'
)
order by slug;

select
  slug,
  status,
  st_y(position::geometry) as latitude,
  st_x(position::geometry) as longitude
from public.spots
where slug in (
  'dune-du-pilat',
  'banc-d-arguin',
  'port-ostreicole-de-la-teste',
  'observatoire-sainte-cecile',
  'plage-du-moulleau',
  'reserve-ornithologique-du-teich',
  'port-de-larros',
  'jetee-d-andernos',
  'phare-du-cap-ferret',
  'jetee-belisaire'
)
order by slug;

select count(*) as remaining_technical_spots
from public.spots
where slug in (
  'photoatlas-test-verified',
  'photoatlas-test-candidate',
  'photoatlas-test-rejected'
);