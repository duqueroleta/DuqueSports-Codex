# DUQUE Score Platform - Phase 92

## Objetivo

Conectar o frontend ao primeiro recorte da API por uma fronteira HTTP isolada, protegida por feature flag e com fallback integral para os mocks atuais.

## Entrega

- Cliente HTTP sem dependencia externa.
- URL base configuravel por ambiente.
- Timeout de cinco segundos e cancelamento da requisicao.
- Erros HTTP, rede, timeout, envelope e identificador representados por `SportsApiError`.
- Leitura de competicoes, lista de partidas e detalhe da partida.
- Validacao minima do envelope antes de consumir `data`.
- Adaptador entre os read models publicos e o contrato legado da interface.
- Metadados exclusivamente visuais permanecem locais durante a transicao.
- Gateway unico decide entre API e mocks.
- Fallback automatico preserva a navegacao se o backend estiver indisponivel.
- `VITE_SPORTS_API_ENABLED=false` por padrao.
- O trilho de competicoes e todos os consumidores de `matchesService` usam a nova fronteira.
- Testes usam servidor HTTP real em porta efemera.
- Nenhum segredo, token ou credencial foi adicionado ao bundle Vite.
- A versao do Engine permanece na Fase 89.

## Configuracao local

Copiar as variaveis documentadas em `.env.example` para um arquivo `.env.local` e alterar apenas:

```env
VITE_SPORTS_API_ENABLED=true
```

Executar o backend e o frontend em terminais separados:

```bash
npm run dev:api
npm run dev
```

Quando a flag estiver ausente ou for diferente de `true`, nenhuma requisicao esportiva e enviada ao backend.

## Limites da versao

- O backend continua local e em memoria.
- O deploy atual da Vercel permanece nos mocks porque a flag e desativada por padrao.
- O fallback e silencioso para preservar a experiencia; telemetria de origem ainda nao existe.
- Odds e cores nao chegam pela API. Durante a migracao, esses campos de apresentacao sao preenchidos pelos mocks locais correspondentes.
- Nao ha cache HTTP, autenticacao, provedor esportivo ou persistencia.

## Proxima fase recomendada

Adicionar observabilidade da fonte de dados e um indicador operacional restrito ao modo de desenvolvimento, permitindo distinguir API, fallback e mocks sem expor informacao tecnica ao usuario final.
