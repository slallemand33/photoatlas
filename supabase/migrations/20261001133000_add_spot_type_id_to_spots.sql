alter table public.spots
add column spot_type_id uuid;

comment on column public.spots.spot_type_id is
  'Reference progressive vers public.spot_types(id), en parallele du spot_type text historique.';

alter table public.spots
add constraint spots_spot_type_id_fk
foreign key (spot_type_id)
references public.spot_types(id)
on delete restrict;