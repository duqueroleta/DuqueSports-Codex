# DUQUE Score Engine - Phase 82

## Objetivo

Conectar a saida real do `ProjectionPipeline` ao contrato `canonical-projection.v1`, validando o fluxo interno de ponta a ponta sem API ou banco de dados.

## Entrega

- Foi criado `CanonicalProjectionAdapter.js`.
- Foi criada uma fabrica isolada para os mercados previstos pelo pipeline.
- IDs numericos internos sao normalizados para o namespace canonico de partidas.
- Resultado da partida, total de 2,5 gols e ambas marcam recebem mercados canonicos.
- As probabilidades calibradas do pipeline sao preservadas.
- A selecao `no` de ambas marcam e calculada como complemento de `btts`.
- Versoes dos modelos sao lidas do trace executado.
- O Feature Store recebe identidade derivada do snapshot de input e do catalogo.
- Horario de corte e geracao sao parametros obrigatorios, sem relogio implicito.
- O caminho bloqueado preserva Data Quality e motivos, sem mercados ou probabilidades.
- O envelope valida mercados, projecao e relacionamentos.
- Entradas malformadas retornam erros estruturados e nao sao mascaradas.
- Foi criada a decima segunda suite do Engine.
- A versao do Engine foi atualizada para `duque-score-engine-v1.phase-82`.

## Impacto tecnico

Os contratos deixam de ser apenas exemplos isolados e passam a validar a saida efetivamente produzida pelo Engine. A adaptacao continua independente da interface, de casas de apostas e de fornecedores externos.

## Proxima fase recomendada

Criar um servico de liquidacao canonica que derive outcomes a partir do resultado final e gere `canonical-projection-audit.v1` sem dados comerciais.
