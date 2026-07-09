# DUQUE Score Engine - Phase 30

## Objetivo

Adicionar uma politica de severidade ao preflight para separar erros bloqueantes de avisos toleraveis.

## Entrega

- O preflight agora expoe `severityPolicy`.
- Severidade `error` continua bloqueando o pipeline antes da modelagem.
- Severidade `warning` gera alerta operacional, mas permite a execucao completa.
- O pipeline preserva status `completed` para entradas com avisos toleraveis.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-30`.

## Impacto tecnico

O engine passa a diferenciar corrupcao critica de inconsistencias menores. Isso evita interromper uma rodada inteira por avisos que podem ser acompanhados operacionalmente, mantendo governanca sem rigidez excessiva.

## Proxima fase recomendada

Expor o resumo do preflight na tela de Dados, mostrando `passed`, `warning` ou `blocked` em um card dedicado dentro do contrato tecnico.
