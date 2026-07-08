# DUQUE Score Engine v1 - Fase 7

## Objetivo

A Fase 7 adiciona um Batch Analysis Service para processar todos os jogos mockados e ordenar as melhores oportunidades do dia.

## Responsabilidade

O Batch Analysis Service:

- recebe uma lista de partidas;
- adapta cada partida ao formato do engine;
- executa o Projection Pipeline completo;
- extrai ranking, mercado recomendado e risco;
- ordena por opportunity score;
- expõe top oportunidades para a UI.

## Decisao tecnica

O processamento em lote foi implementado como modulo puro dentro do engine, sem depender de React ou do mock API. A camada `services` apenas embrulha esse resultado com o delay mockado atual.

Essa separacao prepara o sistema para processar milhares de partidas no futuro sem reescrever a UI.

## Saidas da Fase 7

- Total de jogos analisados.
- Media de score das principais oportunidades.
- Top 5 oportunidades.
- Lista completa ordenada por score.

## Proxima fase recomendada

A Fase 8 deve conectar o ranking batch nas telas de Jogos e Mercados, permitindo filtros por tier, campeonato e mercado recomendado.
