# Checklist final — Setor X Online

## Antes de subir

1. Abra `assets/js/online-config.js`.
2. Preencha:
   - `window.SETORX_SUPABASE_URL`
   - `window.SETORX_SUPABASE_ANON_KEY`
3. Não use `service_role`.

## Depois de subir na Vercel

1. Abra o link da Vercel em aba anônima.
2. Veja se o ícone aparece na aba do navegador.
3. Clique em **Criar acesso**.
4. Se houver erro, leia a mensagem abaixo dos botões.
5. Crie sua conta.
6. Rode `supabase/promover-mentor.sql`.
7. Faça login novamente.

## Teste de aluno

1. Crie uma segunda conta.
2. Verifique se ela fica pendente.
3. Entre como mentor.
4. Ative a conta.
5. Faça login como aluno.
6. Confirme que os módulos aparecem somente após acesso ativo.
