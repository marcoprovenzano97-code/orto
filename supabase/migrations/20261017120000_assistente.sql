-- Assistente: registro dei messaggi (limite mensile e costi). Scrive solo il server.
create table public.assistente_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  creato timestamptz not null default now(),
  token_input integer,
  token_output integer,
  token_cache integer
);
create index assistente_log_utente_data on public.assistente_log (user_id, creato desc);
alter table public.assistente_log enable row level security;
create policy "assistente: lettura propria" on public.assistente_log
  for select to authenticated using ((select auth.uid()) = user_id);

-- Consenso a privacy e condizioni (data di accettazione), salvato nel profilo.
alter table public.profili add column consenso timestamptz;
grant update (consenso) on public.profili to authenticated;
