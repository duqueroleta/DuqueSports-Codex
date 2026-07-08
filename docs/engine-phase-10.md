# DUQUE Score Engine v1 - Fase 10

## Objetivo

A Fase 10 adiciona inteligencia contextual nas paginas individuais de mercado.

Cada mercado passa a consultar o batch atual para encontrar jogos relacionados, resumir aderencia estatistica e exibir risco operacional agregado.

## Responsabilidade

O Market Detail Intelligence Service:

- recebe o mercado aberto;
- compara o mercado com oportunidades do batch;
- identifica jogos relacionados;
- calcula score medio;
- calcula probabilidade media;
- destaca o melhor jogo relacionado;
- gera alerta de risco.

## Decisao tecnica

A logica foi criada em um modulo puro dentro de `engine/batch`, mantendo a pagina React apenas como camada de apresentacao.

Isso preserva testabilidade e facilita substituir os mocks por dados reais sem reescrever a experiencia.

## Saidas da Fase 10

- Quantidade de jogos relacionados.
- Score medio.
- Probabilidade media.
- Top jogo relacionado.
- Explicacao agregada.
- Alerta de risco.

## Proxima fase recomendada

A Fase 11 deve criar uma camada de auditoria historica por mercado, simulando acerto, volatilidade e estabilidade para preparar o futuro backtesting real.
