# DUQUE Score Engine - Phase 84

## Objetivo

Criar a base versionada de datasets historicos para treino, calibracao e teste, com protecoes explicitas contra vazamento temporal.

## Entrega

- Foi criado `canonical-historical-dataset.v1`.
- A identidade do dataset deriva de nome, versao e instante de congelamento.
- Datasets sao classificados como `synthetic` ou `observed`.
- Proveniencia, horario de importacao e licenca sao obrigatorios.
- Particoes `train`, `calibration` e `test` possuem janelas cronologicas nao sobrepostas.
- Cada registro referencia snapshots imutaveis de features e resultado.
- O corte das features nao pode ocorrer depois do inicio da partida.
- O resultado nao pode ser finalizado antes da partida.
- O dataset nao pode ser congelado antes dos resultados que declara conter.
- Partidas e snapshots duplicados sao rejeitados.
- Registros precisam permanecer ordenados por horario da partida.
- Cada particao precisa conter ao menos um registro.
- Foi criada uma fixture com seis partidas sinteticas para validar apenas a infraestrutura.
- A fixture usa a licenca `internal-test-only` e nao representa evidencia de desempenho.
- Foi criada a decima quarta suite do Engine.
- A versao foi atualizada para `duque-score-engine-v1.phase-84`.

## Limites da versao

- A fixture nao contem partidas reais.
- Nenhum fornecedor ou dataset comercial foi selecionado.
- O contrato referencia snapshots, mas nao persiste os dados.
- Ainda nao existe executor de backtesting em lote.
- Nenhuma metrica da fixture pode ser apresentada como validacao cientifica do produto.

## Impacto tecnico

O futuro backtesting passa a depender de um manifesto reproduzivel, com separacao temporal verificavel. Isso reduz o risco de contaminar treino ou calibracao com informacoes do periodo de teste.

## Proxima fase recomendada

Criar o executor de backtesting em lote sobre o contrato historico, produzindo auditorias canonicas agregadas por particao sem alterar o dataset congelado.
