import {
  CANONICAL_MARKET_SCHEMA_VERSION,
  buildCanonicalMarketId,
} from '../contracts/CanonicalMarketContract.js';

const PROJECTION_MARKET_DEFINITIONS = Object.freeze([
  Object.freeze({
    name: 'Resultado da partida',
    type: 'match-result',
    period: 'full-match',
    line: null,
    selections: Object.freeze([
      Object.freeze({ key: 'home', label: 'Mandante' }),
      Object.freeze({ key: 'draw', label: 'Empate' }),
      Object.freeze({ key: 'away', label: 'Visitante' }),
    ]),
  }),
  Object.freeze({
    name: 'Total de gols',
    type: 'total-goals',
    period: 'full-match',
    line: 2.5,
    selections: Object.freeze([
      Object.freeze({ key: 'over', label: 'Mais de 2.5 gols' }),
      Object.freeze({ key: 'under', label: 'Menos de 2.5 gols' }),
    ]),
  }),
  Object.freeze({
    name: 'Ambas as equipes marcam',
    type: 'both-teams-score',
    period: 'full-match',
    line: null,
    selections: Object.freeze([
      Object.freeze({ key: 'yes', label: 'Sim' }),
      Object.freeze({ key: 'no', label: 'Nao' }),
    ]),
  }),
]);

function createCanonicalProjectionMarkets(matchId) {
  return PROJECTION_MARKET_DEFINITIONS.map((definition) => ({
    schemaVersion: CANONICAL_MARKET_SCHEMA_VERSION,
    id: buildCanonicalMarketId(
      matchId,
      definition.type,
      definition.period,
      definition.line,
    ),
    matchId,
    name: definition.name,
    type: definition.type,
    period: definition.period,
    line: definition.line,
    selections: definition.selections.map((selection) => ({ ...selection })),
  }));
}

export { PROJECTION_MARKET_DEFINITIONS, createCanonicalProjectionMarkets };
