# DUQUE Score Engine - Phase 103

## Objetivo

Criar um modulo dedicado para contexto competitivo, removendo modificadores soltos do `ProjectionPipeline`.

## Entregas

- Criacao do `CompetitiveContextEngine`.
- Registro do modulo no `ScientificModuleCatalog`.
- O contexto agora classifica a competicao em familias:
  - liga;
  - copa mata-mata;
  - copa continental;
  - Copa do Mundo;
  - padrao.
- O modulo produz:
  - modificador de gols;
  - modificador de mandante;
  - modificador de visitante;
  - penalidade de risco;
  - tags explicaveis.
- O `ProjectionPipeline` usa o contexto competitivo no calculo de gols esperados.
- O `DuqueScoreCalibrationEngine` usa a penalidade contextual na confianca publicada.
- A versao foi atualizada para `duque-score-engine-v1.phase-103`.

## Decisao tecnica

Contexto competitivo deve ser um modulo rastreavel, nao uma colecao de condicionais dentro do pipeline. Isso prepara o engine para diferenciar campeonatos e formatos sem alterar as telas.

## Proximo passo

Implementar o modulo de consistencia defensiva para ajustar xG concedido, finalizacoes sofridas, defesas do goleiro e risco de ambas marcam.
