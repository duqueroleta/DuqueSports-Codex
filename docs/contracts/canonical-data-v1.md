# Contratos Canonicos de Futebol v1

## Objetivo

Definir formatos internos estaveis para receber dados de qualquer provedor sem acoplar o frontend ou o Engine ao payload externo.

## Principios

- Todo contrato possui `schemaVersion` explicita.
- IDs internos sao separados de IDs externos.
- Datas usam UTC em ISO 8601.
- Campos indisponiveis usam `null`, nunca zero inventado.
- Validadores retornam erros estruturados com `path`, `code` e `message`.
- Payloads brutos nao fazem parte do contrato canonico.

## canonical-match.v1

Representa identidade, agenda e estado principal da partida.

| Bloco | Responsabilidade |
| --- | --- |
| `source` | Provedor, ID externo e horario de coleta |
| `competition` | Competicao, nome e temporada |
| `kickoffAt` | Inicio da partida em UTC |
| `status` | Estado normalizado da partida |
| `teams` | IDs e nomes de mandante e visitante |
| `score` | Placar anulavel e nao negativo |
| `context` | Informacao de mando neutro |
| `dataQuality` | Frescor e completude do registro |

Exemplo executavel: `src/engine/contracts/examples/canonicalMatch.v1.js`.

## canonical-match-statistics.v1

Representa um snapshot estatistico ligado a `matchId`. Pode descrever jogo completo, primeiro tempo, segundo tempo ou leitura ao vivo.

| Bloco | Responsabilidade |
| --- | --- |
| `source` | Provedor, ID externo da partida e horario de coleta |
| `period` | Escopo temporal do snapshot |
| `minute` | Minuto obrigatorio para snapshot `live` |
| `teams.home` | Metricas do mandante |
| `teams.away` | Metricas do visitante |
| `dataQuality` | Frescor e completude do snapshot |

Metricas v1: gols, xG, xGOT, posse, chutes, chutes no alvo, escanteios, faltas, cartoes amarelos e cartoes vermelhos.

Regras de coerencia:

- chutes no alvo nao podem superar chutes;
- posse combinada deve permanecer aproximadamente em 100%;
- contagens devem ser inteiras e nao negativas;
- xG e xGOT devem ser numeros nao negativos;
- minuto ao vivo deve ficar entre 0 e 130;
- completude deve ficar entre 0 e 100.

Exemplo executavel: `src/engine/contracts/examples/canonicalMatchStatistics.v1.js`.

## canonical-match-events.v1

Representa a linha do tempo canonica de uma partida. O lote e ligado a `matchId`, enquanto cada evento possui identidade deterministica derivada do provedor, da partida externa e do ID externo do evento.

| Bloco | Responsabilidade |
| --- | --- |
| `source` | Provedor, ID externo da partida e horario de coleta |
| `events[].id` | ID interno deterministico e idempotente |
| `events[].externalId` | Identidade original do evento no provedor |
| `events[].type` | Gol, cartao, substituicao ou penalti perdido |
| `events[].period` | Periodo normalizado da partida |
| `events[].minute` | Minuto absoluto dentro da partida |
| `events[].stoppageMinute` | Acrescimo anulavel |
| `events[].sequence` | Desempate de eventos no mesmo instante |
| `events[].details` | Dados discriminados conforme o tipo |
| `dataQuality` | Frescor e completude do lote |

Regras de coerencia:

- a mesma combinacao provedor + partida externa + evento externo sempre produz o mesmo ID interno;
- IDs internos e externos nao podem se repetir no mesmo lote;
- eventos devem estar em ordem cronologica estrita;
- o minuto deve ser compativel com o periodo informado;
- gols exigem autor e qualificacao normalizada;
- cartoes exigem tipo e atleta;
- substituicoes exigem atletas de entrada e saida distintos;
- dados indisponiveis continuam representados por `null`.

Exemplo executavel: `src/engine/contracts/examples/canonicalMatchEvents.v1.js`.

## canonical-market.v1

Representa uma definicao estavel de mercado para uma partida. O contrato separa identidade, periodo, linha e selecoes dos precos oferecidos por casas de apostas.

Tipos v1:

- resultado da partida;
- dupla chance;
- total de gols;
- ambas marcam;
- total de escanteios.

Regras de coerencia:

- o ID e derivado de partida, tipo, periodo e linha;
- mercados sem linha exigem `line: null`;
- totais exigem linha positiva em incrementos de 0,25;
- selecoes sao unicas e devem corresponder ao tipo do mercado;
- nomes e rotulos nao substituem as chaves canonicas.

Exemplo executavel: `src/engine/contracts/examples/canonicalMarket.v1.js`.

## canonical-odds-snapshot.v1

Representa os precos de um mercado em uma casa e instante especificos. Cada nova captura gera outro snapshot sem alterar o historico anterior.

| Bloco | Responsabilidade |
| --- | --- |
| `id` | Identidade idempotente da captura |
| `matchId` | Partida canonica relacionada |
| `marketId` | Mercado canonico relacionado |
| `source` | Provedor e IDs externos da partida e do mercado |
| `bookmaker` | Casa responsavel pelos precos |
| `capturedAt` | Instante UTC da cotacao |
| `format` | Formato decimal canonico |
| `status` | Mercado aberto, suspenso ou encerrado |
| `selections` | Preco e estado por selecao |
| `dataQuality` | Frescor e completude do snapshot |

