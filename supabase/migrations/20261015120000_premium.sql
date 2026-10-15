-- Account, premium, sincronizzazione dell'orto e notifiche push.

-- Profilo utente: piano premium (lo modifica solo l'amministratore), zona e posizione per il meteo.
create table public.profili (
  id uuid primary key references auth.users on delete cascade,
  premium boolean not null default false,
  premium_fino timestamptz,
  zona text not null default 'nord' check (zona in ('nord', 'centro', 'sud')),
  luogo text,
  lat double precision,
  lon double precision,
  notifiche boolean not null default true,
  creato timestamptz not null default now()
);
alter table public.profili enable row level security;
create policy "profilo: lettura propria" on public.profili
  for select to authenticated using ((select auth.uid()) = id);
create policy "profilo: modifica propria" on public.profili
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
-- L'utente può cambiare solo questi campi, mai premium / premium_fino.
revoke insert, update, delete on public.profili from anon, authenticated;
grant update (zona, luogo, lat, lon, notifiche) on public.profili to authenticated;

create function public.crea_profilo() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profili (id) values (new.id);
  return new;
end;
$$;
create trigger nuovo_utente after insert on auth.users
  for each row execute function public.crea_profilo();

create function public.premium_attivo(uid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select premium and (premium_fino is null or premium_fino > now()) from public.profili where id = uid),
    false);
$$;

-- Orto completo dell'utente (aiuole, storico, progetti, raccolti) come documento JSON.
-- Sincronizzazione cloud riservata al premium.
create table public.orti (
  user_id uuid primary key references auth.users on delete cascade,
  dati jsonb not null,
  aggiornato timestamptz not null default now()
);
alter table public.orti enable row level security;
create policy "orto: proprio e premium" on public.orti
  for all to authenticated
  using ((select auth.uid()) = user_id and public.premium_attivo((select auth.uid())))
  with check ((select auth.uid()) = user_id and public.premium_attivo((select auth.uid())));

-- Iscrizioni alle notifiche push (una per dispositivo).
create table public.push_iscrizioni (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  creato timestamptz not null default now()
);
alter table public.push_iscrizioni enable row level security;
create policy "push: proprie" on public.push_iscrizioni
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Registro delle notifiche già inviate (evita doppioni). Solo il server vi accede.
create table public.notifiche_inviate (
  user_id uuid not null references auth.users on delete cascade,
  chiave text not null,
  inviata timestamptz not null default now(),
  primary key (user_id, chiave)
);
alter table public.notifiche_inviate enable row level security;
