# DUQUE Score Platform - Phase 97

## Objetivo

Extrair o bootstrap HTTP para um runtime testavel e controlar de forma previsivel o inicio, as falhas de bind e o encerramento do backend.

## Entrega

- Composicao isolada de configuracao, repositorio, handler e servidor HTTP.
- Estados `idle`, `starting`, `running`, `stopping`, `stopped` e `failed`.
- Metodos idempotentes de `start`, `stop` e `whenStopped`.
- Registro e remocao de listeners para `SIGINT` e `SIGTERM`.
- Encerramento gracioso com `server.close()`.
- Erros controlados para endereco ocupado, permissao e falha generica de bind.
- Protecao contra segunda inicializacao do mesmo runtime.
- Entrada `server.js` reduzida a iniciar e traduzir falhas seguras.
- Dependencias, relogio, sinais, logger e factory HTTP injetaveis.
- Teste HTTP real do runtime e do health check.
- Teste real de conflito de porta e encerramento por sinal.
- A versao do Engine permanece na Fase 89.

## Decisoes

- O runtime nao chama `process.exit()`.
- Em falha de startup, o arquivo executavel define apenas `process.exitCode = 1`.
- O sinal inicia o fechamento e deixa o event loop terminar naturalmente.
- Mensagens operacionais usam codigos controlados e nao reproduzem objetos de erro brutos.

## Limites da versao

- Nao existe timeout forcando o shutdown; conexoes ativas podem prolongar o encerramento.
- Nao existe drenagem de banco, cache ou worker porque essas dependencias ainda nao existem.
- O runtime continua em um unico processo Node.js.
- Reinicio automatico permanece responsabilidade do ambiente de execucao.

## Proxima fase recomendada

Adicionar um prazo maximo configuravel para shutdown, encerrando conexoes remanescentes somente depois da janela graciosa e cobrindo esse comportamento com relogio injetavel.
