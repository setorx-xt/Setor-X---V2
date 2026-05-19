-- Setor X Online — Schema final
-- Login, liberação de alunos, planejamentos individuais, QX coletivo, metas, XP e ranking sincronizado.
-- Se seu Supabase não permitir CREATE EXTENSION, use o arquivo schema-sem-create-extension.sql.

-- create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  nickname text,
  role text not null default 'student' check (role in ('student','mentor')),
  status text not null default 'pending' check (status in ('pending','active','blocked')),
  active boolean not null default false,
  contest_target text,
  xp_total int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.individual_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mentor_id uuid references public.profiles(id) on delete set null,
  contest text,
  week_label text,
  mentor_message text,
  plan_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.plan_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.individual_plans(id) on delete cascade,
  block_id text not null,
  completed boolean not null default false,
  done_questions int not null default 0,
  correct int not null default 0,
  wrong int not null default 0,
  note text,
  updated_at timestamptz not null default now(),
  unique(user_id, plan_id, block_id)
);

create table if not exists public.collective_questions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  is_public boolean not null default true,
  discipline text not null,
  subject text,
  type text not null default 'ce' check (type in ('ce','mc')),
  statement text not null,
  options text,
  answer text not null,
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.collective_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.collective_questions(id) on delete cascade,
  answer text,
  is_correct boolean,
  next_review date,
  attempts int not null default 1,
  updated_at timestamptz not null default now(),
  unique(user_id, question_id)
);

create table if not exists public.student_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mentor_id uuid references public.profiles(id) on delete set null,
  goal_type text not null default 'questions',
  title text,
  target_value int not null default 0,
  due_date date not null,
  status text not null default 'active' check (status in ('active','done','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount int not null default 0,
  reason text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, full_name, nickname, role, status, active, xp_total)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    'student',
    'pending',
    false,
    0
  ) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_mentor()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'mentor'
    and status = 'active'
  );
$$;

create or replace function public.setorx_recompute_xp_totals()
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles p
  set xp_total = coalesce(x.total,0), updated_at = now()
  from (
    select user_id, sum(amount)::int as total
    from public.xp_events
    group by user_id
  ) x
  where p.id = x.user_id;

  update public.profiles p
  set xp_total = 0, updated_at = now()
  where not exists (select 1 from public.xp_events e where e.user_id = p.id);
end;
$$;

create or replace function public.setorx_sync_user_xp()
returns trigger
language plpgsql
security definer
as $$
declare
  target_user uuid;
begin
  target_user := coalesce(new.user_id, old.user_id);
  update public.profiles
  set xp_total = coalesce((select sum(amount)::int from public.xp_events where user_id = target_user),0),
      updated_at = now()
  where id = target_user;
  return coalesce(new, old);
end;
$$;

drop trigger if exists setorx_xp_insert_sync on public.xp_events;
create trigger setorx_xp_insert_sync
after insert or update or delete on public.xp_events
for each row execute procedure public.setorx_sync_user_xp();

alter table public.profiles enable row level security;
alter table public.individual_plans enable row level security;
alter table public.plan_progress enable row level security;
alter table public.collective_questions enable row level security;
alter table public.collective_attempts enable row level security;
alter table public.student_goals enable row level security;
alter table public.xp_events enable row level security;

-- profiles
drop policy if exists "profiles_select_self_or_mentor_or_ranking" on public.profiles;
create policy "profiles_select_self_or_mentor_or_ranking"
on public.profiles for select
using (auth.uid() is not null and (id = auth.uid() or public.is_mentor() or status = 'active'));

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles for insert
with check (id = auth.uid());

drop policy if exists "profiles_update_self_or_mentor" on public.profiles;
create policy "profiles_update_self_or_mentor"
on public.profiles for update
using (id = auth.uid() or public.is_mentor())
with check (id = auth.uid() or public.is_mentor());

-- individual plans
drop policy if exists "plans_select_owner_or_mentor" on public.individual_plans;
create policy "plans_select_owner_or_mentor"
on public.individual_plans for select
using (user_id = auth.uid() or mentor_id = auth.uid() or public.is_mentor());

