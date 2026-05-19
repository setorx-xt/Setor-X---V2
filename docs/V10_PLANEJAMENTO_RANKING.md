# Setor X V10 — Planejamento estável e Ranking corrigido

## Correções

### Planejamento do aluno piscando

A V10 cria uma camada estável:

`assets/js/setorx-v10-stable-plan-ranking.js`

Ela:
- busca o planejamento diretamente do Supabase;
- renderiza somente quando os dados mudam;
- evita re-render em loop;
- mostra apenas a missão do dia;
- atualiza blocos sem redesenhar tudo a cada evento antigo.

### Ranking zerado

A V10:
- tenta recomputar XP pelo RPC `setorx_recompute_xp_totals`;
- lê `profiles.xp_total`;
- se todos estiverem zerados, soma `xp_events` no front-end como fallback;
- destaca o aluno atual com “você”.

## Arquivos novos

- `assets/js/setorx-v10-stable-plan-ranking.js`
- `assets/css/setorx-v10-stable-plan-ranking.css`

## Passo obrigatório para ranking

Rode no Supabase:

`supabase/atualizacao-ranking-sync-v6.sql`

Depois clique em **Sincronizar ranking**.
