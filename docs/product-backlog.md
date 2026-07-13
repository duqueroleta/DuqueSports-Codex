# DUQUE Score - Backlog Priorizado

## Estado atual

O MVP gratuito com dados mockados esta funcional, responsivo, publicado e protegido por testes, build e GitHub Actions. Este backlog inicia apos a Fase 75 e nao autoriza automaticamente integracoes externas.

## P0 - Fundacao para dados reais

### 1. Selecao do provedor esportivo

Avaliar provedores por cobertura dos campeonatos oficiais, profundidade historica, dados ao vivo, latencia, limites de uso, estabilidade, termos comerciais e permissao de armazenamento.

**Criterio de aceite:** decisao arquitetural documentada com custos, riscos, limites e alternativa de contingencia.

**Progresso:** ADR 001 define a fronteira, os pesos e o gate. A selecao do fornecedor continua pendente.

### 2. Backend de integracao

Criar um backend ou BFF para proteger credenciais, controlar cache, aplicar rate limit, normalizar respostas e impedir acesso direto do navegador ao provedor.

**Criterio de aceite:** nenhuma chave secreta presente no bundle React, no Git ou em variaveis expostas pelo Vite.

**Progresso:** o ADR 002 foi aprovado e o primeiro recorte local usa Node.js com repositorio em memoria para competicoes e partidas. Deploy, endpoints internos, autenticacao e PostgreSQL continuam pendentes.

### 3. Contrato canonico de futebol

Definir entidades estaveis para competicao, temporada, equipe, partida, evento, estatistica, mercado, odd, projecao e auditoria. Adaptadores de provedores devem converter para esse contrato.

**Criterio de aceite:** schemas versionados, exemplos reais anonimizados e testes de contrato para entradas validas e invalidas.

**Progresso:** a base canonica v1 cobre partida, competicao, temporada, equipes, estatisticas, eventos, mercados, odds, projecoes e auditorias. O pipeline mockado ja produz projecoes canonicas e o resultado final gera liquidacoes e auditorias validadas; adaptadores de provedores externos continuam pendentes.

### 4. Persistencia e migracoes

Projetar banco para dados brutos, entidades normalizadas, snapshots do Engine, projecoes, auditorias e rastreabilidade de versao.

**Criterio de aceite:** modelo relacional aprovado, migracoes reproduziveis, indices definidos e politica de retencao documentada.

**Progresso:** PostgreSQL, entidades, relacionamentos, indices e retencao foram propostos. Provedor gerenciado, migracoes executaveis e instancia de desenvolvimento continuam pendentes.

### 5. Pipeline de ingestao

Implementar coleta idempotente, retries com limite, quarentena, deduplicacao, controle de frescor e reconciliacao de identificadores externos.

**Criterio de aceite:** reprocessar o mesmo lote nao duplica registros e falhas parciais ficam auditaveis.

## P1 - Validacao cientifica do Engine

### 6. Dataset historico versionado

Congelar datasets de treino, calibracao e teste por temporada e competicao, impedindo vazamento temporal.

**Progresso:** o contrato versionado, as particoes cronologicas e as validacoes contra vazamento foram implementados. A fixture atual e sintetica; a importacao de um dataset observado e licenciado continua pendente.

### 7. Backtesting fora da amostra

Avaliar probabilidades e mercados sem usar dados posteriores ao momento da previsao.

**Progresso:** projecoes concluidas podem ser liquidadas, auditadas e agregadas em lote por particao. A infraestrutura foi validada com dados sinteticos; o backtesting cientifico com dados observados e licenciados continua pendente.

### 8. Metricas de calibracao

Medir Brier Score, Log Loss, curvas de confiabilidade, estabilidade por competicao e degradacao temporal.

**Progresso:** o Engine calcula Brier, Log Loss, ECE, erro maximo e faixas de confianca para a selecao principal, com separacao por particao e tipo de mercado. Segmentos exigem piso operacional de 30 amostras; competicao, intervalos de confianca e degradacao temporal continuam pendentes.

### 9. Registro de modelos

Relacionar versao do codigo, features, parametros, dataset, calibracao e resultado de cada execucao.

**Progresso:** o manifesto canonico relaciona todos os artefatos e valida sua cronologia. Candidatos compativeis podem ser comparados por cobertura, erro e calibracao sem promocao automatica; persistencia e aprovacao continuam pendentes.

**Criterio de aceite P1:** toda projecao pode ser reproduzida e comparada com o resultado observado usando a mesma versao do pipeline.

## P1 - Observabilidade e operacao

### 10. Logs estruturados

Adicionar IDs de correlacao para ingestao, partida, projecao, snapshot e auditoria.

### 11. Monitoramento de erros e desempenho

Monitorar falhas, latencia, indisponibilidade, frescor do feed e taxa de quarentena sem armazenar dados pessoais desnecessarios.

### 12. Alertas operacionais

Definir limites para atraso do provedor, aumento de erros, dados incompletos e falha de calibracao.

## P1 - Qualidade da experiencia

### 13. Testes de componentes

Cobrir componentes criticos com estados de sucesso, carregamento, vazio, erro e retry.

### 14. Testes ponta a ponta

Automatizar navegacao entre partidas, abertura de analise, favoritos, filtros, Lista VIP e rota 404 em desktop e mobile.

### 15. Acessibilidade

Auditar navegacao por teclado, leitores de tela, contraste, foco e reducao de movimento.

## P2 - Produto e crescimento

### 16. Analytics com privacidade

Medir funil de jogos, analises, bilhete e Lista VIP com consentimento e politica de dados.

### 17. Integracao de leads

Substituir a planilha quando o volume justificar CRM, consentimento versionado e processo de exclusao.

### 18. Conta opcional

Sincronizar perfil e favoritos entre dispositivos somente depois de validar necessidade real.

### 19. Jogo responsavel

Manter avisos claros, limites de comunicacao e ausencia de promessas de resultado em todas as jornadas de aposta.

## Itens adiados explicitamente

- Assinatura ou pagamento Duque PRO.
- Banco e autenticacao antes da aprovacao da arquitetura P0.
- Exposicao de chaves de API no frontend.
- Alteracao do modelo cientifico sem backtesting e justificativa tecnica.
- Dependencia direta de um unico provedor sem estrategia de adaptacao.

## Ordem recomendada dos proximos ciclos

1. Ciclo 3: decisoes de arquitetura, contrato canonico e avaliacao de provedores.
2. Ciclo 4: backend, banco e ingestao controlada em ambiente de desenvolvimento.
3. Ciclo 5: backtesting, calibracao real e observabilidade.
4. Ciclo 6: liberacao gradual de dados reais para a interface.
