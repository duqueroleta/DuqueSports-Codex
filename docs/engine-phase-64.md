# DUQUE Score Engine - Phase 64

## Objetivo

Normalizar as odds decimais das partidas antes da exibicao na interface.

## Entrega

- Foi criado o utilitario puro `normalizeMatchOdds`.
- Numeros e textos com ponto ou virgula decimal sao suportados.
- Odds menores ou iguais a um e valores nao finitos sao descartados.
- A exibicao valida usa duas casas decimais de forma consistente.
- Cards, carrossel e analise completa reutilizam o mesmo contrato.
- Foi criada uma suite dedicada com `node:assert`.
- Nenhuma biblioteca adicional foi instalada.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-64`.

## Impacto tecnico

Odds invalidas nao produzem textos enganosos ou formatos inconsistentes. Os mocks atuais preservam exatamente a apresentacao com duas casas decimais.

## Proxima fase recomendada

Normalizar os campos textuais essenciais da partida, como times, campeonato, sinal, horario e status, criando fallbacks seguros para cards e detalhes.
