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

## Relacionamento

Uma partida possui um registro `canonical-match.v1`, pode possuir varios snapshots `canonical-match-statistics.v1` e uma linha do tempo `canonical-match-events.v1`. Todos sao relacionados pelo mesmo `matchId` interno.

## Fora da versao atual

- escalacoes e atletas;
- mercados e odds;
- arbitragem e estadio detalhados;
- payload bruto do fornecedor;
- persistencia ou endpoint de API.

Esses elementos receberao contratos independentes apenas quando houver requisitos e dados confirmados.
