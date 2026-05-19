# Setor X PRO V4 Refinado — Banco QX reconstruído

Base geral preservada da V4. O módulo antigo de **Questões / Banco QX — modo prova, revisão e caderno de erros** foi substituído por um novo Banco de Questões profissional, mantendo HTML, CSS, JavaScript puro, localStorage e abertura direta pelo `index.html`.

## Principal mudança

- Banco QX reconstruído do zero dentro da seção de questões.
- Interface em estilo plataforma de questões, inspirada em QConcursos, TecConcursos e Projeto Caveira.
- Cadastro completo de questões com disciplina, assunto, banca, tipo, enunciado, conteúdo de apoio, alternativas, gabarito, comentário do professor, comentário pessoal, fonte e tags.
- Disciplinas puxadas automaticamente da Matriz do Edital.
- Filtros por disciplina, assunto, banca, tipo, status, revisão, erros, favoritas e busca textual.
- Modo prova com comentário, gabarito, estatísticas e revisão bloqueados antes da resposta.
- Histórico de tentativas, estatísticas por questão, comentário pessoal editável e motivo do erro.
- Revisão estilo Anki: erro em 1 dia; acertos avançam em 3, 7, 15, 30 e 60 dias; erro reseta o ciclo.
- Caderno de erros integrado por filtro, sem aba separada.
- Prevenção simples contra questão duplicada por enunciado.
- Integração com Meta Operacional, Dashboard, Patentes, revisão vencida e backup JSON.

## Como usar

Abra `index.html` diretamente no navegador.

Não há IA, API, Gemini, servidor obrigatório, framework ou banco externo.


## Como alterar as imagens manualmente

As imagens profissionais ficam em:

- `assets/images/setorx-emblema.png`
- `assets/images/setorx-logo-horizontal.png`
- `assets/images/setorx-quadro-patentes.png`

Para trocar manualmente:

1. Abra a pasta `assets/images`.
2. Substitua a imagem desejada por outra imagem com o mesmo nome.
3. Mantenha a extensão `.png`.
4. Abra novamente o `index.html` no navegador.
5. Caso o navegador mantenha a imagem antiga, pressione `Ctrl + F5` para recarregar sem cache.

Se quiser usar outro nome de arquivo, altere o caminho correspondente no `index.html`, procurando por `assets/images/`.


## Ajuste final do feedback de alternativas

Após responder uma questão no Banco QX:

- se a resposta marcada estiver correta, a alternativa fica verde;
- se a resposta marcada estiver errada, a alternativa fica vermelha;
- quando houver erro, o gabarito correto também fica destacado em verde.


## Patentes com imagens individuais

As imagens individuais das patentes ficam em `assets/images/patentes/`.
Para trocar manualmente um símbolo, substitua o arquivo `.png` correspondente por outro com o mesmo nome.


## Versão desktop / .EXE

Este pacote já contém a correção visual das patentes e os ícones em PNG.

Para gerar o `.exe` no Windows:

1. Instale o Node.js.
2. Extraia este ZIP.
3. Execute `GERAR-EXE-WINDOWS.bat`.
4. Ao final, abra a pasta `dist`.
5. O arquivo `.exe` portable será gerado lá.

Observação: o arquivo `ABRIR-COMO-APP-WINDOWS.cmd` abre o Setor X em janela de app pelo Edge/Chrome, sem barra de navegador.


## Executável

Use `Setor X.exe` para abrir o sistema como programa no Windows.
O `.exe` funciona como lançador local do app e precisa ficar na mesma pasta do `index.html` e da pasta `assets`.

As 250 frases autorais já foram adicionadas em `assets/js/app.js`.

## Camada Online PRO adicionada

Esta versão preserva a base tradicional do Setor X e adiciona uma camada online opcional:

- Acesso Online com Supabase;
- liberação manual dos alunos pelo mentor;
- apelido/codinome para ranking;
- planejamento individual por aluno;
- Banco QX Coletivo, separado do Banco QX local;
- ranking geral usando as imagens de patentes já existentes em `assets/images/patentes/`;
- documentação em `docs/`;
- SQL do Supabase em `supabase/schema.sql`.

A plataforma continua abrindo pelo `index.html`. Se o Supabase não estiver configurado, o Setor X local continua funcionando e a camada online mostra aviso de configuração.
