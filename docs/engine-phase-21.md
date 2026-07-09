# DUQUE Score Engine - Fase 21

## Objetivo

Padronizar os estados de execucao do engine para UI, logs e futura API.

## Entrega

- Criacao do `EngineExecutionStatusService`.
- Contrato padronizado com estados `completed`, `partial` e `blocked`.
- Mensagens tecnicas estruturadas por codigo e severidade.
- Integracao do status ao `EngineExecutionPipeline`.
- Painel visual de status na pagina Dados.
- Testes cobrindo execucoes saudaveis, parciais e bloqueadas.

## Decisao tecnica

O status foi criado como servico separado do pipeline para manter responsabilidade unica. O pipeline executa a orquestracao; o status interpreta o resultado para consumo por interface, logs e futuras respostas de API.

## Proxima evolucao sugerida

Criar uma camada de relatorio executivo do pipeline para condensar status, auditoria, snapshot e oportunidades em um unico resumo pronto para usuarios e administradores.
