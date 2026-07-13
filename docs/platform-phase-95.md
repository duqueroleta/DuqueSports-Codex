# DUQUE Score Platform - Phase 95

## Objetivo

Conectar o diagnostico tecnico do frontend ao health check do backend local sem gerar chamadas operacionais no build publico.

## Entrega

- Cliente HTTP dedicado ao contrato `health-read.v1`.
- Timeout de 2,5 segundos e cancelamento da requisicao.
- Validacao do envelope, schema, status, versao e uptime.
- Erros controlados para HTTP, rede, timeout e contrato invalido.
- Consulta habilitada apenas quando `DEV` e `VITE_SPORTS_API_ENABLED=true`.
- URL operacional configuravel por `VITE_SPORTS_HEALTH_URL`.
- Estado `Online`, `Offline`, `Consultando` ou `Nao habilitado` no painel tecnico.
- Versao do backend e uptime apresentados somente no ambiente local.
- Nenhuma chamada ao health check no build de producao.
- Testes do cliente contra servidor HTTP real em porta efemera.
- A versao do Engine permanece na Fase 89.

## Configuracao local

```env
VITE_SPORTS_API_ENABLED=true
VITE_SPORTS_API_URL=http://127.0.0.1:8787/api/v1
VITE_SPORTS_HEALTH_URL=http://127.0.0.1:8787/internal/v1/health
```

O backend e o frontend devem ser reiniciados depois da alteracao das variaveis.

## Limites da versao

- O health check continua restrito ao backend local.
- Nao ha polling; a leitura ocorre uma vez quando o painel e montado.
- O painel nao oferece retry dedicado nesta fase.
- `Online` confirma o processo HTTP, nao banco ou provedor ainda inexistentes.

## Proxima fase recomendada

Adicionar uma fronteira de configuracao validada no startup do backend, rejeitando porta e origens CORS invalidas antes de iniciar o processo HTTP.
