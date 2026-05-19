# Correção Ranking V6 — Setor X Online

## Problema corrigido

O ranking podia não atualizar porque:

1. O XP era inserido no front-end, mas o `xp_total` do perfil podia não ser recalculado.
2. A função RPC `setorx_recompute_xp_totals` podia não existir ou não ter permissão.
3. O front-end não mostrava erro quando `xp_events` ou `profiles.xp_total` falhavam.
4. Havia duas camadas online renderizando ranking; ambas foram reforçadas.

## O que fazer no Supabase

Rode no SQL Editor:

`supabase/atualizacao-ranking-sync-v6.sql`

Esse arquivo:

- cria/garante `xp_events`;
- cria/garante `profiles.xp_total`;
- cria `setorx_add_xp`;
- cria `setorx_recompute_xp_totals`;
- cria trigger automático;
- libera permissões;
- recalcula o ranking atual.

## Como testar

1. Entre como aluno ativo.
2. Conclua um bloco do planejamento ou responda uma questão.
3. Abra Comando > Ranking.
4. Clique em **Sincronizar ranking**.
5. O aluno deve aparecer com XP atualizado.

Se aparecer diagnóstico na tela, copie a mensagem.
