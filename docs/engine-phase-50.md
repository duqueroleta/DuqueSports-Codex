# DUQUE Score Engine - Phase 50

## Objetivo

Isolar o painel de projecao estatistica do detalhe da partida.

## Entrega

- Foi criado o componente `EngineProjectionPanel` em `components/matches/detail`.
- As oito metricas da projecao passaram a ser definidas em uma configuracao unica.
- Projecoes ausentes ou bloqueadas continuam sem renderizar o painel.
- O rotulo visual fixo `Fase 6` foi removido e substituido por `Engine v1`.
- A explicacao do ranking recebeu uma mensagem segura de fallback.
- Os estilos especificos foram movidos para `engine-projection-panel.css`.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-50`.

## Impacto tecnico

A pagina de detalhe da partida deixou de conhecer a estrutura interna das metricas do Engine. O painel pode evoluir sem ampliar a responsabilidade da pagina.

## Proxima fase recomendada

Extrair o painel de explicabilidade da IA para um componente dedicado com CSS proprio.
