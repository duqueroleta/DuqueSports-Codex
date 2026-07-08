# DUQUE Score Engine v1 - Fase 5

## Objetivo

A Fase 5 adiciona explicabilidade ao pipeline. O sistema passa a transformar sinais tecnicos em uma leitura clara para o usuario, mantendo separacao entre calculo estatistico e narrativa.

## Responsabilidade

O Explanation Engine:

- recebe resultado calibrado do pipeline;
- identifica o mercado mais forte;
- resume os principais fatores estatisticos;
- registra riscos;
- cria uma narrativa curta para exibicao na tela de analise.

## Decisao tecnica

A explicabilidade foi implementada como uma camada posterior ao Poisson e a calibracao. Isso evita que o modelo estatistico misture calculo com texto de produto, mantendo baixo acoplamento e facilitando evolucao futura.

## Saidas da Fase 5

- Headline da recomendacao.
- Veredito da IA.
- Mercado recomendado com probabilidade calibrada.
- Fatores principais.
- Riscos principais.
- Narrativa de confiabilidade.

## Proxima fase recomendada

A Fase 6 deve introduzir um Ranking Engine para ordenar partidas e mercados por oportunidade, combinando probabilidade calibrada, confianca, risco e qualidade dos dados.
