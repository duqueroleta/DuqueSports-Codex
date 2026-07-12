# DUQUE Score Engine - Phase 72

## Objetivo

Extrair fixtures apenas para o contexto realmente compartilhado entre snapshots e pipeline.

## Entrega

- Foi criada a fixture `engineTestContext.mjs`.
- O dataset agregado e o contrato de fonte saudavel possuem uma unica fabrica.
- A montagem de dashboard e snapshot ocorre apenas na fixture especifica desse dominio.
- As suites continuam criando seus estados de erro, warning e repositorios de forma independente.
- O runner passou a ler `ENGINE_VERSION` em vez de manter uma fase fixa no texto.
- As 147 assercoes permanecem preservadas.
- Nenhuma biblioteca adicional foi instalada.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-72`.

## Impacto tecnico

A duplicacao de setup foi reduzida sem esconder os cenarios importantes de cada suite. Mudancas futuras no contrato mockado saudavel exigem atualizacao em um unico ponto.

## Proxima fase recomendada

Adicionar uma verificacao automatica no GitHub Actions usando `npm run verify`, impedindo que testes ou build quebrados avancem sem sinalizacao.
