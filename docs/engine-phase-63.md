# DUQUE Score Engine - Phase 63

## Objetivo

Normalizar a confianca resumida das partidas antes do uso na interface.

## Entrega

- Foi criado o utilitario puro `normalizeMatchConfidence`.
- Valores numericos sao limitados ao intervalo entre zero e cem.
- Valores ausentes ou invalidos sao representados como indisponiveis.
- Exibicao, barras, classificacao, ordenacao e medias usam o mesmo contrato.
- Medias ignoram valores indisponiveis em vez de trata-los como zero.
- Foi criada uma suite dedicada com `node:assert`.
- Nenhuma biblioteca adicional foi instalada.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-63`.

## Impacto tecnico

Scores invalidos nao geram larguras quebradas, classificacoes enganosas ou medias incorretas. Os mocks validos preservam exatamente os numeros e rotulos existentes.

## Proxima fase recomendada

Criar um modelo de apresentacao para odds da partida, normalizando valores numericos e estados indisponiveis antes de exibi-los nos cards e na analise completa.
