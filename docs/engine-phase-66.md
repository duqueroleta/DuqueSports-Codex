# DUQUE Score Engine - Phase 66

## Objetivo

Normalizar os dados das partidas ao vivo antes da entrega para a interface.

## Entrega

- Foi criado o utilitario puro `normalizeLiveMatchPresentation`.
- Minutos sao limitados ao intervalo entre zero e cento e trinta.
- Pressao ofensiva reutiliza o contrato numerico entre zero e cem.
- Valores ausentes usam apresentacao neutra e nao contaminam medias.
- Textos essenciais possuem fallbacks seguros.
- Estagio da partida e tom da pressao sao derivados por funcoes testaveis.
- A normalizacao foi centralizada no `liveService`.
- Foi criada uma suite dedicada com `node:assert`.
- Nenhuma biblioteca adicional foi instalada.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-66`.

## Impacto tecnico

A tela Live nao produz barras quebradas, minutos invalidos ou classificacoes enganosas quando o feed estiver incompleto. Os mocks atuais preservam a mesma apresentacao.

## Proxima fase recomendada

Consolidar os testes de utilitarios da interface em um executor unico, reduzindo o crescimento do comando `test:ui` e facilitando novas suites.
