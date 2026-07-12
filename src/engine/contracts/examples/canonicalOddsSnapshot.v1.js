import {
  CANONICAL_ODDS_FORMAT,
  CANONICAL_ODDS_SNAPSHOT_SCHEMA_VERSION,
  buildCanonicalOddsSnapshotId,
} from '../CanonicalOddsSnapshotContract.js';
import { CANONICAL_MARKET_V1_EXAMPLE } from './canonicalMarket.v1.js';

const SOURCE = Object.freeze({
  provider: 'provider-candidate',
  externalMatchId: 'external-123',
  externalMarketId: 'market-total-goals-25',
  fetchedAt: '2026-07-12T20:55:05.000Z',
});

const BOOKMAKER = Object.freeze({
  id: 'bookmaker-candidate',
  name: 'Bookmaker Candidate',
});

const CAPTURED_AT = '2026-07-12T20:55:00.000Z';

const CANONICAL_ODDS_SNAPSHOT_V1_EXAMPLE = Object.freeze({
  schemaVersion: CANONICAL_ODDS_SNAPSHOT_SCHEMA_VERSION,
  id: buildCanonicalOddsSnapshotId({
    provider: SOURCE.provider,
    bookmakerId: BOOKMAKER.id,
    externalMatchId: SOURCE.externalMatchId,
    externalMarketId: SOURCE.externalMarketId,
    capturedAt: CAPTURED_AT,
  }),
  matchId: CANONICAL_MARKET_V1_EXAMPLE.matchId,
  marketId: CANONICAL_MARKET_V1_EXAMPLE.id,
  source: SOURCE,
  bookmaker: BOOKMAKER,
  capturedAt: CAPTURED_AT,
  format: CANONICAL_ODDS_FORMAT,
  status: 'open',
  selections: [
    {
      key: 'over',
      externalId: 'selection-over-25',
      decimalOdds: 1.82,
      status: 'open',
    },
    {
      key: 'under',
      externalId: 'selection-under-25',
      decimalOdds: 2.05,
      status: 'open',
    },
  ],
  dataQuality: {
    freshnessHours: 0.01,
    completeness: 100,
  },
});

export { CANONICAL_ODDS_SNAPSHOT_V1_EXAMPLE };
