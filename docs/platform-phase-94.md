# DUQUE Score Platform - Phase 94

## Objetivo

Adicionar um health check operacional ao backend local, separado das rotas publicas esportivas e sem expor configuracao sensivel.

## Entrega

- `GET /internal/v1/health`.
- Read model versionado como `health-read.v1`.
- Estado do processo, nome e versao do servico.
- Inicio, instante da verificacao e uptime em segundos.
- Versoes dos contratos HTTP atualmente servidos.
- `Cache-Control: no-store` e headers de seguranca existentes.
- Relogio, inicio do processo e versao injetaveis para testes.
- Health check independente do repositorio esportivo.
- Rejeicao de metodos diferentes de GET.
- Testes HTTP em porta efemera e verificacao de ausencia de campos sensiveis.
- A versao do Engine permanece na Fase 89.

## Decisoes

- O endpoint pertence ao prefixo operacional `/internal/v1`.
- O payload nao inclui variaveis de ambiente, memoria, caminhos, stack traces ou dependencias externas.
- `healthy` nesta fase significa que o processo HTTP esta respondendo e consegue construir seus contratos basicos.
- Banco e provedor ainda nao participam da saude porque nao foram integrados.

## Limites da versao

- O backend continua apenas local.
- Ainda nao existe autenticacao de servico para rotas internas.
- Antes de qualquer deploy externo, o prefixo operacional deve ser bloqueado no gateway ou protegido por identidade de servico.
- Nao existem probes separados de liveness e readiness.

## Proxima fase recomendada

Adicionar ao cliente de desenvolvimento uma consulta controlada ao health check e apresentar seu estado no diagnostico tecnico, sem executar a chamada no build publico.
