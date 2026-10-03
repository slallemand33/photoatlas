begin;

do $$
declare
  expected_spot_count integer := 10;
  expected_type_count integer := 9;
  found_spot_count integer;
  found_type_count integer;
  updated_spot_count integer;
begin
  with mapping(spot_slug, spot_type_slug) as (
    values
      ('dune-du-pilat', 'dune'),
      ('banc-d-arguin', 'sandbank'),
      ('port-de-larros', 'harbour'),
      ('port-ostreicole-de-la-teste', 'oyster_harbour'),
      ('jetee-d-andernos', 'pier'),
      ('jetee-belisaire', 'pier'),
      ('phare-du-cap-ferret', 'lighthouse'),
      ('plage-du-moulleau', 'beach'),
      ('reserve-ornithologique-du-teich', 'bird_reserve'),
      ('observatoire-sainte-cecile', 'observatory')
  )
  select count(*)
  into found_spot_count
  from public.spots as spots
  join mapping on mapping.spot_slug = spots.slug;

  if found_spot_count <> expected_spot_count then
    raise exception 'Mapping spots pilote interrompu : % slugs attendus, % trouves.', expected_spot_count, found_spot_count;
  end if;

  with mapping(spot_slug, spot_type_slug) as (
    values
      ('dune-du-pilat', 'dune'),
      ('banc-d-arguin', 'sandbank'),
      ('port-de-larros', 'harbour'),
      ('port-ostreicole-de-la-teste', 'oyster_harbour'),
      ('jetee-d-andernos', 'pier'),
      ('jetee-belisaire', 'pier'),
      ('phare-du-cap-ferret', 'lighthouse'),
      ('plage-du-moulleau', 'beach'),
      ('reserve-ornithologique-du-teich', 'bird_reserve'),
      ('observatoire-sainte-cecile', 'observatory')
  )
  select count(distinct spot_types.slug)
  into found_type_count
  from public.spot_types as spot_types
  join mapping on mapping.spot_type_slug = spot_types.slug;

  if found_type_count <> expected_type_count then
    raise exception 'Mapping spots pilote interrompu : % types distincts attendus, % trouves.', expected_type_count, found_type_count;
  end if;

  if exists (
    with mapping(spot_slug, spot_type_slug) as (
      values
        ('dune-du-pilat', 'dune'),
        ('banc-d-arguin', 'sandbank'),
        ('port-de-larros', 'harbour'),
        ('port-ostreicole-de-la-teste', 'oyster_harbour'),
        ('jetee-d-andernos', 'pier'),
        ('jetee-belisaire', 'pier'),
        ('phare-du-cap-ferret', 'lighthouse'),
        ('plage-du-moulleau', 'beach'),
        ('reserve-ornithologique-du-teich', 'bird_reserve'),
        ('observatoire-sainte-cecile', 'observatory')
    )
    select 1
    from mapping
    group by spot_slug
    having count(*) > 1
  ) then
    raise exception 'Mapping spots pilote interrompu : slug de spot duplique dans le seed.';
  end if;

  if exists (
    with mapping(spot_slug, spot_type_slug) as (
      values
        ('dune-du-pilat', 'dune'),
        ('banc-d-arguin', 'sandbank'),
        ('port-de-larros', 'harbour'),
        ('port-ostreicole-de-la-teste', 'oyster_harbour'),
        ('jetee-d-andernos', 'pier'),
        ('jetee-belisaire', 'pier'),
        ('phare-du-cap-ferret', 'lighthouse'),
        ('plage-du-moulleau', 'beach'),
        ('reserve-ornithologique-du-teich', 'bird_reserve'),
        ('observatoire-sainte-cecile', 'observatory')
    )
    select 1
    from mapping
    left join public.spot_types on public.spot_types.slug = mapping.spot_type_slug
    where public.spot_types.id is null
  ) then
    raise exception 'Mapping spots pilote interrompu : au moins un slug de type est introuvable dans public.spot_types.';
  end if;

  with mapping(spot_slug, spot_type_slug) as (
    values
      ('dune-du-pilat', 'dune'),
      ('banc-d-arguin', 'sandbank'),
      ('port-de-larros', 'harbour'),
      ('port-ostreicole-de-la-teste', 'oyster_harbour'),
      ('jetee-d-andernos', 'pier'),
      ('jetee-belisaire', 'pier'),
      ('phare-du-cap-ferret', 'lighthouse'),
      ('plage-du-moulleau', 'beach'),
      ('reserve-ornithologique-du-teich', 'bird_reserve'),
      ('observatoire-sainte-cecile', 'observatory')
  ), resolved_mapping as (
    select
      spots.id as spot_id,
      spots.slug as spot_slug,
      spot_types.id as spot_type_id
    from mapping
    join public.spots as spots
      on spots.slug = mapping.spot_slug
    join public.spot_types as spot_types
      on spot_types.slug = mapping.spot_type_slug
  )
  update public.spots as spots
  set spot_type_id = resolved_mapping.spot_type_id
  from resolved_mapping
  where spots.id = resolved_mapping.spot_id
    and spots.spot_type_id is distinct from resolved_mapping.spot_type_id;

  get diagnostics updated_spot_count = row_count;

  if exists (
    with mapping(spot_slug, spot_type_slug) as (
      values
        ('dune-du-pilat', 'dune'),
        ('banc-d-arguin', 'sandbank'),
        ('port-de-larros', 'harbour'),
        ('port-ostreicole-de-la-teste', 'oyster_harbour'),
        ('jetee-d-andernos', 'pier'),
        ('jetee-belisaire', 'pier'),
        ('phare-du-cap-ferret', 'lighthouse'),
        ('plage-du-moulleau', 'beach'),
        ('reserve-ornithologique-du-teich', 'bird_reserve'),
        ('observatoire-sainte-cecile', 'observatory')
    )
    select 1
    from mapping
    join public.spots on public.spots.slug = mapping.spot_slug
    join public.spot_types on public.spot_types.id = public.spots.spot_type_id
    where public.spot_types.slug <> mapping.spot_type_slug
  ) then
    raise exception 'Mapping spots pilote interrompu : incoherence detectee entre spot_type_id et le slug cible.';
  end if;

  raise notice 'Mapping spots pilote prepare : % spot(s) mis a jour.', updated_spot_count;
end;
$$;

commit;

select
  spots.slug,
  spots.spot_type,
  spot_types.slug as mapped_spot_type_slug
from public.spots as spots
left join public.spot_types as spot_types
  on spot_types.id = spots.spot_type_id
where spots.slug in (
  'dune-du-pilat',
  'banc-d-arguin',
  'port-de-larros',
  'port-ostreicole-de-la-teste',
  'jetee-d-andernos',
  'jetee-belisaire',
  'phare-du-cap-ferret',
  'plage-du-moulleau',
  'reserve-ornithologique-du-teich',
  'observatoire-sainte-cecile'
)
order by spots.slug;