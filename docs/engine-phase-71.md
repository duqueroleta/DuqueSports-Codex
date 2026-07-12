# DUQUE Score Engine - Phase 71

## Objetivo

Dividir a suite monolitica do Engine em testes menores organizados por dominio.

## Entrega

- A antiga suite de 447 linhas foi removida.
- Foram criadas suites para projecao, mercados, fontes de dados, snapshots e pipeline de execucao.
- Cada dominio monta seu proprio contexto e limpa repositorios em memoria quando necessario.
- Foi criado o runner `tests/run-engine-tests.mjs`.
- O comando `npm run test:engine` continua sendo a entrada unica para o Engine.
- As 147 assercoes e todos os cenarios do ciclo anterior foram preservados.
- O maior arquivo resultante possui 165 linhas, contra 447 da suite anterior.
- Nenhuma biblioteca adicional foi instalada.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-71`.

## Impacto tecnico

Falhas passam a indicar imediatamente o dominio afetado, os imports ficam locais a cada responsabilidade e novas coberturas podem crescer sem recriar um arquivo monolitico.

## Proxima fase recomendada

Adicionar um pequeno conjunto de fixtures reutilizaveis apenas onde houver duplicacao real entre snapshots e pipeline, mantendo independencia entre as suites.
