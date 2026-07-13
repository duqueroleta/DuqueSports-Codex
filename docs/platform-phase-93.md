# DUQUE Score Platform - Phase 93

## Objetivo

Tornar observavel a origem efetiva dos dados esportivos no ambiente de desenvolvimento, distinguindo API, mocks e fallback sem expor detalhes operacionais ao usuario final.

## Entrega

- Store externo e imutavel para diagnosticos da fonte esportiva.
- Assinatura compativel com `useSyncExternalStore`.
- Estado separado para competicoes, lista de jogos e detalhe da partida.
- Registro da fonte, quantidade de itens, instante e motivo sanitizado do fallback.
- Eventos emitidos na fronteira do gateway, sem acoplar componentes ao transporte.
- Painel tecnico reutilizando o design existente da pagina Dados.
- Painel renderizado exclusivamente quando `import.meta.env.DEV` e verdadeiro.
- Nenhuma URL, stack trace, payload bruto ou credencial aparece no diagnostico.
- Testes de emissao API/mock/fallback, imutabilidade, assinatura e descarte da assinatura.
- A versao do Engine permanece na Fase 89.

## Decisoes

- Falhas continuam transparentes para a experiencia de navegacao.
- O motivo armazenado e apenas um codigo controlado, como `network-error` ou `unavailable`.
- O store vive em memoria e representa somente a sessao atual do navegador.
- A observabilidade nao envia telemetria e nao altera o contrato publico da API.

## Limites da versao

- O diagnostico nao persiste entre recarregamentos.
- Nao existem metricas agregadas, logs remotos ou alertas.
- A Vercel nao exibe o painel porque executa um build de producao.
- A saude do backend ainda e inferida pelas leituras, sem endpoint dedicado.

## Proxima fase recomendada

Criar um endpoint operacional de health check para o backend local, com estado do processo, versao do contrato e tempo de atividade, mantendo detalhes internos fora das rotas publicas de dados.
