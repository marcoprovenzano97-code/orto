-- Check-up con foto: registro delle analisi (limite mensile e storico).
create table public.checkup (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  creato timestamptz not null default now(),
  coltura text,
  esito jsonb,
  token_input integer,
  token_output integer
);
create index checkup_utente_data on public.checkup (user_id, creato desc);
alter table public.checkup enable row level security;
-- L'utente può leggere i propri check-up; scrive solo il server.
create policy "checkup: lettura propria" on public.checkup
  for select to authenticated using ((select auth.uid()) = user_id);
