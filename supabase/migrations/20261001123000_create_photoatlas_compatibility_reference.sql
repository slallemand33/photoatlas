create table public.spot_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  parent_id uuid,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint spot_types_slug_key unique (slug),
  constraint spot_types_parent_fk
    foreign key (parent_id)
    references public.spot_types(id)
    on delete restrict,
  constraint spot_types_parent_not_self_check check (
    parent_id is null or parent_id <> id
  )
);

comment on table public.spot_types is
  'Taxonomie normalisee PhotoAtlas des types de spots, organisee en familles et sous-types.';

comment on column public.spot_types.slug is
  'Identifiant technique stable en anglais.';

comment on column public.spot_types.name is
  'Libelle francais affiche dans les interfaces.';

comment on column public.spot_types.parent_id is
  'Parent dans la taxonomie ; NULL pour les familles racines et le type fallback other.';

create index spot_types_parent_id_idx on public.spot_types(parent_id);

create trigger set_spot_types_updated_at
before update on public.spot_types
for each row
execute function public.set_updated_at();

create table public.photo_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint photo_types_slug_key unique (slug)
);

comment on table public.photo_types is
  'Types de photographie utilises par PhotoAtlas pour evaluer la compatibilite des spots.';

create trigger set_photo_types_updated_at
before update on public.photo_types
for each row
execute function public.set_updated_at();

create table public.spot_photo_compatibility (
  spot_type_id uuid not null,
  photo_type_id uuid not null,
  compatibility numeric(3,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint spot_photo_compatibility_pkey primary key (spot_type_id, photo_type_id),
  constraint spot_photo_compatibility_spot_type_fk
    foreign key (spot_type_id)
    references public.spot_types(id)
    on delete cascade,
  constraint spot_photo_compatibility_photo_type_fk
    foreign key (photo_type_id)
    references public.photo_types(id)
    on delete cascade,
  constraint spot_photo_compatibility_range_check check (
    compatibility >= 0 and compatibility <= 1
  )
);

comment on table public.spot_photo_compatibility is
  'Compatibilite generique entre un type principal de spot et un type de photographie.';

comment on column public.spot_photo_compatibility.compatibility is
  'Score compris entre 0.00 et 1.00, hors contexte meteo, distance, moment et orientation.';

create index spot_photo_compatibility_photo_type_idx
  on public.spot_photo_compatibility(photo_type_id);

create trigger set_spot_photo_compatibility_updated_at
before update on public.spot_photo_compatibility
for each row
execute function public.set_updated_at();

alter table public.spot_types enable row level security;
alter table public.photo_types enable row level security;
alter table public.spot_photo_compatibility enable row level security;

grant select on public.spot_types to anon;
grant select on public.spot_types to authenticated;
grant select on public.photo_types to anon;
grant select on public.photo_types to authenticated;
grant select on public.spot_photo_compatibility to anon;
grant select on public.spot_photo_compatibility to authenticated;

create policy "Public can read spot types"
on public.spot_types
for select
to anon, authenticated
using (true);

create policy "Public can read photo types"
on public.photo_types
for select
to anon, authenticated
using (true);

create policy "Public can read spot photo compatibility"
on public.spot_photo_compatibility
for select
to anon, authenticated
using (true);