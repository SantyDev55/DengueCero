-- 1) En supabase.com crea un proyecto gratuito.
-- 2) Abre "SQL Editor", pega todo este archivo y pulsa "Run".
-- 3) Copia Project URL y la clave anon/publishable en js/mapa-config.js.
-- Para ocultar un reporte falso: en "Table Editor" cambia visible a false.

create table if not exists public.reportes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  tipo text not null check (tipo in ('tanque','balde','llanta','envase','maceta','bebedero','otro')),
  -- numeric(8,3) redondea a ~110 m: nunca se guarda una dirección exacta
  lat numeric(8,3) not null check (lat between -18.5 and 0.1),
  lng numeric(8,3) not null check (lng between -81.5 and -68.5),
  atendido boolean not null default false,
  visible boolean not null default true
);

alter table public.reportes enable row level security;
grant select, insert on public.reportes to anon;

create policy "ver reportes visibles" on public.reportes
  for select to anon using (visible);

create policy "crear reportes" on public.reportes
  for insert to anon
  with check (visible and created_at > now() - interval '1 minute');
