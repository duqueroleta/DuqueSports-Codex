# DUQUE Score Engine v1 - Fase 4

## Objetivo

A Fase 4 adiciona uma camada de calibracao probabilistica apos o modelo de Poisson.

O Poisson continua responsavel por transformar gols esperados em matriz de placares. A calibracao ajusta os mercados finais usando confiabilidade do dado e uma linha base conservadora.

## Responsabilidade

O Calibration Engine:

- recebe probabilidades projetadas pelo Poisson;
- calcula confiabilidade com Data Quality e confidence score;
- mistura a projecao com baselines conservadores;
- normaliza mercados 1X2 e Over/Under;
- devolve probabilidades finais prontas para exibicao.

## Por que separar do Poisson

O Poisson deve permanecer matematico e previsivel. A calibracao e uma camada posterior, responsavel por reduzir excesso de certeza quando a confiabilidade do input ainda nao justifica uma probabilidade muito agressiva.

Essa separacao preserva baixa acoplacao e facilita evoluir a calibracao futuramente com historico real, backtesting e dados de fechamento de mercado.

## Saidas da Fase 4

- Probabilidades finais calibradas.
- Reliability score da calibracao.
- Baselines utilizados.
- Trace tecnico separado no pipeline.

## Proxima fase recomendada

A Fase 5 deve implementar uma camada de explicabilidade, transformando sinais tecnicos do pipeline em fundamentos claros para o usuario: por que o mercado foi recomendado, quais fatores pesaram mais e quais riscos reduziram a confianca.
