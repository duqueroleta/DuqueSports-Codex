# DUQUE Score Engine - Phase 55

## Objetivo

Isolar a faixa de times exibida dentro do Hero da partida.

## Entrega

- Foi criado o componente `MatchTeamsStrip` em `components/matches/detail`.
- O componente recebe apenas os nomes do mandante e do visitante.
- A resolucao dos escudos passou a ficar encapsulada no novo componente.
- Partidas sem um dos times deixam de renderizar uma faixa incompleta.
- O separador visual foi marcado como decorativo para leitores de tela.
- Os estilos e o breakpoint mobile foram movidos para `match-teams-strip.css`.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-55`.

## Impacto tecnico

`MatchDetailPage` nao conhece mais a estrutura visual dos times nem depende diretamente de `TeamCrest`. O Hero recebe uma composicao pronta e reutilizavel.

## Proxima fase recomendada

Revisar a responsabilidade restante de `MatchDetailPage` e consolidar a obtencao de partida e projecao em um hook dedicado.
