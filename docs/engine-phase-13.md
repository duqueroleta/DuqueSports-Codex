# DUQUE Score Engine v1 - Fase 13

## Objetivo

A Fase 13 cria um painel executivo de dados globais.

Ela consolida jogos, oportunidades, mercados ranqueados e auditorias em uma visao unica para acompanhar o estado geral do motor.

## Responsabilidade

O Executive Dashboard Service:

- recebe jogos, mercados e batch analysis;
- calcula totais operacionais;
- consolida qualidade das oportunidades;
- consolida auditorias por mercado;
- destaca top oportunidade, top mercado e top auditoria.

## Decisao tecnica

A consolidacao foi criada em modulo puro do engine, mantendo a tela de Dados como camada de exibicao.

## Saidas da Fase 13

- Total de jogos.
- Jogos ao vivo.
- Oportunidades elite.
- Mercados ranqueados.
- Mercados auditados.
- Score medio das oportunidades.
- Acerto e estabilidade medios.

## Proxima fase recomendada

A Fase 14 deve criar snapshots de estado do engine para registrar versao, inputs, rankings e auditorias em uma estrutura pronta para persistencia futura.
