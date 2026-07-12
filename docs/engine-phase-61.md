# DUQUE Score Engine - Phase 61

## Objetivo

Normalizar as probabilidades resumidas das partidas antes da renderizacao.

## Entrega

- Foi criado o utilitario puro `normalizeMatchProbabilities`.
- Numeros textuais sao convertidos para valores numericos.
- Valores abaixo de zero ou acima de cem sao limitados ao intervalo suportado.
- Entradas sem rotulo, sem valor numerico ou com rotulo duplicado sao descartadas.
- O painel de detalhe e o carrossel mobile reutilizam a mesma normalizacao.
- Foi criada uma suite dedicada com `node:assert`.
- Nenhuma biblioteca adicional foi instalada.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-61`.

## Impacto tecnico

Dados incompletos ou fora do contrato nao produzem barras quebradas, porcentagens invalidas ou chaves React duplicadas. Os mocks validos mantem exatamente a mesma apresentacao.

## Proxima fase recomendada

Adicionar uma camada equivalente de normalizacao para as metricas resumidas da partida antes de exibi-las no Hero e no carrossel mobile.
