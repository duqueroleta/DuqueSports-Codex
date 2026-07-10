# DUQUE Score Engine - Phase 43

## Objetivo

Componentizar o hero de Mercados e tornar seu resumo orientado pelos dados carregados.

## Entrega

- Foi criado o componente `MarketsHero`.
- O seletor `getStrongestMarket` identifica a maior forca estatistica sem alterar os dados.
- O resumo passou a exibir nome e percentual do melhor mercado calculado.
- Carregamento, erro e ausencia de mercados possuem mensagens seguras no hero.
- Os estilos foram movidos para `markets-hero.css`, incluindo o breakpoint mobile.
- Foram adicionados testes para selecao do melhor mercado e colecao vazia.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-43`.

## Impacto tecnico

O destaque principal deixou de depender de valores fixos. Novos dados de mercados atualizarao automaticamente o resumo sem exigir alteracoes na interface.

## Proxima fase recomendada

Separar os estilos e a configuracao visual do painel `Batch Ranking`, concluindo a modularizacao da pagina de Mercados.
