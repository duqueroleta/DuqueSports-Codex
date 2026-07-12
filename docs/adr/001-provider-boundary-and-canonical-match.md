# ADR 001 - Fronteira do Provedor e Contrato Canonico de Partida

- **Status:** Aceito
- **Data:** 2026-07-12
- **Escopo:** arquitetura preparatoria, sem integracao externa

## Contexto

O MVP opera com dados mockados e possui servicos que isolam a interface das fontes. A entrada de dados reais nao pode acoplar componentes React a um fornecedor, expor credenciais no bundle ou permitir que formatos externos contaminem o dominio do Engine.

O projeto precisa avaliar cobertura para as 16 competicoes registradas em `src/data/competitions.js`, incluindo dados historicos, pre-jogo e ao vivo.

## Decisao

1. O frontend consumira somente contratos internos do DUQUE Score.
2. Credenciais e chamadas ao provedor ficarao em um backend ou BFF futuro.
3. Cada provedor tera um adaptador responsavel por converter seu payload para contratos canonicos versionados.
4. O payload bruto podera ser persistido separadamente para auditoria, respeitando licenca e retencao.
5. IDs externos serao armazenados com namespace de origem e nao substituirao IDs internos.
6. Datas canonicas usarao UTC em formato ISO 8601.
7. Ausencia de dado sera representada por `null`, nunca por zero inventado.
8. Nenhum provedor foi selecionado nesta fase.

## Alternativas consideradas

### A. Consumir o provedor diretamente no React

**Rejeitada.** Exporia credenciais, aumentaria acoplamento, dificultaria cache e tornaria rate limit e auditoria dependentes do navegador.

### B. Adaptar um unico provedor dentro dos componentes

**Rejeitada.** Espalharia campos externos pela UI e pelo Engine, elevando o custo de troca ou contingencia.

### C. Backend com adaptadores e contrato canonico

**Aceita.** Protege segredos, concentra politicas operacionais e permite trocar ou combinar provedores sem reescrever as telas.

## Criterios para avaliar provedores

| Criterio | Peso |
| --- | ---: |
| Cobertura das 16 competicoes | 25% |
| Profundidade e consistencia historica | 15% |
| Latencia e confiabilidade ao vivo | 15% |
| Detalhe estatistico disponivel | 15% |
| Licenca, armazenamento e uso comercial | 15% |
| Rate limits, SLA e suporte | 10% |
| Custo total | 5% |

Cada candidato deve receber nota de zero a cinco por criterio, evidencia verificavel e observacoes sobre limitacoes.

## Gate de selecao

Um provedor so pode ser aprovado depois de:

1. Documentar termos de uso, armazenamento e redistribuicao.
2. Validar cobertura real das competicoes prioritarias.
3. Executar um piloto com partidas historicas, futuras e ao vivo.
4. Medir completude, latencia, estabilidade e taxa de erros.
5. Estimar custo mensal em cenarios minimo, esperado e pico.
6. Demonstrar conversao para o contrato canonico sem perda critica.
7. Definir alternativa de contingencia ou estrategia de troca.

## Contrato canonico inicial

`CanonicalMatchContract.js` define `canonical-match.v1` com:

- identificador interno e origem externa;
- competicao e temporada;
- horario UTC e status normalizado;
- mandante e visitante;
- placar anulavel;
- contexto de mando neutro;
- frescor e completude dos dados.

Eventos, estatisticas detalhadas, mercados e odds permanecem fora do contrato de partida e receberao contratos proprios quando necessarios.

## Consequencias

### Positivas

- Frontend e Engine permanecem independentes do fornecedor.
- Chaves e politicas operacionais ficam fora do navegador.
- Validacao e quarentena podem ocorrer antes da modelagem.
- Troca de provedor exige novo adaptador, nao reescrita do produto.

### Custos

- Sera necessario manter backend, adaptadores e schemas versionados.
- Dados brutos e canonicos exigirao rastreabilidade e politica de retencao.
- Campos exclusivos de um fornecedor podem ficar fora do nucleo canonico.

## Fora de escopo

- Contratacao de provedor.
- Criacao de credenciais.
- Chamadas HTTP reais.
- Banco de dados ou migracoes.
- Alteracao da modelagem estatistica atual.

## Revisao

Este ADR deve ser revisto quando o piloto de provedores terminar ou quando um requisito obrigatorio nao couber no contrato canonico sem extensao.
