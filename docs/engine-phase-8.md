# DUQUE Score Engine v1 - Fase 8

## Objetivo

A Fase 8 conecta o ranking em lote com filtros operacionais na tela de Jogos.

O usuario passa a filtrar partidas por tier de oportunidade e mercado recomendado pela IA, usando o resultado do Batch Analysis Service.

## Responsabilidade

O modulo Batch Filters:

- gera opcoes de tier e mercado a partir das oportunidades analisadas;
- filtra oportunidades por tier;
- filtra oportunidades por mercado recomendado;
- permanece independente de React.

## Decisao tecnica

Os filtros foram implementados no engine/batch para manter regra de produto testavel e reutilizavel. A tela de Jogos apenas persiste a escolha do usuario e aplica os IDs filtrados sobre a lista de partidas.

## Saidas da Fase 8

- Filtro por tier.
- Filtro por mercado recomendado pela IA.
- Persistencia local dos filtros.
- Testes automatizados dos filtros batch.

## Proxima fase recomendada

A Fase 9 deve levar os filtros e rankings para a tela de Mercados, criando uma visao consolidada por tipo de mercado e campeonato.
