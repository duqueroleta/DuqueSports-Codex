# DUQUE Score Platform - Phase 100

## Objetivo

Separar a vida do processo HTTP de sua capacidade de atender trafego, preparando a operacao para futuras dependencias sem alterar o diagnostico legado do frontend.

## Entrega

- `GET /internal/v1/health/live`.
- Contrato `liveness-read.v1`.
- `GET /internal/v1/health/ready`.
- Contrato `readiness-read.v1`.
- Liveness independente de repositorio e readiness.
- Readiness baseada somente em checks obrigatorios.
- HTTP `503` quando um check obrigatorio nao esta pronto.
- Checks opcionais com estado `not-configured` sem bloqueio.
- Checks atuais para runtime HTTP e repositorio em memoria.
- Placeholders explicitos para banco e provedor ainda inexistentes.
- `/internal/v1/health` preservado para compatibilidade.
- Versao operacional atualizada para `platform.phase-100`.
- Testes de independencia, transicao ready/not-ready e contrato legado.
- A versao do Engine permanece na Fase 89.

## Semantica

- Liveness responde se o processo consegue servir HTTP.
- Readiness responde se o processo deve receber trafego.
- `not-configured` so e permitido para checks opcionais.
- O corpo de readiness permanece estruturado mesmo quando o HTTP e `503`.

## Limites da versao

- Repositorio em memoria e considerado pronto enquanto estiver composto no runtime.
- Nao existe banco, cache ou provedor para executar probes reais.
- Os endpoints continuam locais e sem autenticacao de servico.
- A protecao do prefixo interno permanece gate obrigatorio antes de deploy externo.

## Proxima fase recomendada

Adicionar middleware de identificacao e logging estruturado por request ID, registrando apenas metodo, rota normalizada, status, duracao e contagens, com redacao explicita de query strings e cabecalhos.
