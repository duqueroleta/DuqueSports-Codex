# DUQUE Score Engine v1 - Fase 12

## Objetivo

A Fase 12 cria uma visao consolidada de auditorias por mercado.

Ela agrupa os resultados simulados da auditoria de cada mercado e exibe estabilidade, volatilidade e consistencia em uma experiencia unica.

## Responsabilidade

O Market Audit Dashboard Service:

- executa inteligencia de detalhe para cada mercado;
- consolida hit rate simulado;
- consolida estabilidade;
- identifica mercados consistentes;
- ordena auditorias por estabilidade.

## Decisao tecnica

A camada permanece no engine/batch para ser testavel e reutilizavel. A pagina de Auditorias apenas renderiza o painel consolidado.

## Saidas da Fase 12

- Acerto medio simulado.
- Estabilidade media.
- Quantidade de mercados consistentes.
- Lista de mercados auditados.
- Volatilidade e estabilidade por mercado.

## Proxima fase recomendada

A Fase 13 deve criar um painel executivo de dados globais, reunindo quantidade de jogos, oportunidades, mercados fortes e auditorias em uma visao unica.
