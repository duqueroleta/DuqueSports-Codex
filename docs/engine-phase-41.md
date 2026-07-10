# DUQUE Score Engine - Phase 41

## Objetivo

Centralizar as opcoes e regras de filtragem da lista de Mercados.

## Entrega

- O modulo `marketFilters.js` passou a expor os seis filtros da lista de Mercados.
- A funcao `matchMarketListFilter` concentra as regras de gols, resultado, escanteios, baixo risco e alta forca.
- A `MarketsPage` ficou responsavel somente pelo estado, busca e composicao da interface.
- Os valores dos filtros foram preservados para manter compatibilidade com as preferencias salvas no navegador.
- Foram adicionados testes automatizados para todas as categorias da lista.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-41`.

## Impacto tecnico

As regras deixaram de depender da pagina React e agora podem ser testadas e reutilizadas sem renderizar a interface. Isso reduz o acoplamento e prepara a evolucao dos filtros com dados reais.

## Proxima fase recomendada

Extrair a grade e os estados de carregamento, erro e resultado vazio da pagina de Mercados para um componente dedicado.
