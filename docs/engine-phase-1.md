# DUQUE Sports AI Engine v1.0 - Fase 1

## Objetivo

Criar o primeiro núcleo funcional do Engine sem transformar os 160 capítulos da documentação em 160 módulos independentes.

Esta fase implementa apenas o pipeline mínimo testável:

1. Data Quality Engine
2. Recency Engine
3. Opponent Strength Engine
4. Projection Pipeline
5. Adaptador temporário para dados mockados do front-end

## Ordem Implementada

```txt
Match Input
→ Data Quality
→ Recency Weighting
→ Opponent Strength Adjustment
→ Expected Goals Projection
→ Market Probabilities
→ Confidence
→ Explanation Trace
```

## Fora do Escopo Desta Fase

- Poisson hierárquico completo
- Dixon-Coles
- Binomial negativa
- Inferência Bayesiana
- Monte Carlo
- Feature Store persistente
- Banco de dados
- API backend real
- Calibração automática por auditoria

Esses itens permanecem como metodologia oficial e serão implementados em fases futuras, quando houver base de dados e contratos mais maduros.

## Critério de Aceite

- O Engine deve bloquear entradas ruins antes da projeção.
- O cálculo deve ser determinístico.
- A projeção deve retornar xG, probabilidades, confiança, score de qualidade e explicação.
- O teste `npm run test:engine` deve passar.

## Próxima Fase Recomendada

Implementar Feature Store em memória com catálogo formal de features:

- nome
- descrição
- fórmula
- versão
- Engine responsável
- dependências
- validações
