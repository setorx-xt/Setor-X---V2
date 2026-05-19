# Setor X V9 — Login rápido

## O que mudou

Antes, o login carregava junto com todos os módulos pesados:

- Vade Mecum
- Lei Seca
- Estatísticas
- Workspace PRO
- Banco QX
- scripts V23/V25/V27/V30

Agora a página carrega assim:

1. Login e camada online primeiro.
2. Plataforma pesada em segundo plano.
3. Ao clicar em módulos internos, o carregamento é antecipado.

## Arquivo novo

`assets/js/setorx-performance-loader-v9.js`

Ele faz o carregamento tardio dos módulos pesados.

## Se algum módulo demorar

Espere aparecer:

`Plataforma carregada.`

Ou clique no módulo desejado, que o carregamento é forçado.
