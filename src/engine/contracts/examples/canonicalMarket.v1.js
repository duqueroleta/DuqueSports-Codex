import {
  CANONICAL_MARKET_SCHEMA_VERSION,
  buildCanonicalMarketId,
} from '../CanonicalMarketContract.js';

const MATCH_ID = 'match:internal:1';
const MARKET_TYPE = 'total-goals';
const MARKET_PERIOD = 'full-match';
const MARKET_LINE = 2.5;

const CANONICAL_MARKET_V1_EXAMPLE = Object.freeze({
  schemaVersion: CANONICAL_MARKET_SCHEMA_VERSION,
  id: buildCanonicalMarketId(MATCH_ID, MARKET_TYPE, MARKET_PERIOD, MARKET_LINE),
  matchId: MATCH_ID,
  name: 'Total de gols',
  type: MARKET_TYPE,
  period: MARKET_PERIOD,
  line: MARKET_LINE,
  selections: [
    { key: 'over', label: 'Mais de 2.5 gols' },
    { key: 'under', label: 'Menos de 2.5 gols' },
  ],
});

export { CANONICAL_MARKET_V1_EXAMPLE };
