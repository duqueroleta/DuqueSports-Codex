# DUQUE Score Platform - Phase 99

## Objetivo

Observar a quantidade agregada de requisicoes HTTP durante operacao e drenagem sem coletar metadados, URLs ou conteudo dos usuarios.

## Entrega

- Tracker em memoria ao redor do handler HTTP.
- Contadores `active` e `totalStarted`.
- Incremento antes da execucao do handler.
- Liberacao idempotente nos eventos `finish` e `close`.
- Liberacao defensiva quando o handler falha de forma sincrona.
- Snapshot imutavel com apenas dois campos numericos.
- Integracao automatica pelo runtime.
- Contadores adicionados ao `health-read.v1` de forma aditiva.
- Consulta direta das metricas pelo runtime para testes e operacao interna.
- Testes com requisicoes concorrentes, conclusao normal e conexao abortada.
- Teste de drenagem forcada confirmando retorno do contador a zero.
- A versao do Engine permanece na Fase 89.

## Privacidade

O tracker nao recebe nem persiste URL, metodo, IP, query string, cabecalhos, cookies ou payload. O health check publica somente contagens agregadas da memoria do processo atual.

## Semantica

- `active`: respostas iniciadas que ainda nao emitiram `finish` ou `close`.
- `totalStarted`: requisicoes iniciadas desde o bootstrap do processo.
- A chamada ao proprio health check aparece como ativa durante a criacao de sua resposta.
- Os contadores reiniciam quando o processo reinicia.

## Limites da versao

- Nao existem histogramas, percentis ou duracao por rota.
- As metricas nao sao persistidas nem enviadas para servico externo.
- WebSockets e upgrades permanecem fora do escopo.
- O health check ainda representa um unico processo.

## Proxima fase recomendada

Separar liveness e readiness no contrato operacional, mantendo liveness ligado ao processo HTTP e preparando readiness para futuras dependencias como banco, cache e provedor.
