# DUQUE Score Engine v1 - Fase 15

## Objetivo

A Fase 15 adiciona persistencia mockada/local para snapshots do engine.

Ela cria um repositorio em memoria com salvamento, historico e recuperacao por ID, sem conectar banco de dados.

## Responsabilidade

O Engine Snapshot Repository:

- salva snapshots por `snapshotId`;
- recupera snapshot por ID;
- expoe historico em memoria;
- permite reset para testes.

## Decisao tecnica

A persistencia foi mantida em memoria para validar contrato e UX antes de acoplar qualquer banco real.

## Saidas da Fase 15

- Save snapshot.
- Find snapshot by ID.
- Snapshot history.
- Painel visual de persistencia local.

## Proxima fase recomendada

A Fase 16 deve preparar uma camada de exportacao/importacao JSON para snapshots, facilitando backup, debug e futura migracao para banco real.
