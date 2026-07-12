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

## Relacionamento

Uma partida possui um registro `canonical-match.v1` e pode possuir varios snapshots `canonical-match-statistics.v1`, todos relacionados pelo mesmo `matchId` interno.

## Fora da versao atual

- eventos de jogo;
- escalacoes e atletas;
- mercados e odds;
- arbitragem e estadio detalhados;
- payload bruto do fornecedor;
- persistencia ou endpoint de API.

Esses elementos receberao contratos independentes apenas quando houver requisitos e dados confirmados.
