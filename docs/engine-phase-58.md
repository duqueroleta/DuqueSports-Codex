# DUQUE Score Engine - Phase 58

## Objetivo

Comunicar os estados secundarios da projecao sem bloquear os dados da partida.

## Entrega

- Foi criado o componente `EngineProjectionSection` em `components/matches/detail`.
- O carregamento da projecao possui um estado visual discreto e acessivel.
- Falhas do Engine exibem uma mensagem isolada sem remover o restante da analise.
- O retry do erro reinicia somente a projecao estatistica.
- O estado de sucesso continua reutilizando `EngineProjectionPanel` e `AiExplanationPanel`.
- A animacao de carregamento respeita `prefers-reduced-motion`.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-58`.

## Impacto tecnico

A interface agora representa separadamente a disponibilidade da partida e do Engine. Isso melhora a resiliencia percebida sem acoplar a rota aos detalhes visuais de loading e erro.

## Proxima fase recomendada

Adicionar testes de interface automatizados para os estados de loading, erro e sucesso da projecao.
