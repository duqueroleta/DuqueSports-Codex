# DUQUE Score Engine - Phase 76

## Objetivo

Formalizar a fronteira de provedores e criar o primeiro contrato canonico de partida.

## Entrega

- Foi criado o ADR 001 com decisao, alternativas, pesos e gate de selecao.
- Nenhum provedor foi escolhido ou integrado.
- Foi criado o schema `canonical-match.v1` em JavaScript puro.
- O validador retorna erros estruturados por caminho e codigo.
- Origem, competicao, datas UTC, status, equipes, placar, contexto e qualidade sao validados.
- Estatisticas, eventos, mercados e odds permanecem contratos separados.
- A suite do Engine passou a incluir testes do contrato canonico.
- Nenhuma biblioteca adicional foi instalada.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-76`.

## Impacto tecnico

Adaptadores futuros passam a ter um alvo versionado e independente do fornecedor. A decisao impede credenciais no frontend e integracoes prematuras sem piloto, licenca e avaliacao de cobertura.

## Proxima fase recomendada

Criar exemplos canonicos versionados e um contrato separado para estatisticas de partida, mantendo a integracao com provedores fora do escopo.
