-- Setor X Online — promover sua conta para mentor
-- Troque SEU_EMAIL_AQUI pelo seu e-mail usado no cadastro.

update public.profiles
set
  role = 'mentor',
  status = 'active',
  active = true,
  full_name = 'Matheus G.',
  nickname = 'Matheus G. — Mentor'
where email = 'SEU_EMAIL_AQUI';

select id, email, full_name, nickname, role, status, active, xp_total
from public.profiles
where email = 'SEU_EMAIL_AQUI';
