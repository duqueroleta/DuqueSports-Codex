import { CANONICAL_MATCH_SCHEMA_VERSION } from '../CanonicalMatchContract.js';

const CANONICAL_MATCH_V1_EXAMPLE = Object.freeze({
  schemaVersion: CANONICAL_MATCH_SCHEMA_VERSION,
  id: 'match:internal:1',
  source: {
    provider: 'provider-candidate',
    externalId: 'external-123',
    fetchedAt: '2026-07-12T18:00:00.000Z',
  },
  competition: {
    id: 'competition:copa-do-mundo',
    name: 'Copa do Mundo',
    season: '2026',
  },
  kickoffAt: '2026-07-12T21:00:00.000Z',
  status: 'scheduled',
  teams: {
    home: { id: 'team:colombia', name: 'Colombia' },
    away: { id: 'team:ghana', name: 'Gana' },
  },
  score: { home: null, away: null },
  context: {
    neutralVenue: true,
    stage: 'group',
    round: '1',
  },
  dataQuality: {
    freshnessHours: 3,
    completeness: 96,
  },
});

export { CANONICAL_MATCH_V1_EXAMPLE };
