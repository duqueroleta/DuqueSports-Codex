# DUQUE Score Engine v1 - Fase 3

## Objetivo

A Fase 3 adiciona o primeiro nucleo estatistico formal do projeto: uma matriz de gols baseada em distribuicao de Poisson.

Ela substitui probabilidades heuristicas por mercados derivados dos gols esperados gerados pelas fases anteriores.

## Fluxo

1. Data Quality aprova ou bloqueia a partida.
2. Recency Engine calcula forma recente ponderada.
3. Opponent Strength Engine ajusta os sinais pelo nivel do adversario.
4. Feature Store registra os atributos oficiais.
5. Projection Pipeline calcula os gols esperados com contexto de mando e mata-mata.
6. Poisson Engine gera matriz de placares e mercados derivados.

## Saidas da Fase 3

- Probabilidade de vitoria do mandante.
- Probabilidade de empate.
- Probabilidade de vitoria do visitante.
- Probabilidade de Over 2.5.
- Probabilidade de Under 2.5.
- Probabilidade de ambas marcam.
- Placar modal.
- Matriz normalizada de placares.

## Decisao tecnica

A matriz e normalizada dentro do limite de 0 a 7 gols por equipe. Essa decisao mantem os mercados somando aproximadamente 100%, evita perda de massa probabilistica na cauda e preserva performance para analise de milhares de partidas.

## Proxima fase recomendada

A Fase 4 deve iniciar a camada de calibracao, comparando probabilidades projetadas contra faixas historicas e aplicando ajustes de confianca sem misturar a responsabilidade do modelo estatistico com regras de mercado.
