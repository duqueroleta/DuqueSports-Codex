# DUQUE Score Engine v1 - Fase 9

## Objetivo

A Fase 9 leva o resultado do batch para a tela de Mercados, criando um ranking agregado por mercado recomendado pela IA.

## Responsabilidade

O Market Ranking Service:

- agrupa oportunidades pelo mercado recomendado;
- calcula score medio;
- calcula probabilidade media;
- identifica o melhor jogo de cada mercado;
- lista campeonatos envolvidos;
- permite filtro por campeonato.

## Decisao tecnica

O ranking por mercado foi implementado como modulo puro dentro de `engine/batch`. A tela de Mercados apenas renderiza os resultados e controla o filtro de campeonato.

Isso preserva testabilidade e prepara a futura substituicao dos mocks por dados reais.

## Saidas da Fase 9

- Ranking agregado por mercado.
- Score medio por mercado.
- Probabilidade media por mercado.
- Melhor jogo associado a cada mercado.
- Filtro por campeonato.

## Proxima fase recomendada

A Fase 10 deve consolidar um Market Detail Intelligence, enriquecendo cada pagina de mercado com jogos relacionados, explicacao agregada e alertas de risco.
