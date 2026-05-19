# Setor X Online — Final Mentor/Aluno

## O que esta versão corrige

- Base V30 restaurada com workspace profissional.
- Vade Mecum, Lei Seca PRO, Grifos, Revisões PRO e Estatísticas PRO integrados.
- Área do Mentor separada e visível apenas para mentor ativo.
- Mentor pode:
  - aprovar/bloquear alunos;
  - visualizar estatísticas por aluno;
  - importar planejamento individual;
  - definir metas por aluno até uma data;
  - sincronizar ranking.
- Aluno vê apenas:
  - Operação semanal;
  - Planejamento Semanal;
  - missão do dia atual.
- Ranking sincronizado pelo Supabase via `xp_events` + trigger de XP.
- Backup removido do menu principal.

## Supabase

Rode primeiro:

`supabase/schema.sql`

Se der erro com `create extension`, rode:

`supabase/schema-sem-create-extension.sql`

Depois crie sua conta e rode:

`supabase/promover-mentor.sql`

## Ordem de teste

1. Criar conta mentor.
2. Rodar promover-mentor.sql.
3. Entrar como mentor.
4. Criar conta aluno teste.
5. Aprovar aluno na Área do Mentor.
6. Importar planejamento para aluno.
7. Entrar como aluno.
8. Verificar se só aparece a missão de hoje em Planejamento.
9. Registrar bloco.
10. Sincronizar ranking.
