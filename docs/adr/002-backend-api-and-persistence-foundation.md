# ADR 002 - Fundacao de Backend, API e Persistencia

- **Status:** Proposto
- **Data:** 2026-07-13
- **Escopo:** arquitetura, sem servidor ou banco provisionado

## Contexto

O frontend publicado usa dados mockados. O Engine ja possui contratos versionados para partidas, estatisticas, eventos, mercados, projecoes, auditorias, datasets e modelos. A proxima etapa precisa persistir esses artefatos e proteger credenciais sem acoplar o React a um provedor.

## Decisao proposta

1. Criar um backend modular separado do bundle Vite.
2. Expor REST JSON versionado em `/api/v1` e operacoes protegidas em `/internal/v1`.
3. Usar PostgreSQL para entidades canonicas e historico estruturado.
4. Manter payload bruto em armazenamento de objetos com checksum e retencao.
5. Compartilhar contratos puros do dominio sem importar infraestrutura no Engine.
6. Iniciar como servico modular, nao como microservicos.
7. Adotar jobs assincronos apenas para ingestao, projecao e auditoria quando necessario.
8. Manter leads e dados pessoais separados do dominio esportivo.

## Alternativas consideradas

### API dentro do React

Rejeitada. Exporia segredos, misturaria apresentacao e integracao e impediria controle confiavel de rate limit.

### Banco documental como fonte principal

Nao recomendado para a v1. As relacoes, identidades e auditorias exigem integridade referencial e consultas temporais previsiveis. JSON controlado continua disponivel no PostgreSQL para metadados.

### Microservicos desde o inicio

Rejeitada. A equipe e o volume atuais nao justificam deploys, observabilidade e consistencia distribuidos.

### Backend modular com PostgreSQL

Proposto. Mantem baixo acoplamento, integridade e caminho de evolucao sem complexidade prematura.

## Consequencias

### Positivas

- Segredos permanecem fora do navegador.
- Historico e reproduzibilidade ganham integridade transacional.
- Fornecedores podem ser trocados por adaptadores.
- API e dominio evoluem com versoes explicitas.

### Custos

- Operacao de backend, banco, backups e monitoramento.
- Migracoes e politicas de retencao passam a ser obrigatorias.
- Jobs exigirao idempotencia e tratamento de falhas.

## Gates antes da implementacao

1. Aprovar esta arquitetura.
2. Escolher runtime e framework HTTP.
3. Aprovar PostgreSQL gerenciado e ambiente de desenvolvimento.
4. Definir politica de segredos e acessos.
5. Confirmar licenca e retencao do provedor esportivo.
6. Aprovar o primeiro recorte vertical da API.

## Primeiro recorte recomendado

Implementar somente leitura de competicoes e partidas mockadas atraves do backend, usando uma interface de repositorio em memoria. Depois validar o mesmo contrato com PostgreSQL em ambiente de desenvolvimento, sem integrar o provedor esportivo no mesmo passo.
