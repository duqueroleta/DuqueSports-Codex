# DUQUE Score Engine - Phase 52

## Objetivo

Isolar os cards da analise completa no detalhe da partida.

## Entrega

- Foi criado o componente `MatchAnalysisGrid` em `components/matches/detail`.
- Mercado recomendado, projecao, cenario e gestao de risco passaram a usar um unico molde de card.
- Os indicadores avancados sao convertidos para o mesmo contrato visual.
- A configuracao dos textos saiu de `MatchDetailPage`.
- Metricas ausentes passaram a ser tratadas como uma lista vazia.
- Os estilos e breakpoints da grade foram movidos para `match-analysis-grid.css`.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-52`.

## Impacto tecnico

A pagina de detalhe agora apenas fornece a partida ao componente. A composicao dos cards pode evoluir sem adicionar regras de apresentacao na rota.

## Proxima fase recomendada

Extrair o painel final de acao e centralizar o link de afiliado em uma configuracao compartilhada.
