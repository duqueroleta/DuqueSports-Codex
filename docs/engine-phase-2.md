# DUQUE Sports AI Engine v1.0 - Fase 2

## Objetivo

Criar uma Feature Store formal em memória para impedir que cada Engine recalcule variáveis de forma isolada.

Esta fase respeita a documentação oficial ao tratar features como ativos versionados, rastreáveis e validados.

## Componentes

```txt
feature-store/
  featureCatalog.js
  FeatureStore.js
  FeatureSelectors.js
```

## Features Oficiais da Fase 2

- `adjusted_xg`
- `adjusted_xgot`
- `adjusted_shots`
- `adjusted_shots_on_target`
- `offensive_volume_index`
- `xg_differential`

Cada feature possui:

- id
- nome
- descrição
- fórmula
- versão
- Engine responsável
- dependências
- faixa válida

## Fluxo Atualizado

```txt
Data Quality
→ Recency Engine
→ Opponent Strength Engine
→ Feature Store Snapshot
→ Projection Pipeline
→ Explanation Trace
```

## Decisão Técnica

A Feature Store ainda não usa banco de dados. Ela é um snapshot em memória porque o app ainda trabalha com dados mockados.

Isso evita overengineering agora e preserva a arquitetura para migrar depois para PostgreSQL/Feature Tables.

## Critério de Aceite

- O catálogo deve expor features versionadas.
- Valores fora da faixa válida devem gerar issues.
- O pipeline deve consumir features da store em vez de acessar diretamente métricas ajustadas.
- O teste `npm run test:engine` deve validar a presença da Feature Store no trace.

## Próxima Fase Recomendada

Implementar o primeiro Statistical Core:

- Poisson simples para distribuição de gols.
- Probabilidades 1X2 derivadas da matriz de placares.
- Over/Under derivado da distribuição.
- BTTS derivado da matriz de placares.
