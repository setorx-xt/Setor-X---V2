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
