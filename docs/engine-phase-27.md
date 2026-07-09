# DUQUE Score Engine - Phase 27

## Objetivo

Bloquear a execucao operacional do pipeline quando a fonte de dados declarada pelo adapter estiver invalida.

## Entrega

- O status de execucao agora avalia `dataSource.validation`.
- Fontes invalidas geram a mensagem `data-source.validation.invalid`.
- O pipeline passa o contrato de fonte de dados para o resolvedor de status.
- Execucoes com fonte invalida retornam status `blocked` e contrato HTTP `409`.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-27`.

## Impacto tecnico

A validacao do adapter deixa de ser apenas informativa na tela de Dados e passa a participar da governanca do engine. Isso impede que uma rodada operacional seja tratada como concluida quando a entrada declarada pelo adapter falha nas regras minimas de integridade.

## Proxima fase recomendada

Implementar uma quarentena de dados invalidos antes das etapas pesadas de modelagem. A fase atual bloqueia a execucao no contrato final; a proxima pode separar os registros rejeitados, registrar motivos por entidade e reduzir custo de processamento em cenarios de entrada corrompida.
