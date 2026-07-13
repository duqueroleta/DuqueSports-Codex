# DUQUE Score Engine - Phase 85

## Objetivo

Executar backtesting em lote sobre datasets historicos congelados, gerando auditorias canonicas e metricas agregadas sem alterar os dados de origem.

## Entrega

- Foi criado `CanonicalBacktestRunner.js`.
- Cada registro historico exige exatamente um caso correspondente.
- Projecao, feature snapshot, corte temporal e resultado sao reconciliados com o dataset.
- Projecoes geradas depois do inicio da partida sao rejeitadas.
- Resultados diferentes do snapshot congelado sao rejeitados.
- Projecoes concluidas geram auditorias por meio do servico da Fase 83.
- Projecoes bloqueadas por Data Quality entram na cobertura sem publicar auditoria.
- Casos usam os estados `audited`, `blocked` e `rejected`.
- Foi criado `backtestAggregation.js` para metricas globais e por particao.
- Brier Score e Log Loss sao agregados diretamente pelos outcomes liquidados.
- Treino, calibracao e teste possuem resumos independentes.
- A execucao possui ID deterministico derivado de dataset, avaliador e horario.
- Datasets sinteticos recebem `evidenceLevel: infrastructure-only`.
- Datasets observados recebem apenas `scientific-candidate`, nunca aprovacao automatica.
- O runner nao altera o dataset congelado.
- Foi criada a decima quinta suite do Engine.
- A versao foi atualizada para `duque-score-engine-v1.phase-85`.

## Limites da versao

- A execucao atual usa somente a fixture sintetica.
- As metricas produzidas nao validam a capacidade preditiva do produto.
- Ainda nao existem intervalos de confianca, curvas de calibracao ou segmentacao por competicao.
- Casos precisam ser materializados pelo chamador; nao ha banco ou carregador externo.
- Nao existe paralelismo ou fila distribuida nesta fase.

## Impacto tecnico

O ciclo dataset, projecao, resultado, auditoria e agregacao agora pode ser reproduzido em lote. A mesma infraestrutura podera receber dados observados futuramente sem alterar os contratos cientificos.

## Proxima fase recomendada

Criar relatorios de calibracao por faixa de probabilidade e por particao, mantendo resultados sinteticos separados de evidencias observadas.
