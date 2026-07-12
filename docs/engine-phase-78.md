# DUQUE Score Engine - Phase 78

## Objetivo

Definir a linha do tempo canonica de uma partida com identidade idempotente, ordenacao verificavel e detalhes proprios para cada tipo de evento.

## Entrega

- Foi criado o schema `canonical-match-events.v1`.
- O lote de eventos permanece separado da identidade e dos snapshots estatisticos.
- IDs internos sao derivados de forma deterministica do provedor, da partida externa e do ID externo do evento.
- Duplicacoes de IDs internos ou externos sao rejeitadas.
- A ordem cronologica usa periodo, minuto, acrescimo e sequencia.
- Minutos sao validados conforme o periodo da partida.
- Gols, cartoes, substituicoes e penaltis perdidos possuem detalhes discriminados.
- Foi criado um exemplo canonico executavel com gol, cartao e substituicao.
- Foi criada a oitava suite do Engine.
- Nenhuma API, banco, feed ao vivo ou provedor foi integrado.
- A versao do Engine foi atualizada para `duque-score-engine-v1.phase-78`.

## Impacto tecnico

Adaptadores futuros poderao reprocessar o mesmo feed sem criar eventos duplicados. A ordenacao estrita tambem prepara auditoria, reconciliacao e reconstrucao da linha do tempo sem acoplar o dominio ao formato de um fornecedor.

## Proxima fase recomendada

Definir contratos canonicos de mercados e odds como snapshots temporais independentes, preservando origem, horario de captura e rastreabilidade.
