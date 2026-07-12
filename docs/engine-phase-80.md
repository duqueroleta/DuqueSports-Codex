# DUQUE Score Engine - Phase 80

## Objetivo

Definir uma representacao canonica, reproduzivel e auditavel para as projecoes do Engine sem misturar probabilidades cientificas com odds comerciais.

## Entrega

- Foi criado o schema `canonical-projection.v1`.
- A identidade combina partida, snapshot de input, versao do Engine e horario da execucao.
- O limite temporal do input impede projecoes anteriores aos dados utilizados.
- Foram registrados os modelos estatistico, de calibracao e de explicacao.
- xG, confianca, Data Quality e reliability possuem limites explicitos.
- Probabilidades sao agrupadas por mercado e devem somar aproximadamente 100%.
- Uma validacao cruzada exige mercados e selecoes canonicos correspondentes.
- O estado `completed` exige saidas e evidencias completas.
- O estado `blocked` preserva os motivos sem publicar xG ou probabilidades.
- Bookmaker, snapshot de odds e preco decimal sao rejeitados pela projecao.
- Foi criado um exemplo executavel com resultado, total de gols e ambas marcam.
- Foi criada a decima suite do Engine.
- A versao do Engine foi atualizada para `duque-score-engine-v1.phase-80`.

## Impacto tecnico

Cada previsao passa a ter identidade e corte temporal proprios, permitindo reproducao e comparacao futura sem contaminacao por dados posteriores. A separacao de odds protege a avaliacao cientifica e prepara backtesting fora da amostra.

## Proxima fase recomendada

Definir o contrato canonico de auditoria, relacionando projecao, resultado observado, regra de liquidacao, classificacao do desfecho e metricas de erro.
