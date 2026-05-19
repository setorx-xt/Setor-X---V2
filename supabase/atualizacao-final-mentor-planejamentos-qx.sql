-- Setor X Online — Atualização final sem apagar dados
-- Rode este arquivo se você já tinha rodado schema anterior e os planejamentos/QX coletivo deram erro.

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

alter table public.individual_plans enable row level security;
alter table public.plan_progress enable row level security;
alter table public.collective_questions enable row level security;
alter table public.collective_attempts enable row level security;
alter table public.student_goals enable row level security;
alter table public.xp_events enable row level security;

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

-- policies: repeat safely
DO $$
BEGIN
  -- Individual plans
  DROP POLICY IF EXISTS "plans_select_owner_or_mentor" ON public.individual_plans;
  CREATE POLICY "plans_select_owner_or_mentor" ON public.individual_plans FOR SELECT USING (user_id = auth.uid() OR mentor_id = auth.uid() OR public.is_mentor());
  DROP POLICY IF EXISTS "plans_insert_mentor" ON public.individual_plans;
  CREATE POLICY "plans_insert_mentor" ON public.individual_plans FOR INSERT WITH CHECK (public.is_mentor());
  DROP POLICY IF EXISTS "plans_update_mentor" ON public.individual_plans;
  CREATE POLICY "plans_update_mentor" ON public.individual_plans FOR UPDATE USING (public.is_mentor()) WITH CHECK (public.is_mentor());
  DROP POLICY IF EXISTS "plans_delete_mentor" ON public.individual_plans;
  CREATE POLICY "plans_delete_mentor" ON public.individual_plans FOR DELETE USING (public.is_mentor());

  -- Progress
  DROP POLICY IF EXISTS "progress_select_owner_or_mentor" ON public.plan_progress;
  CREATE POLICY "progress_select_owner_or_mentor" ON public.plan_progress FOR SELECT USING (user_id = auth.uid() OR public.is_mentor());
  DROP POLICY IF EXISTS "progress_insert_owner" ON public.plan_progress;
  CREATE POLICY "progress_insert_owner" ON public.plan_progress FOR INSERT WITH CHECK (user_id = auth.uid());
  DROP POLICY IF EXISTS "progress_update_owner" ON public.plan_progress;
  CREATE POLICY "progress_update_owner" ON public.plan_progress FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

  -- Collective QX
  DROP POLICY IF EXISTS "collective_questions_select_public" ON public.collective_questions;
  CREATE POLICY "collective_questions_select_public" ON public.collective_questions FOR SELECT USING (is_public = true OR owner_id = auth.uid() OR public.is_mentor());
  DROP POLICY IF EXISTS "collective_questions_insert_mentor" ON public.collective_questions;
  CREATE POLICY "collective_questions_insert_mentor" ON public.collective_questions FOR INSERT WITH CHECK (public.is_mentor());
  DROP POLICY IF EXISTS "collective_questions_update_mentor" ON public.collective_questions;
  CREATE POLICY "collective_questions_update_mentor" ON public.collective_questions FOR UPDATE USING (public.is_mentor()) WITH CHECK (public.is_mentor());
  DROP POLICY IF EXISTS "collective_questions_delete_mentor" ON public.collective_questions;
  CREATE POLICY "collective_questions_delete_mentor" ON public.collective_questions FOR DELETE USING (public.is_mentor());

  -- Attempts
  DROP POLICY IF EXISTS "attempts_select_owner_or_mentor" ON public.collective_attempts;
  CREATE POLICY "attempts_select_owner_or_mentor" ON public.collective_attempts FOR SELECT USING (user_id = auth.uid() OR public.is_mentor());
  DROP POLICY IF EXISTS "attempts_insert_owner" ON public.collective_attempts;
  CREATE POLICY "attempts_insert_owner" ON public.collective_attempts FOR INSERT WITH CHECK (user_id = auth.uid());
  DROP POLICY IF EXISTS "attempts_update_owner" ON public.collective_attempts;
  CREATE POLICY "attempts_update_owner" ON public.collective_attempts FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

  -- Goals
  DROP POLICY IF EXISTS "goals_select_owner_or_mentor" ON public.student_goals;
  CREATE POLICY "goals_select_owner_or_mentor" ON public.student_goals FOR SELECT USING (user_id = auth.uid() OR mentor_id = auth.uid() OR public.is_mentor());
  DROP POLICY IF EXISTS "goals_insert_mentor" ON public.student_goals;
  CREATE POLICY "goals_insert_mentor" ON public.student_goals FOR INSERT WITH CHECK (public.is_mentor());
  DROP POLICY IF EXISTS "goals_update_mentor" ON public.student_goals;
  CREATE POLICY "goals_update_mentor" ON public.student_goals FOR UPDATE USING (public.is_mentor()) WITH CHECK (public.is_mentor());
  DROP POLICY IF EXISTS "goals_delete_mentor" ON public.student_goals;
  CREATE POLICY "goals_delete_mentor" ON public.student_goals FOR DELETE USING (public.is_mentor());
END $$;
