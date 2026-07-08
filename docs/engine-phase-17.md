# DUQUE Score Engine - Fase 17

## Objetivo

Adicionar validacao de schema e verificacao de compatibilidade para snapshots do motor estatistico.

## Entrega

- Criacao do `EngineSnapshotSchemaService`.
- Validacao dos campos obrigatorios do snapshot.
- Validacao de colecoes essenciais: oportunidades, mercados e auditorias.
- Verificacao de compatibilidade com a versao atual do engine.
- Integracao da validacao no fluxo de exportacao/importacao JSON.
- Indicadores visuais na pagina Dados para schema e status de compatibilidade.

## Decisao tecnica

A validacao foi mantida simples e explicita, sem biblioteca externa. Neste momento o projeto usa dados mockados e a prioridade e criar contratos internos confiaveis antes de adicionar banco, API ou processamento real em escala.

## Proxima evolucao sugerida

Criar um registry de migracoes para converter snapshots antigos para o contrato atual quando `migrationRequired` for verdadeiro.
