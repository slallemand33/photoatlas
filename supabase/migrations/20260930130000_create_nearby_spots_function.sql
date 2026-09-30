create or replace function public.nearby_spots(
  input_latitude double precision,
  input_longitude double precision,
  input_radius_km double precision,
  input_result_limit integer
)
returns table (
  id uuid,
  name text,
  slug text,
  spot_type text,
  latitude double precision,
  longitude double precision,
  distance_m double precision,
  country_code text,
  region text,
  locality text,
  description text,
  landscape_potential smallint,
  sunrise_potential smallint,
  sunset_potential smallint,
  astro_potential smallint
)
language plpgsql
stable
security invoker
set search_path = pg_catalog, public
as $$
declare
  target_point extensions.geography(Point, 4326);
begin
  if input_latitude is null then
    raise exception 'Latitude manquante.';
  end if;

  if input_longitude is null then
    raise exception 'Longitude manquante.';
  end if;

  if input_radius_km is null then
    raise exception 'Rayon manquant.';
  end if;

  if input_result_limit is null then
    raise exception 'Limite manquante.';
  end if;

  if input_latitude < -90 or input_latitude > 90 then
    raise exception 'Latitude invalide : valeur attendue entre -90 et 90.';
  end if;

  if input_longitude < -180 or input_longitude > 180 then
    raise exception 'Longitude invalide : valeur attendue entre -180 et 180.';
  end if;

  if input_radius_km < 1 or input_radius_km > 50 then
    raise exception 'Rayon invalide : valeur attendue entre 1 et 50 km.';
  end if;

  if input_result_limit < 1 or input_result_limit > 50 then
    raise exception 'Limite invalide : valeur attendue entre 1 et 50.';
  end if;

  target_point := extensions.st_setsrid(
    extensions.st_makepoint(input_longitude, input_latitude),
    4326
  )::extensions.geography;

  return query
  select
    s.id,
    s.name,
    s.slug,
    s.spot_type,
    extensions.st_y(s.position::extensions.geometry) as latitude,
    extensions.st_x(s.position::extensions.geometry) as longitude,
    extensions.st_distance(s.position, target_point) as distance_m,
    s.country_code,
    s.region,
    s.locality,
    s.description,
    s.landscape_potential,
    s.sunrise_potential,
    s.sunset_potential,
    s.astro_potential
  from public.spots as s
  where s.status = 'verified'
    and extensions.st_dwithin(s.position, target_point, input_radius_km * 1000.0)
  order by extensions.st_distance(s.position, target_point) asc, s.slug asc
  limit input_result_limit;
end;
$$;

revoke all on function public.nearby_spots(double precision, double precision, double precision, integer) from public;
grant execute on function public.nearby_spots(double precision, double precision, double precision, integer) to anon;
grant execute on function public.nearby_spots(double precision, double precision, double precision, integer) to authenticated;

-- Requêtes de vérification préparatoires (à exécuter manuellement, hors migration) :
-- select * from public.nearby_spots(44.636, -1.071, 5, 20);
-- select * from public.nearby_spots(44.636, -1.071, 15, 20);
-- select * from public.nearby_spots(44.636, -1.071, 25, 20);
-- select * from public.nearby_spots(44.636, -1.071, 50, 20);
