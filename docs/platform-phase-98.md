# DUQUE Score Platform - Phase 98

## Objetivo

Limitar o tempo de encerramento gracioso do backend sem interromper requisicoes que terminem dentro da janela operacional.

## Entrega

- Configuracao `API_SHUTDOWN_TIMEOUT_MS`.
- Padrao de 10 segundos.
- Faixa validada entre 100 ms e 120 segundos.
- Timer iniciado somente durante o shutdown.
- Cancelamento do timer quando o servidor fecha normalmente.
- `closeAllConnections()` executado somente apos o prazo.
- Registro controlado quando a janela graciosa expira.
- Resultado de `whenStopped()` informa se o encerramento foi forcado.
- Scheduler e cancelador injetaveis para testes deterministas.
- Teste com requisicao HTTP deliberadamente pendente.
- Testes dos limites da nova variavel de ambiente.
- A versao do Engine permanece na Fase 89.

## Comportamento

1. O runtime recebe `stop()` ou um sinal do sistema.
2. `server.close()` interrompe novas conexoes e aguarda as atuais.
3. Se todas terminarem no prazo, o timer e cancelado.
4. Se o prazo expirar, conexoes remanescentes sao encerradas.
5. O runtime remove listeners e conclui no estado `stopped`.

## Limites da versao

- O fechamento forcado cobre conexoes HTTP gerenciadas pelo servidor Node.js.
- WebSockets e upgrades ainda nao existem no projeto.
- Banco, cache e workers ainda nao possuem hooks de drenagem.
- O timeout nao tenta repetir requisicoes interrompidas.

## Proxima fase recomendada

Adicionar tracking de requisicoes HTTP em andamento e incluir apenas sua contagem agregada no health check operacional, permitindo observar drenagem sem armazenar URLs ou dados de usuarios.
