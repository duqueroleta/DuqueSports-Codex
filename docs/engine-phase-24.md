# DUQUE Score Engine - Fase 24

## Objetivo

Separar os dados mockados de futuras fontes reais por meio de uma camada de adapter.

## Entrega

- Criacao do `MockEngineDataAdapter`.
- Criacao do `engineDataService` para consumo da UI.
- Pipeline preparado para receber e preservar metadados da fonte de dados.
- Contrato mock de API expondo a fonte de dados usada na execucao.
- Painel visual `Data Adapter` na pagina Dados.
- Testes cobrindo adapter, pipeline e contrato de API.

## Decisao tecnica

A camada foi criada sem conectar APIs externas. O objetivo e estabilizar o contrato de entrada antes de trocar mocks por fontes reais, evitando que o pipeline, a UI e a API futura precisem ser reescritos.

## Proxima evolucao sugerida

Criar adapters especializados para partidas, mercados e auditorias, mantendo o adapter agregado como ponto unico de composicao.
