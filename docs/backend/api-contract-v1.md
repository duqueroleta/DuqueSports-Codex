# DUQUE Score Backend - API Contract v1

## Convencoes

- Prefixo publico: `/api/v1`.
- Prefixo operacional: `/internal/v1`.
- JSON usa os nomes dos contratos canonicos.
- Horarios usam UTC ISO 8601.
- IDs sao opacos para clientes.
- Listas usam cursor, nunca offset em tabelas historicas grandes.
- Operacoes de escrita aceitam `Idempotency-Key`.

## Estado de implementacao

Implementado localmente entre as Fases 91 e 94:

- `GET /api/v1/competitions`;
- `GET /api/v1/matches` com `competitionId`, `status`, `cursor` e `limit`;
- `GET /api/v1/matches/:matchId`;
- `GET /internal/v1/health`;
- `GET /internal/v1/health/live`;
- `GET /internal/v1/health/ready`;
- envelopes, erros, CORS e paginacao.

As demais rotas deste documento continuam propostas.

## Envelope de sucesso

```json
{
  "data": {},
  "meta": {
    "requestId": "req_opaque",
    "schemaVersion": "api-envelope.v1",
    "generatedAt": "2026-07-13T23:50:00.000Z"
  }
}
```

Listas acrescentam `nextCursor`, que usa `null` quando nao ha proxima pagina.

## Envelope de erro

```json
{
  "error": {
    "code": "resource-not-found",
    "message": "Requested resource was not found.",
    "requestId": "req_opaque",
    "details": []
  }
}
```

Mensagens publicas nao exibem stack trace, SQL, credenciais ou resposta bruta do provedor.

## Endpoints publicos

| Metodo | Rota | Contrato principal |
| --- | --- | --- |
| GET | `/api/v1/competitions` | Competicoes habilitadas |
| GET | `/api/v1/matches` | Partidas por data, competicao e estado |
| GET | `/api/v1/matches/:matchId` | `canonical-match.v1` |
| GET | `/api/v1/matches/:matchId/statistics/latest` | `canonical-match-statistics.v1` |
| GET | `/api/v1/matches/:matchId/events` | `canonical-match-events.v1` |
| GET | `/api/v1/matches/:matchId/markets` | `canonical-market.v1` |
| GET | `/api/v1/matches/:matchId/projections/latest` | `canonical-projection.v1` |
| GET | `/api/v1/projections/:projectionId/audit` | `canonical-projection-audit.v1` |

`latest` significa a ultima versao autorizada cujo corte de dados nao ultrapassa o instante permitido para o produto.

## Endpoints operacionais

| Metodo | Rota | Uso |
| --- | --- | --- |
| GET | `/internal/v1/health` | Saude, versao de contratos e uptime do processo |
| GET | `/internal/v1/health/live` | Liveness independente de dependencias |
| GET | `/internal/v1/health/ready` | Readiness das condicoes obrigatorias |
| POST | `/internal/v1/ingestion-runs` | Iniciar lote idempotente |
| GET | `/internal/v1/ingestion-runs/:runId` | Consultar execucao |
| POST | `/internal/v1/projection-runs` | Executar projecao congelada |
| POST | `/internal/v1/audit-runs` | Liquidar projecoes finalizadas |
| POST | `/internal/v1/backtest-runs` | Executar dataset versionado |
| GET | `/internal/v1/model-registrations` | Consultar candidatos |
| POST | `/internal/v1/model-comparisons` | Comparar candidatos compativeis |
| GET | `/internal/v1/quarantine-records` | Investigar entradas rejeitadas |

Essas rotas nao ficam acessiveis pelo navegador publico. O health check funciona apenas no servidor local nesta fase; antes de um deploy externo, o gateway devera restringir o acesso ao prefixo operacional.

### Health operacional

`GET /internal/v1/health` inclui `requests.active` e `requests.totalStarted`. Sao apenas contadores agregados do processo atual. A API nao armazena nem publica URL, metodo, IP, cabecalhos ou payload das requisicoes.

O endpoint `/live` retorna `200` enquanto o processo HTTP consegue responder. `/ready` retorna `200` quando todos os checks obrigatorios estao prontos e `503` quando pelo menos um esta indisponivel. Checks opcionais `not-configured` nao bloqueiam readiness. `/internal/v1/health` permanece como contrato legado para o diagnostico local do frontend.

## Filtros e paginacao

`GET /api/v1/matches` aceita inicialmente:

- `dateFrom` e `dateTo` em UTC;
- `competitionId`;
- `status`;
- `cursor`;
- `limit`, entre 1 e 100.

Ordenacao padrao: `kickoffAt`, seguida por `id` para desempate estavel.

## Codigos HTTP

| Codigo | Uso |
| ---: | --- |
| 200 | Leitura ou operacao concluida |
| 202 | Job aceito para processamento |
| 400 | Parametros invalidos |
| 401 | Identidade ausente |
| 403 | Operacao nao autorizada |
| 404 | Recurso inexistente |
| 409 | Conflito de idempotencia ou estado |
| 422 | Contrato canonico rejeitado |
| 429 | Limite excedido |
| 500 | Falha interna sem detalhes sensiveis |
| 503 | Dependencia temporariamente indisponivel |

## Fora da v1

- autenticacao de usuarios finais;
- pagamentos ou assinatura;
- escrita publica de dados esportivos;
- payload bruto de fornecedor;
- endpoints administrativos no frontend publico;
- WebSocket antes de validar necessidade de atualizacao ao vivo.
