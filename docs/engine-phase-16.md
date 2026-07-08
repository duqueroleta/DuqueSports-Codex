# DUQUE Score Engine - Fase 16

## Objetivo

Adicionar uma camada de exportacao e importacao JSON para snapshots do motor estatistico.

## Entrega

- Criacao do `EngineSnapshotJsonService`.
- Envelope JSON versionado com formato `duque-engine-snapshot-json-v1`.
- Validacao basica de contrato antes de exportar ou importar.
- Preservacao de `snapshotId`, `engineVersion`, `model` e conteudo completo do snapshot.
- Painel visual em Dados para indicar payload, formato e status de importacao.

## Decisao tecnica

A fase nao grava arquivos no disco e nao usa banco de dados. O servico e puro para manter o ciclo testavel e preparar uma futura camada de persistencia real sem acoplar a UI.

## Proxima evolucao sugerida

Implementar schema validation e migracoes entre versoes de snapshot antes de conectar armazenamento externo.
