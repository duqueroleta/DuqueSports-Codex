# DUQUE Score Engine - Phase 56

## Objetivo

Consolidar o carregamento da partida e da projecao estatistica em um hook dedicado.

## Entrega

- Foi criado o hook `useMatchDetailData` em `hooks`.
- Partida e projecao continuam sendo carregadas em paralelo.
- O loading e o erro principal continuam sendo definidos pela partida.
- Falhas da projecao permanecem isoladas e nao bloqueiam o restante da pagina.
- O hook expoe loading e erro secundarios para evolucoes futuras da interface.
- O retry principal passou a reiniciar os dois carregamentos.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-56`.

## Impacto tecnico

`MatchDetailPage` deixou de importar servicos e de coordenar requisicoes diretamente. A rota agora se concentra apenas na composicao da interface e nos estados visuais.

## Proxima fase recomendada

Criar um componente de composicao para o Hero da partida e reduzir as propriedades montadas diretamente em `MatchDetailPage`.
