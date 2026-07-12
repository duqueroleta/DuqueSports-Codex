# DUQUE Score Engine - Phase 57

## Objetivo

Encapsular a composicao completa do Hero da partida.

## Entrega

- Foi criado o componente `MatchDetailHero` em `components/matches/detail`.
- O componente recebe somente a partida carregada.
- Titulo, competicao, horario, status e score sao derivados internamente.
- A identidade visual da competicao passou a ser resolvida dentro da composicao.
- A faixa de times continua reutilizando `MatchTeamsStrip`.
- `MatchDetailPage` deixou de importar o Hero generico e utilitarios visuais.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-57`.

## Impacto tecnico

A pagina de detalhe agora compoe blocos de alto nivel e nao conhece a estrutura interna do Hero. Alteracoes visuais da abertura da partida ficam concentradas em um unico componente.

## Proxima fase recomendada

Usar os estados secundarios de `useMatchDetailData` para comunicar carregamento ou indisponibilidade temporaria da projecao sem bloquear a partida.
