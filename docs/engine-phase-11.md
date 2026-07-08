# DUQUE Score Engine v1 - Fase 11

## Objetivo

A Fase 11 adiciona uma auditoria historica simulada por mercado.

Essa camada prepara o sistema para backtesting real, mas ainda utiliza somente dados mockados e sinais derivados do batch atual.

## Responsabilidade

O Market Audit Service:

- recebe o mercado e as oportunidades relacionadas;
- calcula uma amostra simulada;
- estima taxa de acerto simulada;
- mede volatilidade do grupo;
- calcula estabilidade;
- classifica o tier de estabilidade.

## Decisao tecnica

A auditoria foi implementada como funcao deterministica. Ela nao usa aleatoriedade, portanto o resultado permanece estavel entre builds e testes.

Isso permite validar UX, contratos e explicabilidade antes de conectar historico real.

## Saidas da Fase 11

- Hit rate simulado.
- Volatilidade.
- Stability score.
- Tier de estabilidade.
- Amostra simulada.
- Notas tecnicas.

## Proxima fase recomendada

A Fase 12 deve criar uma tela consolidada de Auditorias por Mercado, agrupando estabilidade, volatilidade e sinais com maior consistencia.
