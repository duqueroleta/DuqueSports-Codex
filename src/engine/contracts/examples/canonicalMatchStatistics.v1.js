import { CANONICAL_MATCH_STATISTICS_SCHEMA_VERSION } from '../CanonicalMatchStatisticsContract.js';

const CANONICAL_MATCH_STATISTICS_V1_EXAMPLE = Object.freeze({
  schemaVersion: CANONICAL_MATCH_STATISTICS_SCHEMA_VERSION,
  matchId: 'match:internal:1',
  source: {
    provider: 'provider-candidate',
    externalMatchId: 'external-123',
    fetchedAt: '2026-07-12T22:55:00.000Z',
  },
  period: 'full-match',
  minute: null,
  teams: {
    home: {
      goals: 2,
      xg: 1.84,
      xgot: 1.72,
      possession: 54.2,
      shots: 14,
      shotsOnTarget: 6,
      corners: 5,
      fouls: 11,
      yellowCards: 2,
      redCards: 0,
    },
    away: {
      goals: 1,
      xg: 1.12,
      xgot: 0.98,
      possession: 45.8,
      shots: 9,
      shotsOnTarget: 4,
      corners: 3,
      fouls: 13,
      yellowCards: 3,
      redCards: 0,
    },
  },
  dataQuality: {
    freshnessHours: 0.25,
    completeness: 98,
  },
});

export { CANONICAL_MATCH_STATISTICS_V1_EXAMPLE };
