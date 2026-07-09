# DUQUE Score Engine - Fase 26

## Objetivo

Adicionar validadores de entrada para os adapters de dados.

## Entrega

- Criacao do `DataAdapterValidationService`.
- Validacao de campos obrigatorios para partidas, mercados e auditorias.
- Resumo agregado de validacao no `MockEngineDataAdapter`.
- Exposicao do status de validacao no painel `Data Adapter`.
- Preservacao da validacao no contrato do pipeline e na resposta mock de API.
- Testes cobrindo entradas validas e uma entrada invalida controlada.

## Decisao tecnica

A validacao foi mantida simples, explicita e sem biblioteca externa. Isso preserva o escopo atual do projeto e cria uma barreira de qualidade antes de conectar fontes reais.

## Proxima evolucao sugerida

Criar bloqueio operacional no pipeline quando a fonte de dados vier invalida, usando o contrato `blocked` ja existente.
