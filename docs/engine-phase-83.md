# DUQUE Score Engine - Phase 83

## Objetivo

Transformar resultados finais observados em liquidacoes reproduziveis e gerar automaticamente `canonical-projection-audit.v1`, mantendo a avaliacao cientifica separada de dados comerciais.

## Entrega

- Foi criado `CanonicalMarketSettlementService.js` com regras versionadas.
- Resultado da partida, total de gols, ambas marcam e total de escanteios podem ser liquidados.
- Linhas de meio gol produzem `over` ou `under`.
- Linhas inteiras iguais ao total observado produzem `push`.
- Linhas asiaticas de 0,25 e 0,75 produzem `partial` quando aplicavel.
- Escanteios ausentes, periodos sem placar parcial e tipos sem regra inequivoca produzem `void`.
- Nenhum valor ausente e substituido por zero.
- Foi criado `CanonicalProjectionAuditService.js` para relacionar projecao, mercados e resultado final.
- Outcomes, classificacoes, Brier Score, Log Loss e resumo sao derivados automaticamente.
- IDs e horarios continuam deterministas e fornecidos pelo chamador.
- Projecoes bloqueadas nao geram auditoria.
- Mercados ausentes e resultados malformados retornam erros estruturados sem interromper a execucao.
- Odd, stake, lucro, ROI e bookmaker continuam fora do fluxo cientifico.
- Foi criada a decima terceira suite do Engine.
- A versao foi atualizada para `duque-score-engine-v1.phase-83`.

## Limites da versao

- A liquidacao usa apenas o placar final e, opcionalmente, o total de escanteios observado.
- Mercados de primeiro e segundo tempo permanecem `void` sem placares parciais confiaveis.
- Dupla chance permanece `void` porque suas selecoes se sobrepoem e exigem uma representacao propria para avaliacao probabilistica.
- Nao ha persistencia, endpoint de API ou integracao com fornecedor.

## Impacto tecnico

O Engine agora percorre internamente o ciclo projecao, resultado e auditoria usando contratos canonicos. A avaliacao e reproduzivel e pode ser reutilizada por um futuro backtesting em lote sem depender da interface.

## Proxima fase recomendada

Criar um dataset historico minimo e versionado para executar o primeiro backtesting fora da amostra sobre projecoes e auditorias canonicas.
