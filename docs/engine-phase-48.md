# DUQUE Score Engine - Phase 48

## Objetivo

Encapsular os indicadores resumidos do detalhe de Mercado.

## Entrega

- Foi criado o componente `MarketRecommendationPanel`.
- Odd media, risco, auditoria e tendencia passaram a ser definidos por uma configuracao unica.
- A renderizacao repetida dos quatro cartoes foi substituida por composicao reutilizavel.
- Os estilos compartilhados `detail-grid` e `detail-card` foram preservados sem duplicacao.
- O CSS proprio garante linhas e alturas estaveis para os cartoes do painel.
- A rota e o contrato do objeto `market` foram mantidos.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-48`.

## Impacto tecnico

A `MarketDetailPage` agora se limita a estados, dados e composicao dos paineis. Novos indicadores podem ser adicionados em uma unica configuracao.

## Proxima fase recomendada

Unificar carregamento, erro e estado nao encontrado das paginas de detalhe em um componente reutilizavel.
