# DUQUE Score Engine v1 - Fase 14

## Objetivo

A Fase 14 cria snapshots de estado do engine.

O snapshot consolida versao, totais, oportunidades, mercados e auditorias em uma estrutura serializavel, pronta para persistencia futura.

## Responsabilidade

O Engine Snapshot Service:

- registra versao do engine;
- cria um snapshotId deterministico;
- consolida totais executivos;
- preserva top oportunidades;
- preserva top mercados;
- preserva resumo de auditorias.

## Decisao tecnica

O snapshot ainda nao grava em banco. Ele apenas gera a estrutura de estado para evitar acoplamento prematuro com persistencia.

## Saidas da Fase 14

- Snapshot ID.
- Engine version.
- Scope.
- Totais e qualidade.
- Top oportunidades.
- Top mercados.
- Resumo de auditorias.

## Proxima fase recomendada

A Fase 15 deve preparar uma camada de persistencia mockada/local para snapshots, com historico em memoria e recuperacao por ID.
