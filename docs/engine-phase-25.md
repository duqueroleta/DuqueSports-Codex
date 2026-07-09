# DUQUE Score Engine - Fase 25

## Objetivo

Especializar a camada de adapters de dados em fontes separadas para partidas, mercados e auditorias.

## Entrega

- Criacao do `MockMatchesDataAdapter`.
- Criacao do `MockMarketsDataAdapter`.
- Criacao do `MockAuditsDataAdapter`.
- Atualizacao do `MockEngineDataAdapter` para compor os adapters especializados.
- Exposicao de auditorias no painel `Data Adapter`.
- Testes cobrindo adapters especializados, adapter agregado, pipeline e contrato de API.

## Decisao tecnica

O adapter agregado continua sendo o ponto unico de composicao para a UI e para o pipeline. Os adapters especializados isolam responsabilidades e preparam a troca gradual de mocks por fontes reais sem quebrar contratos existentes.

## Proxima evolucao sugerida

Criar validadores de entrada para cada adapter, garantindo que partidas, mercados e auditorias cheguem ao engine com campos obrigatorios e formato consistente.
