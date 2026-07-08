# DUQUE Score Engine - Fase 18

## Objetivo

Adicionar um registry de migracoes para snapshots antigos do motor estatistico.

## Entrega

- Criacao do `EngineSnapshotMigrationService`.
- Registry versionado com `snapshot-migration-registry-v1`.
- Migracao de snapshots legados `duque-score-engine-v1.*` para a versao atual.
- Atualizacao de `engineVersion` e `snapshotId` durante a migracao.
- Integracao da migracao ao fluxo de importacao JSON.
- Indicador visual de migracao na pagina Dados.

## Decisao tecnica

A migracao foi implementada como uma camada separada do schema e do JSON. Isso preserva responsabilidade unica e prepara o projeto para evoluir com migracoes reais quando houver banco, historico persistente e snapshots de producao.

## Proxima evolucao sugerida

Criar uma camada de auditoria de eventos do engine para registrar execucoes, snapshots, migracoes e decisoes estatisticas relevantes.
