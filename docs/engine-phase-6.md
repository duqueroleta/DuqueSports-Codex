# DUQUE Score Engine v1 - Fase 6

## Objetivo

A Fase 6 adiciona um Ranking Engine para classificar oportunidades de jogo e mercado.

Essa camada nao recalcula probabilidade. Ela usa os sinais ja produzidos pelo pipeline para gerar uma prioridade operacional simples, legivel e escalavel.

## Responsabilidade

O Opportunity Ranking Engine:

- recebe probabilidade calibrada do mercado recomendado;
- considera confidence score;
- considera Data Quality;
- considera reliability da calibracao;
- aplica penalizacao por riscos explicados;
- gera opportunity score de 0 a 100;
- classifica a oportunidade em tier.

## Tiers

- Elite: 82 ou mais.
- Forte: 70 a 81.
- Moderada: 58 a 69.
- Observacao: abaixo de 58.

## Decisao tecnica

O ranking foi separado da explicabilidade e da calibracao para preservar responsabilidade unica. No futuro, esse modulo podera ordenar milhares de partidas sem alterar o modelo estatistico principal.

## Proxima fase recomendada

A Fase 7 deve criar um Batch Analysis Service para processar todos os jogos mockados, ordenar por ranking e alimentar cards de "Melhores oportunidades do dia".
