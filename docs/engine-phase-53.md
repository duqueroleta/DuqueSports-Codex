# DUQUE Score Engine - Phase 53

## Objetivo

Isolar o painel de decisao da partida e centralizar o destino comercial do bilhete.

## Entrega

- Foi criado o componente `MatchActionPanel` em `components/matches/detail`.
- O painel recebe somente o sinal recomendado e encapsula a acao de abertura do bilhete.
- O link de afiliado foi movido para `config/affiliateLinks.js`.
- A pagina de detalhe e o carrossel mobile passaram a consumir a mesma configuracao.
- O destino continua abrindo em uma nova aba com `noreferrer`.
- Os estilos e breakpoints do painel foram movidos para `match-action-panel.css`.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-53`.

## Impacto tecnico

O link comercial agora possui uma unica fonte de verdade. Alteracoes futuras de parceiro ou rastreamento nao exigem edicoes em componentes de interface.

## Proxima fase recomendada

Extrair o bloco de probabilidades principais para completar a modularizacao da pagina de detalhe da partida.
