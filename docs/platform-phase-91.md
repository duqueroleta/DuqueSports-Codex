# DUQUE Score Platform - Phase 91

## Objetivo

Implementar o primeiro recorte vertical aprovado do backend, servindo competicoes e partidas mockadas sem banco, provedor ou dependencia externa.

## Entrega

- Runtime Node.js com `node:http`.
- Nenhuma dependencia adicionada ao projeto.
- Servidor separado do bundle React.
- Repositorio esportivo em memoria.
- Mapper isolado entre mocks e read models da API.
- `GET /api/v1/competitions`.
- `GET /api/v1/matches` com filtros e cursor.
- `GET /api/v1/matches/:matchId`.
- Envelope `api-envelope.v1`.
- Erros estruturados sem stack trace.
- CORS por allowlist.
- Headers basicos de seguranca e `Cache-Control: no-store`.
- Limite de pagina entre 1 e 100.
- Datas ausentes permanecem `null`.
- Odds nao fazem parte do read model publico desta fase.
- Relogio e gerador de request ID sao injetaveis para testes.
- Suite de integracao usa servidor HTTP real em porta efemera.
- `npm test` passou a incluir testes da API.
- A versao do Engine permanece na Fase 89.

## Limites da versao

- O servidor funciona apenas localmente.
- O deploy da Vercel continua servindo somente o frontend Vite.
- O frontend ainda consome seus services mockados atuais.
- Nao ha PostgreSQL, cache, worker ou autenticacao interna.
- Nao existe integracao com provedor esportivo.
- Os read models sao transitorios porque os mocks nao possuem datas, fusos ou IDs canonicos completos de equipes.

## Proxima fase recomendada

Criar um cliente HTTP no frontend protegido por feature flag, mantendo fallback para os services mockados e validando o recorte de competicoes e partidas sem alterar a experiencia publicada.
