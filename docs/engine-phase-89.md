# DUQUE Score Engine - Phase 89

## Objetivo

Comparar dois modelos candidatos sobre evidencias compativeis, produzindo deltas reproduziveis sem escolher vencedor ou autorizar promocao.

## Entrega

- Foi criado `canonical-model-comparison.v1`.
- Foi criado `ModelComparisonService.js`.
- Foi criado `modelComparisonMetrics.js`.
- A referencia e o candidato precisam ser registros distintos da mesma familia.
- Ambos precisam usar o mesmo dataset congelado e nivel de evidencia.
- Os backtests precisam cobrir exatamente as mesmas partidas.
- A versao do avaliador precisa ser igual.
- Modelo, largura das faixas e piso amostral da calibracao precisam coincidir.
- Registro, backtesting e calibracao sao reconciliados dentro de cada conjunto.
- O registro nao pode anteceder seus artefatos de avaliacao.
- Deltas usam sempre `candidate-minus-baseline`.
- Cobertura, bloqueios, rejeicoes, mercados liquidados, hit rate, Brier e Log Loss sao comparados.
- ECE, erro maximo e Brier de calibracao sao comparados no geral e por particao.
- Segmentos dos cinco mercados canonicos preservam adequacao amostral.
- O campo de direcao explica se menor valor e preferivel ou se a metrica e apenas descritiva.
- Comparacoes sinteticas usam `infrastructure-only`.
- `automaticPromotion` permanece sempre falso.
- A decisao permanece `manual-review-required`.
- O contrato nao possui campo de vencedor.
- Foi criada a decima nona suite do Engine.
- A versao foi atualizada para `duque-score-engine-v1.phase-89`.

## Interpretacao dos deltas

Um delta negativo em Brier, Log Loss ou ECE indica apenas que o candidato apresentou valor numericamente menor sobre o mesmo conjunto. Isso nao prova superioridade geral, estabilidade futura ou significancia estatistica.

Hit rate e cobertura sao descritivos. Um modelo pode aumentar acertos escolhendo previsoes mais conservadoras, bloquear mais partidas ou alterar a distribuicao de confianca. A decisao exige leitura conjunta das metricas.

## Limites da versao

- Nao existem intervalos de confianca para os deltas.
- Nao ha teste de significancia ou correcao para multiplas comparacoes.
- A fixture sintetica nao permite conclusoes sobre desempenho.
- O comparador nao persiste historico.
- Nao existe aprovacao, promocao ou rollback de modelos.

## Impacto tecnico

Mudancas no Engine podem ser avaliadas sobre a mesma base e metodologia sem comparacoes acidentais entre datasets ou partidas diferentes. A saida permanece um insumo para revisao, nunca uma decisao automatica.

## Proxima fase recomendada

Iniciar a fundacao do backend com uma especificacao de API e persistencia para armazenar artefatos canonicos sem expor credenciais no frontend.
