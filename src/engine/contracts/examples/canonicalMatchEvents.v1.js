import {
  CANONICAL_MATCH_EVENTS_SCHEMA_VERSION,
  buildCanonicalEventId,
} from '../CanonicalMatchEventsContract.js';

const PROVIDER = 'provider-candidate';
const EXTERNAL_MATCH_ID = 'external-123';

const CANONICAL_MATCH_EVENTS_V1_EXAMPLE = Object.freeze({
  schemaVersion: CANONICAL_MATCH_EVENTS_SCHEMA_VERSION,
  matchId: 'match:internal:1',
  source: {
    provider: PROVIDER,
    externalMatchId: EXTERNAL_MATCH_ID,
    fetchedAt: '2026-07-12T22:55:00.000Z',
  },
  events: [
    {
      id: buildCanonicalEventId(PROVIDER, EXTERNAL_MATCH_ID, 'event-001'),
      externalId: 'event-001',
      teamId: 'team:colombia',
      type: 'goal',
      period: 'first-half',
      minute: 22,
      stoppageMinute: null,
      sequence: 1,
      details: {
        kind: 'regular',
        scorer: { id: 'player:colombia:9', name: 'Atacante Colombia' },
        assist: { id: 'player:colombia:10', name: 'Meia Colombia' },
      },
    },
    {
      id: buildCanonicalEventId(PROVIDER, EXTERNAL_MATCH_ID, 'event-002'),
      externalId: 'event-002',
      teamId: 'team:ghana',
      type: 'card',
      period: 'second-half',
      minute: 58,
      stoppageMinute: null,
      sequence: 2,
      details: {
        kind: 'yellow',
        player: { id: 'player:ghana:5', name: 'Defensor Gana' },
      },
    },
    {
      id: buildCanonicalEventId(PROVIDER, EXTERNAL_MATCH_ID, 'event-003'),
      externalId: 'event-003',
      teamId: 'team:colombia',
      type: 'substitution',
      period: 'second-half',
      minute: 72,
      stoppageMinute: null,
      sequence: 3,
      details: {
        playerIn: { id: 'player:colombia:18', name: 'Reserva Colombia' },
        playerOut: { id: 'player:colombia:9', name: 'Atacante Colombia' },
      },
    },
  ],
  dataQuality: {
    freshnessHours: 0.25,
    completeness: 98,
  },
});

export { CANONICAL_MATCH_EVENTS_V1_EXAMPLE };
