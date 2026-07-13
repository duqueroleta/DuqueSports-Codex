# DUQUE Score Engine - Phase 88

## Objetivo

Registrar modelos candidatos de forma imutavel, relacionando codigo, Engine, componentes, features, parametros, dataset e avaliacoes cientificas.

## Entrega

- Foi criado `canonical-model-registration.v1`.
- O ID deriva de nome, versao, revisao completa do codigo e horario de registro.
- Revisoes de codigo exigem SHA Git completo com 40 caracteres.
- Snapshots de parametros exigem checksum SHA-256.
- O manifesto registra os modelos estatistico, de calibracao e explicacao.
- Catalogo e schema de features sao obrigatorios.
- Dataset, backtesting e relatorio de calibracao possuem referencias explicitas.
- O nivel de evidencia precisa permanecer consistente entre os artefatos.
- O backtesting agora publica todas as versoes do Engine encontradas nas projecoes.
- A versao registrada precisa existir na execucao historica.
- O registro nao pode anteceder backtesting ou calibracao.
- Backtests invalidos nao podem sustentar um registro.
- Odd, stake, lucro, ROI e bookmaker sao rejeitados.
- A v1 aceita apenas `candidate`.
- Todo candidato exige `deploymentAllowed: false`.
- Foi criado um exemplo sintetico, sem valor de aprovacao cientifica.
- Foi criada a decima oitava suite do Engine.
- A versao foi atualizada para `duque-score-engine-v1.phase-88`.

## Decisao de governanca

O registro v1 descreve artefatos candidatos, mas nao promove modelos para producao. Aprovacao, substituicao e retirada exigirao um fluxo de governanca separado, com evidencia observada e revisao humana rastreavel.

## Limites da versao

- Nao existe persistencia do registro.
- Nao ha aprovacao ou deploy automatico.
- O exemplo usa identificadores sinteticos e checksum demonstrativo.
- Nao existe comparador entre dois registros.
- Assinatura criptografica de artefatos permanece fora da v1.

## Impacto tecnico

Uma versao do modelo deixa de ser apenas um nome no codigo. O manifesto passa a declarar exatamente quais artefatos e avaliacoes formam aquele candidato, reduzindo o risco de comparar execucoes incompativeis.

## Proxima fase recomendada

Criar um comparador de candidatos que aceite apenas registros compativeis e produza deltas de calibracao, cobertura e qualidade sem promover vencedores automaticamente.
