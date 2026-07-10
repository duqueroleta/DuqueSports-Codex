# DUQUE Score Engine - Phase 49

## Objetivo

Unificar os estados das paginas de detalhe.

## Entrega

- Foi criado o componente reutilizavel `DetailPageState`.
- Carregamento, falha e conteudo nao encontrado passaram a compartilhar uma unica estrutura.
- Mercado e jogo informam apenas recurso, destino de retorno e estado atual.
- A funcao `resolveDetailPageState` centraliza a prioridade entre os tres estados.
- `SkeletonGrid`, `ErrorState` e navegacao de retorno foram preservados.
- As mensagens receberam acentuacao consistente e continuam acessiveis por `aria-label`.
- O estilo de alinhamento do carregamento foi movido para `detail-page-state.css`.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-49`.

## Impacto tecnico

As paginas deixaram de duplicar tres fluxos de interface. Qualquer melhoria futura nos estados de detalhe passa a ser aplicada simultaneamente a jogos e mercados.

## Proxima fase recomendada

Revisar a pagina de detalhe de partida e iniciar a extracao dos paineis de projecao e explicabilidade da IA.
