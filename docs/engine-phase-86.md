# DUQUE Score Engine - Phase 86

## Objetivo

Medir a calibracao da selecao mais provavel de cada mercado liquidado, com relatorios reproduziveis por faixa de confianca e particao historica.

## Entrega

- Foi criado `calibrationSamples.js`.
- Cada mercado liquidado gera uma amostra da selecao com maior probabilidade.
- A amostra registra mercado, selecao, probabilidade e acerto observado.
- Mercados `push`, `void` ou `partial` nao geram amostras.
- Casos bloqueados ou rejeitados permanecem sem amostras.
- Foi criado `calibrationMetrics.js` com dez faixas de 10 pontos percentuais.
- Probabilidades de 0 e 100 permanecem em faixas validas e deterministicas.
- Cada faixa informa quantidade, probabilidade media, frequencia observada e gap.
- O relatorio calcula Expected Calibration Error em pontos percentuais.
- O relatorio calcula Maximum Calibration Error em pontos percentuais.
- O Brier binario da selecao principal permanece na escala de zero a um.
- Foi criado `CalibrationReportService.js`.
- O relatorio usa `canonical-calibration-report.v1` e identidade deterministica.
- Resultados sao separados em geral, treino, calibracao e teste.
- Backtests invalidos e amostras malformadas sao rejeitados.
- Relatorios sinteticos usam `claimStatus: infrastructure-only`.
- Dados observados permanecem `candidate-not-approved` ate revisao cientifica.
- Foi criada a decima sexta suite do Engine.
- A versao foi atualizada para `duque-score-engine-v1.phase-86`.

## Limites da versao

- O relatorio avalia somente a selecao principal de cada mercado.
- Nao mede ainda calibracao por tipo de mercado ou competicao.
- Faixas vazias permanecem com metricas `null`.
- A fixture sintetica valida calculos e contratos, nao desempenho preditivo.
- Intervalos de confianca e teste de significancia ainda nao foram implementados.

## Impacto tecnico

O Engine agora consegue responder se previsoes apresentadas com determinada confianca ocorreram em frequencia semelhante, sem misturar particoes nem transformar dados sinteticos em evidencia cientifica.

## Proxima fase recomendada

Adicionar segmentacao das metricas por tipo de mercado e tamanho minimo de amostra, preparando comparacoes confiaveis entre versoes do modelo.