drop policy if exists "plans_insert_mentor" on public.individual_plans;
create policy "plans_insert_mentor"
on public.individual_plans for insert
with check (public.is_mentor());

drop policy if exists "plans_update_mentor" on public.individual_plans;
create policy "plans_update_mentor"
on public.individual_plans for update
using (public.is_mentor()) with check (public.is_mentor());

drop policy if exists "plans_delete_mentor" on public.individual_plans;
create policy "plans_delete_mentor"
on public.individual_plans for delete
using (public.is_mentor());

-- plan progress
drop policy if exists "progress_select_owner_or_mentor" on public.plan_progress;
create policy "progress_select_owner_or_mentor"
on public.plan_progress for select
using (user_id = auth.uid() or public.is_mentor());

drop policy if exists "progress_insert_owner" on public.plan_progress;
create policy "progress_insert_owner"
on public.plan_progress for insert
with check (user_id = auth.uid());

drop policy if exists "progress_update_owner" on public.plan_progress;
create policy "progress_update_owner"
on public.plan_progress for update
using (user_id = auth.uid()) with check (user_id = auth.uid());

-- collective questions
drop policy if exists "collective_questions_select_public" on public.collective_questions;
create policy "collective_questions_select_public"
on public.collective_questions for select
using (is_public = true or owner_id = auth.uid() or public.is_mentor());

drop policy if exists "collective_questions_insert_mentor" on public.collective_questions;
create policy "collective_questions_insert_mentor"
on public.collective_questions for insert
with check (public.is_mentor());

drop policy if exists "collective_questions_update_mentor" on public.collective_questions;
create policy "collective_questions_update_mentor"
on public.collective_questions for update
using (public.is_mentor()) with check (public.is_mentor());

drop policy if exists "collective_questions_delete_mentor" on public.collective_questions;
create policy "collective_questions_delete_mentor"
on public.collective_questions for delete
using (public.is_mentor());

-- attempts
drop policy if exists "attempts_select_owner_or_mentor" on public.collective_attempts;
create policy "attempts_select_owner_or_mentor"
on public.collective_attempts for select
using (user_id = auth.uid() or public.is_mentor());

drop policy if exists "attempts_insert_owner" on public.collective_attempts;
create policy "attempts_insert_owner"
on public.collective_attempts for insert
with check (user_id = auth.uid());

drop policy if exists "attempts_update_owner" on public.collective_attempts;
create policy "attempts_update_owner"
on public.collective_attempts for update
using (user_id = auth.uid()) with check (user_id = auth.uid());

-- goals
drop policy if exists "goals_select_owner_or_mentor" on public.student_goals;
create policy "goals_select_owner_or_mentor"
on public.student_goals for select
using (user_id = auth.uid() or mentor_id = auth.uid() or public.is_mentor());

drop policy if exists "goals_insert_mentor" on public.student_goals;
create policy "goals_insert_mentor"
on public.student_goals for insert
with check (public.is_mentor());

drop policy if exists "goals_update_mentor" on public.student_goals;
create policy "goals_update_mentor"
on public.student_goals for update
using (public.is_mentor()) with check (public.is_mentor());

drop policy if exists "goals_delete_mentor" on public.student_goals;
create policy "goals_delete_mentor"
on public.student_goals for delete
using (public.is_mentor());

-- XP
drop policy if exists "xp_select_owner_or_mentor" on public.xp_events;
create policy "xp_select_owner_or_mentor"
on public.xp_events for select
using (user_id = auth.uid() or public.is_mentor());

drop policy if exists "xp_insert_owner" on public.xp_events;
create policy "xp_insert_owner"
on public.xp_events for insert
with check (user_id = auth.uid());


-- Atualização V6 Ranking / XP
-- Setor X Online — Atualização V6 do Ranking / XP
-- Rode este arquivo no SQL Editor do Supabase.
-- Ele NÃO apaga alunos nem planejamentos. Só reforça XP, ranking, triggers, policies e RPC.

-- 1) Garantir coluna de XP no perfil
alter table public.profiles
add column if not exists xp_total int not null default 0;

alter table public.profiles
add column if not exists nickname text;

