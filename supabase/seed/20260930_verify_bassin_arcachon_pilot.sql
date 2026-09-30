begin;

do $$
declare
  target_count integer;
begin
  select count(*)
  into target_count
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

  if target_count <> 10 then
    raise exception 'Publication pilote interrompue : 10 spots attendus, % trouves.', target_count;
  end if;
end;
$$;

update public.spots
set status = 'verified'
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

select count(*) as verified_pilot_spot_count
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
and status = 'verified';

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
  landscape_potential,
  sunrise_potential,
  sunset_potential,
  astro_potential
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
