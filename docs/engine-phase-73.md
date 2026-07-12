# DUQUE Score Engine - Phase 73

## Objetivo

Executar automaticamente a porta de qualidade do projeto no GitHub Actions.

## Entrega

- Foi criado o workflow `.github/workflows/quality.yml`.
- Pushes e pull requests direcionados a `main` executam a verificacao.
- O workflow tambem pode ser iniciado manualmente.
- A instalacao usa `npm ci` e o lockfile versionado.
- O job executa `npm run verify`, cobrindo testes e build.
- Permissoes foram limitadas a leitura do conteudo.
- Execucoes antigas da mesma referencia sao canceladas automaticamente.
- Nenhuma biblioteca adicional foi instalada.
- A versao do engine foi atualizada para `duque-score-engine-v1.phase-73`.

## Impacto tecnico

Regressoes de teste ou compilacao passam a ser sinalizadas no GitHub antes de uma alteracao ser considerada saudavel. A configuracao local e a verificacao remota usam o mesmo comando.

## Proxima fase recomendada

Adicionar um badge de status do workflow ao README apos confirmar a primeira execucao no GitHub e documentar o procedimento de diagnostico para falhas de CI.