alter table public.profiles
add column if not exists contest_target text;

-- 2) Tabela de eventos de XP
create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount int not null default 0,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.xp_events enable row level security;

-- 3) Função para identificar mentor
create or replace function public.is_mentor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'mentor'
      and status = 'active'
  );
$$;

-- 4) Recalcular todos os totais
create or replace function public.setorx_recompute_xp_totals()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles p
  set xp_total = coalesce(x.total, 0),
      updated_at = now()
  from (
    select user_id, sum(amount)::int as total
    from public.xp_events
    group by user_id
  ) x
  where p.id = x.user_id;

  update public.profiles p
  set xp_total = 0,
      updated_at = now()
  where not exists (
    select 1 from public.xp_events e
    where e.user_id = p.id
  );
end;
$$;

-- 5) Adicionar XP de forma segura pelo usuário logado
create or replace function public.setorx_add_xp(p_amount int, p_reason text default null)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_total int;
begin
  v_user := auth.uid();

  if v_user is null then
    raise exception 'Usuário não autenticado.';
  end if;

  if p_amount is null or p_amount = 0 then
    select coalesce(xp_total,0) into v_total
    from public.profiles
    where id = v_user;
    return coalesce(v_total,0);
  end if;

  insert into public.xp_events (user_id, amount, reason)
  values (v_user, p_amount, p_reason);

  select coalesce(sum(amount),0)::int
  into v_total
  from public.xp_events
  where user_id = v_user;

  update public.profiles
  set xp_total = v_total,
      updated_at = now()
  where id = v_user;

  return coalesce(v_total,0);
end;
$$;

-- 6) Trigger para manter XP sempre sincronizado
create or replace function public.setorx_sync_user_xp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user uuid;
  v_total int;
begin
  target_user := coalesce(new.user_id, old.user_id);

  select coalesce(sum(amount),0)::int
  into v_total
  from public.xp_events
  where user_id = target_user;

  update public.profiles
  set xp_total = coalesce(v_total,0),
      updated_at = now()
  where id = target_user;

  return coalesce(new, old);
end;
$$;

drop trigger if exists setorx_xp_insert_sync on public.xp_events;
create trigger setorx_xp_insert_sync
after insert or update or delete on public.xp_events
for each row execute procedure public.setorx_sync_user_xp();

-- 7) Policies do XP
drop policy if exists "xp_select_owner_or_mentor" on public.xp_events;
create policy "xp_select_owner_or_mentor"
on public.xp_events for select
using (user_id = auth.uid() or public.is_mentor());

drop policy if exists "xp_insert_owner" on public.xp_events;
create policy "xp_insert_owner"
on public.xp_events for insert
with check (user_id = auth.uid());

drop policy if exists "xp_update_mentor" on public.xp_events;
create policy "xp_update_mentor"
on public.xp_events for update
using (public.is_mentor())
with check (public.is_mentor());

drop policy if exists "xp_delete_mentor" on public.xp_events;
create policy "xp_delete_mentor"
on public.xp_events for delete
using (public.is_mentor());

-- 8) Garantir que perfis ativos sejam lidos para ranking
drop policy if exists "profiles_select_self_or_mentor_or_ranking" on public.profiles;
create policy "profiles_select_self_or_mentor_or_ranking"
on public.profiles for select
using (
  auth.uid() is not null
  and (
    id = auth.uid()
    or public.is_mentor()
    or status = 'active'
  )
);

drop policy if exists "profiles_update_self_or_mentor" on public.profiles;
create policy "profiles_update_self_or_mentor"
on public.profiles for update
using (id = auth.uid() or public.is_mentor())
with check (id = auth.uid() or public.is_mentor());

-- 9) Permissões das funções
grant execute on function public.setorx_add_xp(int, text) to authenticated;
grant execute on function public.setorx_recompute_xp_totals() to authenticated;
grant execute on function public.is_mentor() to authenticated;

-- 10) Sincronização imediata
select public.setorx_recompute_xp_totals();

-- 11) Conferência
select
  email,
  full_name,
  nickname,
  role,
  status,
  active,
  xp_total
from public.profiles
order by xp_total desc, created_at asc;
