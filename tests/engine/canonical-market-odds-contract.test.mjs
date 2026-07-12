import assert from 'node:assert/strict';
import {
  CANONICAL_MARKET_SCHEMA_VERSION,
  CANONICAL_MARKET_TYPES,
  buildCanonicalMarketId,
  validateCanonicalMarket,
} from '../../src/engine/contracts/CanonicalMarketContract.js';
import {
  CANONICAL_ODDS_SNAPSHOT_SCHEMA_VERSION,
  buildCanonicalOddsSnapshotId,
  validateCanonicalOddsSnapshot,
  validateOddsSnapshotAgainstMarket,
} from '../../src/engine/contracts/CanonicalOddsSnapshotContract.js';
import { CANONICAL_MARKET_V1_EXAMPLE } from '../../src/engine/contracts/examples/canonicalMarket.v1.js';
import { CANONICAL_ODDS_SNAPSHOT_V1_EXAMPLE } from '../../src/engine/contracts/examples/canonicalOddsSnapshot.v1.js';

const validMarket = validateCanonicalMarket(CANONICAL_MARKET_V1_EXAMPLE);
const validOdds = validateCanonicalOddsSnapshot(CANONICAL_ODDS_SNAPSHOT_V1_EXAMPLE);
const validRelationship = validateOddsSnapshotAgainstMarket(
  CANONICAL_MARKET_V1_EXAMPLE,
  CANONICAL_ODDS_SNAPSHOT_V1_EXAMPLE,
);

assert.equal(validMarket.valid, true, 'A canonical market should be valid');
assert.equal(validMarket.schemaVersion, CANONICAL_MARKET_SCHEMA_VERSION, 'Market validation should expose its schema');
assert.equal(validOdds.valid, true, 'A canonical odds snapshot should be valid');
assert.equal(validOdds.schemaVersion, CANONICAL_ODDS_SNAPSHOT_SCHEMA_VERSION, 'Odds validation should expose its schema');
assert.equal(validRelationship.valid, true, 'Compatible market and odds contracts should be valid');
assert.ok(CANONICAL_MARKET_TYPES.includes('total-goals'), 'Canonical markets should support goal totals');
assert.equal(
  buildCanonicalMarketId('match:internal:1', 'total-goals', 'full-match', 2.5),
  'market:match%3Ainternal%3A1:total-goals:full-match:2.5',
  'Market IDs should use their complete canonical identity',
);

const oddsIdentity = {
  provider: 'provider-candidate',
  bookmakerId: 'bookmaker-candidate',
  externalMatchId: 'external-123',
  externalMarketId: 'market-total-goals-25',
  capturedAt: '2026-07-12T20:55:00.000Z',
};

assert.equal(
  buildCanonicalOddsSnapshotId(oddsIdentity),
  CANONICAL_ODDS_SNAPSHOT_V1_EXAMPLE.id,
  'The same capture identity should reproduce the snapshot ID',
);
assert.notEqual(
  buildCanonicalOddsSnapshotId(oddsIdentity),
  buildCanonicalOddsSnapshotId({ ...oddsIdentity, capturedAt: '2026-07-12T20:56:00.000Z' }),
  'Different capture times should produce different snapshot IDs',
);

const invalidMarket = validateCanonicalMarket({
  ...CANONICAL_MARKET_V1_EXAMPLE,
  id: 'random-market',
  line: 2.3,
  selections: [
    CANONICAL_MARKET_V1_EXAMPLE.selections[0],
    CANONICAL_MARKET_V1_EXAMPLE.selections[0],
  ],
});
const invalidMarketCodes = new Set(invalidMarket.errors.map((error) => error.code));

assert.equal(invalidMarket.valid, false, 'Invalid market semantics should fail validation');
assert.ok(invalidMarketCodes.has('non-idempotent-id'), 'Market identity should be deterministic');
assert.ok(invalidMarketCodes.has('invalid-line'), 'Market lines should use quarter increments');
assert.ok(invalidMarketCodes.has('duplicate-selection'), 'Market selections should be unique');
assert.ok(invalidMarketCodes.has('selection-set-mismatch'), 'Market selections should match their type');

const invalidOdds = validateCanonicalOddsSnapshot({
  ...CANONICAL_ODDS_SNAPSHOT_V1_EXAMPLE,
  id: 'random-snapshot',
  capturedAt: '2026-07-12T21:00:00.000Z',
  selections: [
    {
      ...CANONICAL_ODDS_SNAPSHOT_V1_EXAMPLE.selections[0],
      decimalOdds: null,
    },
    {
      ...CANONICAL_ODDS_SNAPSHOT_V1_EXAMPLE.selections[0],
    },
  ],
  dataQuality: { freshnessHours: -1, completeness: 120 },
});
const invalidOddsCodes = new Set(invalidOdds.errors.map((error) => error.code));

assert.equal(invalidOdds.valid, false, 'Invalid odds snapshots should fail validation');
assert.ok(invalidOddsCodes.has('capture-after-fetch'), 'Capture time should not be later than fetch time');
assert.ok(invalidOddsCodes.has('missing-open-price'), 'Open selections should expose their price');
assert.ok(invalidOddsCodes.has('duplicate-selection'), 'Odds selections should be unique');
assert.ok(invalidOddsCodes.has('non-idempotent-id'), 'Odds snapshot identity should be deterministic');
assert.ok(invalidOdds.errors.some((error) => error.path === 'dataQuality.completeness'), 'Completeness should be bounded');

const incompatibleRelationship = validateOddsSnapshotAgainstMarket(
  CANONICAL_MARKET_V1_EXAMPLE,
  {
    ...CANONICAL_ODDS_SNAPSHOT_V1_EXAMPLE,
    matchId: 'match:internal:other',
    marketId: 'market:other',
    selections: [CANONICAL_ODDS_SNAPSHOT_V1_EXAMPLE.selections[0]],
  },
);
const relationshipCodes = new Set(incompatibleRelationship.errors.map((error) => error.code));

assert.equal(incompatibleRelationship.valid, false, 'Incompatible market and odds references should fail');
assert.ok(relationshipCodes.has('match-mismatch'), 'Odds should reference the same match');
assert.ok(relationshipCodes.has('market-mismatch'), 'Odds should reference the canonical market');
assert.ok(relationshipCodes.has('selection-set-mismatch'), 'Odds should cover the market selections');

const malformedRelationship = validateOddsSnapshotAgainstMarket(
  { ...CANONICAL_MARKET_V1_EXAMPLE, selections: null },
  CANONICAL_ODDS_SNAPSHOT_V1_EXAMPLE,
);

assert.ok(
  malformedRelationship.errors.some((error) => error.code === 'required-selections'),
  'Malformed relationships should return a structured selection error',
);

assert.equal(validateCanonicalMarket(null).valid, false, 'A missing market should be invalid');
assert.equal(validateCanonicalOddsSnapshot(null).valid, false, 'A missing odds snapshot should be invalid');

console.log('Canonical market and odds contract tests passed');
