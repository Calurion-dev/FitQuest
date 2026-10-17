-- FitQuest — schéma Supabase
-- À coller dans Supabase → SQL Editor → New query → Run.
-- Deux tables : la sauvegarde privée (blob JSON) et la ligne publique du classement.

-- ─────────────────────────────────────────────────────────────
-- 1. Sauvegarde des données de jeu (privée, un blob JSON par utilisateur)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.fitquest_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.fitquest_profiles enable row level security;

drop policy if exists "fitquest_profiles_select_own" on public.fitquest_profiles;
create policy "fitquest_profiles_select_own"
  on public.fitquest_profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "fitquest_profiles_insert_own" on public.fitquest_profiles;
create policy "fitquest_profiles_insert_own"
  on public.fitquest_profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "fitquest_profiles_update_own" on public.fitquest_profiles;
create policy "fitquest_profiles_update_own"
  on public.fitquest_profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────
-- 2. Classement en ligne (uniquement pseudo + XP + rang, lisible par tous
--    les joueurs connectés)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.fitquest_scores (
  user_id uuid primary key references auth.users (id) on delete cascade,
  pseudo text not null default 'Joueur',
  xp integer not null default 0,
  rank text not null default 'Bronze I',
  updated_at timestamptz not null default now()
);

create index if not exists fitquest_scores_xp_idx on public.fitquest_scores (xp desc);

alter table public.fitquest_scores enable row level security;

drop policy if exists "fitquest_scores_select_all" on public.fitquest_scores;
create policy "fitquest_scores_select_all"
  on public.fitquest_scores for select
  to authenticated
  using (true);

drop policy if exists "fitquest_scores_insert_own" on public.fitquest_scores;
create policy "fitquest_scores_insert_own"
  on public.fitquest_scores for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "fitquest_scores_update_own" on public.fitquest_scores;
create policy "fitquest_scores_update_own"
  on public.fitquest_scores for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
