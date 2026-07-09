# DUQUE Score Engine - Phase 29

## Objetivo

Adicionar uma etapa de preflight ao pipeline para interromper a execucao antes das etapas pesadas quando a entrada estiver bloqueada por validacao ou quarentena.

## Entrega

- Criacao do `EnginePreflightService`.
- O pipeline agora executa preflight antes de dashboard, snapshot, persistencia, importacao e auditoria.
- Entradas com quarentena ou validacao invalida retornam `blocked` sem criar snapshot artificial.
- O contrato de API passou a aceitar `snapshot`, `totals` e `audit` nulos em bloqueios de preflight.
- Execucoes saudaveis preservam o fluxo completo e expõem `preflight.status = passed`.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-29`.

## Impacto tecnico

O engine deixa de desperdiçar processamento em dados que ja foram rejeitados na borda do sistema. Isso melhora governanca, performance futura e clareza operacional sem misturar regras de entrada com modelagem estatistica.

## Proxima fase recomendada

Criar uma politica de severidade para preflight, separando erros bloqueantes de avisos toleraveis. Isso permitirá aceitar pequenas inconsistencias nao criticas sem interromper toda a rodada de processamento.
