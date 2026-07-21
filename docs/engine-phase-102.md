# DUQUE Score Engine - Phase 102

## Objetivo

Separar a confianca bruta do modelo do Duque Score publicado para o usuario.

## Entregas

- Criacao do `DuqueScoreCalibrationEngine`.
- Registro do modulo no `ScientificModuleCatalog`.
- O `ProjectionPipeline` agora calcula:
  - `rawConfidence`: confianca tecnica antes das penalidades;
  - `confidence`: Duque Score publicado apos calibracao conservadora.
- Penalidades aplicadas:
  - equilibrio alto entre xGs;
  - baixa confiabilidade de calibracao;
  - contexto de mata-mata;
  - campo neutro;
  - ausencia de probabilidade dominante em 1X2.
- O score publicado fica limitado a uma faixa mais prudente enquanto o engine ainda amadurece cientificamente.
- A versao foi atualizada para `duque-score-engine-v1.phase-102`.

## Decisao tecnica

O score extremo deve ser tratado como excecao, nao como padrao visual. Antes de dados reais, backtesting robusto e calibracao por competicao, o sistema deve preferir comunicacao conservadora.

## Proximo passo

Implementar o modulo de contexto competitivo para separar liga, copa, mata-mata, derby, campo neutro e pressao de tabela.
