# DUQUE Score Engine - Phase 54

## Objetivo

Isolar as probabilidades principais no detalhe da partida.

## Entrega

- Foi criado o componente `MatchProbabilitiesPanel` em `components/matches/detail`.
- O componente recebe somente a lista de probabilidades da partida.
- Listas vazias deixam de renderizar uma secao sem conteudo.
- A largura visual das barras e limitada ao intervalo de 0% a 100%.
- Os percentuais exibidos e a ordem dos indicadores foram preservados.
- Os estilos e breakpoints foram movidos para `match-probabilities-panel.css`.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-54`.

## Impacto tecnico

A pagina de detalhe deixou de conhecer a estrutura interna dos indicadores de probabilidade. O bloco pode evoluir de forma independente e segura.

## Proxima fase recomendada

Extrair a faixa de times do `DetailHero` para completar a composicao modular da pagina de partida.
