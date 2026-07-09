# DUQUE Score Engine - Phase 28

## Objetivo

Criar uma camada de quarentena para entradas rejeitadas pelos adapters de dados.

## Entrega

- Criacao do `DataAdapterQuarantineService`.
- O adapter agregado agora expoe `quarantine` junto com `validation`.
- Registros invalidos recebem `entityName`, motivo, severidade e acao operacional.
- A tela de Dados exibe o status de quarentena e a quantidade de registros retidos.
- O contrato de API preserva a quarentena dentro de `dataSource`.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-28`.

## Impacto tecnico

A validacao continua decidindo se a fonte e aceitavel, enquanto a quarentena passa a explicar o que foi retido e por qual motivo. Isso separa governanca de entrada de processamento estatistico, preparando o engine para fontes reais sem poluir os modulos de modelagem.

## Proxima fase recomendada

Implementar um modo de preflight no pipeline para interromper a execucao antes da criacao de dashboard, snapshot e auditoria quando a quarentena tiver registros rejeitados criticos.
