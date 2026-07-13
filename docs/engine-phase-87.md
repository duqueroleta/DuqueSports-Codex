# DUQUE Score Engine - Phase 87

## Objetivo

Segmentar os relatorios de calibracao por tipo canonico de mercado e impedir comparacoes prematuras com poucas observacoes.

## Entrega

- Amostras de calibracao agora preservam `marketType`.
- Resultado da partida, dupla chance, total de gols, ambas marcam e escanteios possuem segmentos independentes.
- Cada segmento possui resumo geral e resumos de treino, calibracao e teste.
- Foi criado `calibrationSegmentation.js`.
- O piso operacional foi definido em 30 amostras liquidadas.
- Segmentos abaixo do piso usam `insufficient-sample`.
- Segmentos a partir do piso usam `eligible`.
- Metricas descritivas continuam disponiveis abaixo do piso, mas nao autorizam comparacao.
- Tipos de mercado desconhecidos sao rejeitados.
- Identidade de mercado e selecao tornou-se obrigatoria nas amostras.
- Tipos sem observacoes permanecem visiveis com zero amostras.
- O modelo foi atualizado para `top-prediction-calibration-v2`.
- O relatorio continua com schema `canonical-calibration-report.v1` por ser uma extensao compativel.
- Foi criada a decima setima suite do Engine.
- A versao foi atualizada para `duque-score-engine-v1.phase-87`.

## Interpretacao do limite

Trinta amostras constituem um piso operacional de triagem. Esse numero nao garante poder estatistico, representatividade, estabilidade temporal ou aprovacao cientifica. Comparacoes formais ainda exigem dados observados, intervalos de confianca e analise por contexto.

## Limites da versao

- A fixture sintetica possui menos de 30 amostras por mercado e todos os seus segmentos permanecem insuficientes.
- O limite e igual para todos os mercados nesta versao.
- Nao ha intervalo de confianca para ECE ou Brier.
- Nao existe comparacao entre versoes do modelo.
- Segmentacao por competicao e temporada continua pendente.

## Impacto tecnico

O Engine deixa de apresentar uma unica calibracao agregada como se todos os mercados tivessem o mesmo comportamento. A adequacao amostral fica explicita em cada recorte.

## Proxima fase recomendada

Criar um registro versionado de modelos que relacione codigo, dataset, features, parametros, calibracao e execucoes de backtesting.
