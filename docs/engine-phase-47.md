# DUQUE Score Engine - Phase 47

## Objetivo

Extrair o hero compartilhado das paginas de detalhe.

## Entrega

- Foi criado o componente reutilizavel `DetailHero`.
- Mercado e partida passaram a fornecer titulo, descricao, score e navegacao por propriedades.
- O hero de partida preservou escudos, identidade visual dinamica e faixa de times por `children`.
- O hero de Mercado preservou forca da IA e tendencia.
- Os estilos especificos foram movidos para `detail-hero.css`.
- As superficies compartilhadas permaneceram centralizadas em `page-detail.css` sem duplicacao.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-47`.

## Impacto tecnico

As duas rotas de detalhe passaram a compartilhar uma unica estrutura visual. Mudancas futuras no hero podem ser feitas em um ponto sem divergencia entre jogos e mercados.

## Proxima fase recomendada

Extrair os quatro indicadores resumidos do Mercado para um componente de recomendacao com CSS proprio.
