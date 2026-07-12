# DUQUE Score Engine - Phase 81

## Objetivo

Definir uma auditoria cientifica canonica que compare probabilidades pre-jogo com resultados observados, sem usar retorno financeiro como medida de qualidade do modelo.

## Entrega

- Foi criado o schema `canonical-projection-audit.v1`.
- A auditoria relaciona partida, projecao, resultado final e versao do avaliador.
- A identidade e deterministica e inclui o horario da avaliacao.
- Foram normalizados os estados `settled`, `push`, `void` e `partial`.
- Foram normalizadas as classificacoes `hit`, `miss`, `push`, `void` e `partial`.
- O Brier Score usa erro quadratico medio por selecao.
- O Log Loss usa a probabilidade atribuida ao resultado observado.
- Metricas sao recalculadas contra a projecao com tolerancia numerica explicita.
- Push, void e partial ficam fora das medias nesta versao.
- Resumo, hits, misses e medias sao derivados dos outcomes.
- Odd, stake, lucro, ROI e bookmaker sao rejeitados.
- Foi criado um exemplo com dois hits e um miss.
- Foi criada a decima primeira suite do Engine.
- A versao do Engine foi atualizada para `duque-score-engine-v1.phase-81`.

## Impacto tecnico

O sistema passa a distinguir auditoria cientifica de apresentacao comercial. Isso prepara backtesting fora da amostra, comparacao entre versoes do modelo e metricas agregadas sem favorecer previsoes apenas porque uma odd ou retorno financeiro foi alto.

## Proxima fase recomendada

Criar um adaptador interno que converta a saida atual do `ProjectionPipeline` para `canonical-projection.v1`, validando o fluxo real de ponta a ponta sem API ou banco de dados.
