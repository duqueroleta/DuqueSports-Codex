# DUQUE Score Engine - Phase 79

## Objetivo

Separar a definicao canonica de mercado dos snapshots temporais de odds, preservando identidade, origem e historico de cada captura.

## Entrega

- Foi criado o schema `canonical-market.v1`.
- Foram normalizados cinco tipos iniciais de mercado e seus conjuntos de selecoes.
- Mercados possuem IDs deterministas por partida, tipo, periodo e linha.
- Totais aceitam linhas positivas em incrementos de 0,25.
- Foi criado o schema `canonical-odds-snapshot.v1`.
- Snapshots possuem identidade por origem, casa, IDs externos e horario de captura.
- O formato canonico de precos e decimal.
- Selecao aberta exige preco maior que 1; estados indisponiveis podem usar `null`.
- Uma validacao cruzada impede relacionar odds a outra partida, mercado ou conjunto de selecoes.
- Foram criados exemplos executaveis de mercado de gols e suas odds.
- Foi criada a nona suite do Engine.
- Nenhuma API, casa de apostas ou provedor foi integrado.
- A versao do Engine foi atualizada para `duque-score-engine-v1.phase-79`.

## Impacto tecnico

O Engine podera comparar movimento de preco e reconstruir o mercado em qualquer instante sem sobrescrever cotacoes anteriores. A separacao tambem impede que nomes comerciais ou formatos externos contaminem o dominio canonico.

## Proxima fase recomendada

Definir o contrato canonico de projecoes do Engine, relacionando probabilidades, versao do modelo, instante de execucao e evidencias sem misturar previsao com odd de mercado.
