# DUQUE Score Engine - Phase 60

## Objetivo

Adicionar testes automatizados para os estados principais das paginas de detalhe.

## Entrega

- O resolvedor `resolveDetailPageState` foi separado do componente React.
- Os estados suportados agora sao `loading`, `error`, `not-found` e `ready`.
- Loading possui prioridade durante uma tentativa de retry.
- Foi criada uma suite dedicada com `node:assert`.
- As paginas de partida e mercado compartilham o mesmo contrato de estado.
- Nenhuma biblioteca adicional foi instalada.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-60`.

## Impacto tecnico

As decisoes de estado das paginas de detalhe podem ser validadas sem navegador ou acoplamento ao React. Os componentes permanecem responsaveis apenas pela renderizacao.

## Proxima fase recomendada

Adicionar testes para a transformacao dos dados exibidos no resumo da partida, cobrindo probabilidades ausentes e valores fora do intervalo esperado.
