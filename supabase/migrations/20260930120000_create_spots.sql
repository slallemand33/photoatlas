create table public.spots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  position geography(Point, 4326) not null,
  country_code text not null,
  region text,
  locality text,
  spot_type text not null,
  source text not null,
  source_external_id text,
  source_type text,
  status text not null default 'candidate',
  description text,
  landscape_potential smallint,
  sunrise_potential smallint,
  sunset_potential smallint,
  astro_potential smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint spots_slug_key unique (slug),
  constraint spots_country_code_format_check check (
    char_length(country_code) = 2
    and country_code = upper(country_code)
  ),
  constraint spots_source_check check (source in ('osm', 'photoatlas', 'manual', 'user')),
  constraint spots_status_check check (status in ('candidate', 'verified', 'rejected')),
  constraint spots_landscape_potential_check check (
    landscape_potential is null or landscape_potential between 0 and 100
  ),
  constraint spots_sunrise_potential_check check (
    sunrise_potential is null or sunrise_potential between 0 and 100
  ),
  constraint spots_sunset_potential_check check (
    sunset_potential is null or sunset_potential between 0 and 100
  ),
  constraint spots_astro_potential_check check (
    astro_potential is null or astro_potential between 0 and 100
  )
);

comment on column public.spots.source_type is
  'Classification brute du fournisseur d''origine ; distincte de spot_type, qui porte la taxonomie normalisee PhotoAtlas.';

comment on column public.spots.country_code is
  'Code pays ISO 3166-1 alpha-2 attendu en majuscules.';

comment on column public.spots.landscape_potential is
  'NULL = potentiel non evalue ; 0 = potentiel evalue comme nul.';

comment on column public.spots.sunrise_potential is
  'NULL = potentiel non evalue ; 0 = potentiel evalue comme nul.';

comment on column public.spots.sunset_potential is
  'NULL = potentiel non evalue ; 0 = potentiel evalue comme nul.';

comment on column public.spots.astro_potential is
  'NULL = potentiel non evalue ; 0 = potentiel evalue comme nul.';

create index spots_position_gist_idx on public.spots using gist (position);

create unique index spots_source_external_id_unique_idx
  on public.spots (source, source_external_id)
  where source_external_id is not null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_spots_updated_at
before update on public.spots
for each row
execute function public.set_updated_at();

alter table public.spots enable row level security;

grant select on public.spots to anon;
grant select on public.spots to authenticated;

create policy "Public can read verified spots"
on public.spots
for select
to anon, authenticated
using (status = 'verified');