Regras de coerencia:

- IDs incluem origem, casa, partida externa, mercado externo e instante de captura;
- `capturedAt` nao pode ser posterior ao horario de coleta;
- selecoes abertas exigem odd decimal maior que 1;
- selecoes suspensas ou liquidadas podem usar preco `null`;
- chaves e IDs externos de selecao nao podem se repetir;
- a validacao cruzada exige a mesma partida, mercado e conjunto de selecoes.

Exemplo executavel: `src/engine/contracts/examples/canonicalOddsSnapshot.v1.js`.

## canonical-projection.v1

Representa uma execucao reproduzivel do Engine para uma partida. O contrato liga o input congelado, a versao do Engine, os submodelos, as metricas e as probabilidades produzidas.

| Bloco | Responsabilidade |
| --- | --- |
| `id` | Identidade idempotente da execucao |
| `matchId` | Partida canonica analisada |
| `status` | Execucao concluida ou bloqueada |
| `input` | Snapshot de entrada e limite temporal dos dados |
| `execution` | Versao do Engine e horario de geracao |
| `models` | Modelos estatistico, de calibracao e explicacao |
| `metrics` | xG esperado, confianca, qualidade e reliability |
| `predictions` | Probabilidades agrupadas por mercado canonico |
| `evidence` | Features, fundamentos, riscos e motivos de bloqueio |

Regras de coerencia:

- o ID e derivado da partida, input, versao do Engine e horario de execucao;
- a projecao nao pode anteceder o limite temporal dos dados;
- probabilidades ficam entre 0 e 100 e cada mercado soma aproximadamente 100%;
- mercados e selecoes previstos devem corresponder aos contratos canonicos;
- execucoes concluidas exigem xG, confianca, reliability, previsoes e evidencias;
- execucoes bloqueadas preservam qualidade e motivos, sem publicar saidas estatisticas;
- bookmaker, snapshot de odds e preco decimal sao rejeitados pelo contrato.

Exemplo executavel: `src/engine/contracts/examples/canonicalProjection.v1.js`.

### Adaptacao do ProjectionPipeline

`CanonicalProjectionAdapter.js` converte a saida atual do Engine para `canonical-projection.v1` e cria os mercados canonicos correspondentes.

- `homeWin`, `draw` e `awayWin` alimentam resultado da partida;
- `over25` e `under25` alimentam total de 2,5 gols;
- `btts` alimenta a selecao `yes`, enquanto `no` usa seu complemento;
- versoes dos modelos sao preservadas a partir do trace real;
- Feature Store recebe identidade derivada do input e do catalogo;
- execucoes bloqueadas preservam apenas qualidade e motivos;
- horario de corte e geracao sempre sao fornecidos pelo chamador;
- o envelope executa validacao de mercados, projecao e relacionamentos.

## canonical-projection-audit.v1

Representa a avaliacao pos-jogo de uma projecao concluida. O contrato relaciona previsao, resultado final, regra de liquidacao, classificacao e metricas cientificas reproduziveis.

| Bloco | Responsabilidade |
| --- | --- |
| `id` | Identidade idempotente da auditoria |
| `matchId` | Partida canonica auditada |
| `projectionId` | Projecao canonica avaliada |
| `result` | Snapshot final, horario e placar observado |
| `evaluation` | Versao do avaliador e horario da auditoria |
| `outcomes` | Liquidacao e erro de cada mercado previsto |
| `summary` | Contagens e medias derivadas dos outcomes |

Classificacoes v1: `hit`, `miss`, `push`, `void` e `partial`.

Metricas:

- Brier Score: media dos erros quadraticos normalizada pelo numero de selecoes;
- Log Loss: logaritmo natural negativo da probabilidade atribuida a selecao observada;
- `push`, `void` e `partial` ficam fora das medias cientificas nesta versao;
- cada metrica e recalculada contra a projecao, impedindo valores manuais inconsistentes.

Regras de coerencia:

- o ID e derivado da projecao, resultado, versao do avaliador e horario;
- a auditoria nao pode anteceder a projecao nem o resultado final;
- apenas projecoes concluidas podem ser auditadas;
- todo mercado previsto deve possuir exatamente um outcome;
- selecao prevista, classificacao, Brier e Log Loss devem ser reproduziveis;
- resumo e medias sao derivados dos outcomes;
- odd, stake, lucro, ROI e bookmaker sao rejeitados pela auditoria cientifica.

Exemplo executavel: `src/engine/contracts/examples/canonicalProjectionAudit.v1.js`.

## Relacionamento

Uma partida possui um registro `canonical-match.v1`, pode possuir varios snapshots `canonical-match-statistics.v1`, uma linha do tempo `canonical-match-events.v1`, varios mercados `canonical-market.v1` e varias execucoes `canonical-projection.v1`. Cada mercado pode receber muitos snapshots `canonical-odds-snapshot.v1`, e cada projecao concluida pode receber uma auditoria `canonical-projection-audit.v1`. Todos preservam os IDs internos de relacionamento.

## Fora da versao atual

- escalacoes e atletas;
- arbitragem e estadio detalhados;
- payload bruto do fornecedor;
- persistencia ou endpoint de API.

Esses elementos receberao contratos independentes apenas quando houver requisitos e dados confirmados.
