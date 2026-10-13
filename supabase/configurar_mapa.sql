-- Ejecuta en Supabase > SQL Editor.
-- Es compatible con la tabla public.reportes del esquema original de DengueCero.
-- No crea cuentas: la clave pública solo puede actuar según estas políticas RLS.

create table if not exists public.reportes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  tipo text not null check (tipo in ('tanque','balde','llanta','envase','maceta','bebedero','otro')),
  lat numeric(8,3) not null check (lat between -18.5 and 0.1),
  lng numeric(8,3) not null check (lng between -81.5 and -68.5),
  atendido boolean not null default false,
  visible boolean not null default true
);

alter table public.reportes enable row level security;
grant select, insert on public.reportes to anon;

drop policy if exists "ver reportes visibles" on public.reportes;
drop policy if exists "crear reportes" on public.reportes;

create policy "ver reportes visibles" on public.reportes
  for select to anon
  using (visible = true);

create policy "crear reportes" on public.reportes
  for insert to anon
  with check (
    visible = true
    and created_at >= now() - interval '1 minute'
    and created_at <= now() + interval '1 minute'
    and lat between -18.5 and 0.1
    and lng between -81.5 and -68.5
    and tipo in ('tanque','balde','llanta','envase','maceta','bebedero','otro')
  );
