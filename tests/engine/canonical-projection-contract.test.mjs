import assert from 'node:assert/strict';
import {
  CANONICAL_PROJECTION_SCHEMA_VERSION,
  CANONICAL_PROJECTION_STATUSES,
  buildCanonicalProjectionId,
  validateCanonicalProjection,
  validateProjectionAgainstMarkets,
} from '../../src/engine/contracts/CanonicalProjectionContract.js';
import {
  CANONICAL_PROJECTION_MARKETS_V1_EXAMPLE,
  CANONICAL_PROJECTION_V1_EXAMPLE,
} from '../../src/engine/contracts/examples/canonicalProjection.v1.js';

const validResult = validateCanonicalProjection(CANONICAL_PROJECTION_V1_EXAMPLE);
const validRelationship = validateProjectionAgainstMarkets(
  CANONICAL_PROJECTION_V1_EXAMPLE,
  CANONICAL_PROJECTION_MARKETS_V1_EXAMPLE,
);

assert.equal(validResult.valid, true, 'A complete canonical projection should be valid');
assert.equal(validResult.errors.length, 0, 'A valid projection should not expose errors');
assert.equal(validResult.schemaVersion, CANONICAL_PROJECTION_SCHEMA_VERSION, 'Validation should expose projection schema');
assert.equal(validRelationship.valid, true, 'Projection markets and selections should be compatible');
assert.ok(CANONICAL_PROJECTION_STATUSES.includes('blocked'), 'Projection statuses should include blocked executions');
assert.equal(
  buildCanonicalProjectionId({
    matchId: CANONICAL_PROJECTION_V1_EXAMPLE.matchId,
    inputSnapshotId: CANONICAL_PROJECTION_V1_EXAMPLE.input.snapshotId,
    engineVersion: CANONICAL_PROJECTION_V1_EXAMPLE.execution.engineVersion,
    generatedAt: CANONICAL_PROJECTION_V1_EXAMPLE.execution.generatedAt,
  }),
  CANONICAL_PROJECTION_V1_EXAMPLE.id,
  'Projection identity should be reproducible',
);

const invalidProjection = validateCanonicalProjection({
  ...CANONICAL_PROJECTION_V1_EXAMPLE,
  id: 'random-projection',
  bookmaker: { id: 'must-not-be-here' },
  execution: {
    ...CANONICAL_PROJECTION_V1_EXAMPLE.execution,
    generatedAt: '2026-07-12T17:59:00.000Z',
  },
  metrics: {
    ...CANONICAL_PROJECTION_V1_EXAMPLE.metrics,
    expectedGoals: { home: -1, away: 1.12 },
    confidence: 120,
    calibrationReliability: 1.2,
  },
  predictions: [
    {
      ...CANONICAL_PROJECTION_V1_EXAMPLE.predictions[0],
      selections: [
        { key: 'home', probability: 70 },
        { key: 'home', probability: 20, decimalOdds: 1.8 },
      ],
    },
    CANONICAL_PROJECTION_V1_EXAMPLE.predictions[0],
  ],
});
const invalidCodes = new Set(invalidProjection.errors.map((error) => error.code));

assert.equal(invalidProjection.valid, false, 'Invalid projection semantics should fail validation');
assert.ok(invalidCodes.has('non-idempotent-id'), 'Projection identity should be deterministic');
assert.ok(invalidCodes.has('generated-before-cutoff'), 'Projection should not predate its input cutoff');
assert.ok(invalidCodes.has('invalid-expected-goals'), 'Expected goals should be non-negative');
assert.ok(invalidCodes.has('invalid-percentage'), 'Confidence and probabilities should stay bounded');
assert.ok(invalidCodes.has('invalid-reliability'), 'Calibration reliability should stay bounded');
assert.ok(invalidCodes.has('duplicate-selection'), 'Prediction selections should be unique');
assert.ok(invalidCodes.has('probability-sum-mismatch'), 'Market probabilities should sum to one hundred');
assert.ok(invalidCodes.has('duplicate-market'), 'Predicted markets should be unique');
assert.ok(invalidCodes.has('commercial-data-not-allowed'), 'Projection should remain independent from commercial odds');

const blockedProjection = {
  ...CANONICAL_PROJECTION_V1_EXAMPLE,
  status: 'blocked',
  metrics: {
    expectedGoals: { home: null, away: null },
    confidence: null,
    dataQualityScore: 38,
    calibrationReliability: null,
  },
  predictions: [],
  evidence: {
    featureSnapshotId: null,
    keyDrivers: [],
    riskFlags: [],
    blockReasons: ['Data quality did not approve the input snapshot.'],
  },
};

assert.equal(validateCanonicalProjection(blockedProjection).valid, true, 'A blocked projection should preserve its reason');

const blockedWithOutput = validateCanonicalProjection({
  ...blockedProjection,
  predictions: CANONICAL_PROJECTION_V1_EXAMPLE.predictions,
});

assert.ok(
  blockedWithOutput.errors.some((error) => error.code === 'blocked-output-present'),
  'Blocked projections should not expose probabilities',
);

const incompatibleRelationship = validateProjectionAgainstMarkets(
  {
    ...CANONICAL_PROJECTION_V1_EXAMPLE,
    predictions: [
      {
        marketId: CANONICAL_PROJECTION_MARKETS_V1_EXAMPLE[0].id,
        selections: [{ key: 'home', probability: 100 }],
      },
    ],
  },
  CANONICAL_PROJECTION_MARKETS_V1_EXAMPLE,
);
const relationshipCodes = new Set(incompatibleRelationship.errors.map((error) => error.code));

assert.equal(incompatibleRelationship.valid, false, 'Incomplete projection relationships should fail');
assert.ok(relationshipCodes.has('market-count-mismatch'), 'Projection should cover the supplied markets');
assert.ok(relationshipCodes.has('selection-set-mismatch'), 'Projection selections should match their market');

assert.equal(validateCanonicalProjection(null).valid, false, 'A missing projection should be invalid');
assert.equal(
  validateProjectionAgainstMarkets(null, CANONICAL_PROJECTION_MARKETS_V1_EXAMPLE).valid,
  false,
  'A missing relationship contract should be invalid',
);

console.log('Canonical projection contract tests passed');
