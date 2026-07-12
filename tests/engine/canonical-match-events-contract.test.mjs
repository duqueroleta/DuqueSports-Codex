import assert from 'node:assert/strict';
import {
  CANONICAL_EVENT_TYPES,
  CANONICAL_MATCH_EVENTS_SCHEMA_VERSION,
  buildCanonicalEventId,
  validateCanonicalMatchEvents,
} from '../../src/engine/contracts/CanonicalMatchEventsContract.js';
import { CANONICAL_MATCH_EVENTS_V1_EXAMPLE } from '../../src/engine/contracts/examples/canonicalMatchEvents.v1.js';

const validResult = validateCanonicalMatchEvents(CANONICAL_MATCH_EVENTS_V1_EXAMPLE);

assert.equal(validResult.valid, true, 'A canonical event collection should be valid');
assert.equal(validResult.errors.length, 0, 'Valid events should not expose errors');
assert.equal(
  validResult.schemaVersion,
  CANONICAL_MATCH_EVENTS_SCHEMA_VERSION,
  'Event validation should expose schema version',
);
assert.ok(CANONICAL_EVENT_TYPES.includes('substitution'), 'Event types should include substitutions');
assert.equal(
  buildCanonicalEventId('provider-candidate', 'external-123', 'event-001'),
  'event:provider-candidate:external-123:event-001',
  'Event IDs should use their complete deterministic identity',
);
assert.notEqual(
  buildCanonicalEventId('provider-candidate', 'external-123', 'event-001'),
  buildCanonicalEventId('provider-candidate', 'external-456', 'event-001'),
  'Events from different matches should not share an internal ID',
);

const invalidIdentity = validateCanonicalMatchEvents({
  ...CANONICAL_MATCH_EVENTS_V1_EXAMPLE,
  events: [
    {
      ...CANONICAL_MATCH_EVENTS_V1_EXAMPLE.events[0],
      id: 'random-id',
    },
    {
      ...CANONICAL_MATCH_EVENTS_V1_EXAMPLE.events[0],
      sequence: 2,
    },
  ],
});
const identityCodes = new Set(invalidIdentity.errors.map((error) => error.code));

assert.equal(invalidIdentity.valid, false, 'Non-idempotent or duplicate events should be invalid');
assert.ok(identityCodes.has('non-idempotent-id'), 'Event IDs should follow the deterministic identity rule');
assert.ok(identityCodes.has('duplicate-event'), 'Duplicate source events should be rejected');

const outOfOrder = validateCanonicalMatchEvents({
  ...CANONICAL_MATCH_EVENTS_V1_EXAMPLE,
  events: [...CANONICAL_MATCH_EVENTS_V1_EXAMPLE.events].reverse(),
});

assert.ok(
  outOfOrder.errors.some((error) => error.code === 'events-out-of-order'),
  'Events should use strict chronological order',
);

const invalidDetails = validateCanonicalMatchEvents({
  ...CANONICAL_MATCH_EVENTS_V1_EXAMPLE,
  events: [
    {
      ...CANONICAL_MATCH_EVENTS_V1_EXAMPLE.events[0],
      minute: 60,
      details: { kind: 'unknown', scorer: null, assist: null },
    },
    {
      ...CANONICAL_MATCH_EVENTS_V1_EXAMPLE.events[2],
      details: {
        playerIn: { id: 'player:same', name: 'Mesmo jogador' },
        playerOut: { id: 'player:same', name: 'Mesmo jogador' },
      },
    },
  ],
});
const detailCodes = new Set(invalidDetails.errors.map((error) => error.code));

assert.equal(invalidDetails.valid, false, 'Invalid event semantics should fail validation');
assert.ok(detailCodes.has('period-minute-mismatch'), 'Minutes should belong to their selected period');
assert.ok(detailCodes.has('unsupported-goal-kind'), 'Goal kinds should be normalized');
assert.ok(detailCodes.has('required-player'), 'Goals should identify their scorer');
assert.ok(detailCodes.has('duplicate-player-role'), 'Substitutions should identify different players');

const missingResult = validateCanonicalMatchEvents(null);

assert.equal(missingResult.valid, false, 'A missing event collection should be invalid');
assert.equal(missingResult.errors[0].path, 'eventsCollection', 'Missing events should expose their root path');

console.log('Canonical match events contract tests passed');
