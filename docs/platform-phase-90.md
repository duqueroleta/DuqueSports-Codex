# DUQUE Score Platform - Phase 90

## Objetivo

Definir e submeter para aprovacao a arquitetura do backend, das APIs e da persistencia antes de escrever codigo de infraestrutura.

## Entrega

- Arquitetura modular e fronteiras de dependencia.
- Fluxos de ingestao, projecao e auditoria.
- API REST publica e operacional proposta.
- Envelopes de sucesso, erro e paginacao.
- Modelo relacional inicial para PostgreSQL.
- Separacao entre dados canonicos e payload bruto.
- Indices iniciais orientados aos fluxos conhecidos.
- Regras de idempotencia, migracao e retencao.
- ADR 002 com status `Proposto`.
- Gates explicitos antes da implementacao.
- Nenhum pacote, servidor, banco ou credencial foi criado.
- A versao do Engine permanece na Fase 89 porque o codigo cientifico nao mudou.

## Decisoes que exigem aprovacao

- backend modular separado do React;
- REST JSON versionado;
- PostgreSQL como banco canonico;
- armazenamento de objetos para payload bruto;
- primeiro recorte apenas com leitura mockada de competicoes e partidas.

## Proxima fase recomendada

Apos aprovacao do ADR 002, escolher o runtime HTTP e implementar o primeiro recorte vertical com repositorio em memoria, sem provedor ou banco real.
