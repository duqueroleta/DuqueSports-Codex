import assert from 'node:assert/strict';
import {
  CANONICAL_PROJECTION_AUDIT_SCHEMA_VERSION,
  CANONICAL_SETTLEMENT_STATUSES,
  buildCanonicalProjectionAuditId,
  validateAuditAgainstProjection,
  validateCanonicalProjectionAudit,
} from '../../src/engine/contracts/CanonicalProjectionAuditContract.js';
import {
  buildCanonicalAuditOutcome,
  calculateBrierScore,
  calculateCanonicalAuditSummary,
  calculateLogLoss,
} from '../../src/engine/contracts/canonicalAuditMetrics.js';
import { CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE } from '../../src/engine/contracts/examples/canonicalProjectionAudit.v1.js';
import { CANONICAL_PROJECTION_V1_EXAMPLE } from '../../src/engine/contracts/examples/canonicalProjection.v1.js';

const validResult = validateCanonicalProjectionAudit(CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE);
const validRelationship = validateAuditAgainstProjection(
  CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE,
  CANONICAL_PROJECTION_V1_EXAMPLE,
);

assert.equal(validResult.valid, true, 'A canonical projection audit should be valid');
assert.equal(validResult.errors.length, 0, 'A valid audit should not expose errors');
assert.equal(validResult.schemaVersion, CANONICAL_PROJECTION_AUDIT_SCHEMA_VERSION, 'Audit should expose its schema');
assert.equal(validRelationship.valid, true, 'Audit outcomes should reproduce the projection metrics');
assert.ok(CANONICAL_SETTLEMENT_STATUSES.includes('partial'), 'Settlement should represent partial outcomes');
assert.equal(CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE.summary.hits, 2, 'Example should contain two hits');
assert.equal(CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE.summary.misses, 1, 'Example should contain one miss');
assert.equal(
  calculateBrierScore(CANONICAL_PROJECTION_V1_EXAMPLE.predictions[0].selections, 'away'),
  0.314123,
  'Multiclass Brier Score should use normalized squared error',
);
assert.equal(
  calculateLogLoss(CANONICAL_PROJECTION_V1_EXAMPLE.predictions[0].selections, 'away'),
  1.514128,
  'Log Loss should use the observed selection probability',
);
assert.equal(
  buildCanonicalProjectionAuditId({
    projectionId: CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE.projectionId,
    resultSnapshotId: CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE.result.snapshotId,
    evaluatorVersion: CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE.evaluation.version,
    auditedAt: CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE.evaluation.auditedAt,
  }),
  CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE.id,
  'Audit identity should be reproducible',
);

const invalidAudit = validateCanonicalProjectionAudit({
  ...CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE,
  id: 'random-audit',
  profit: 100,
  result: {
    ...CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE.result,
    finalizedAt: '2026-07-13T01:00:00.000Z',
    score: { home: -1, away: 2 },
  },
  outcomes: [
    {
      ...CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE.outcomes[0],
      metrics: { brierScore: 1.5, logLoss: -1 },
    },
    CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE.outcomes[0],
  ],
});
const invalidCodes = new Set(invalidAudit.errors.map((error) => error.code));

assert.equal(invalidAudit.valid, false, 'Invalid audit semantics should fail validation');
assert.ok(invalidCodes.has('non-idempotent-id'), 'Audit identity should be deterministic');
assert.ok(invalidCodes.has('commercial-data-not-allowed'), 'Scientific audit should reject betting returns');
assert.ok(invalidCodes.has('invalid-score'), 'Observed score should be non-negative');
assert.ok(invalidCodes.has('audit-before-result'), 'Audit should not predate the final result');
assert.ok(invalidCodes.has('invalid-brier-score'), 'Brier Score should stay bounded');
assert.ok(invalidCodes.has('invalid-log-loss'), 'Log Loss should be non-negative');
assert.ok(invalidCodes.has('duplicate-market'), 'Audited markets should be unique');
assert.ok(invalidCodes.has('summary-mismatch'), 'Audit summary should be derived from outcomes');

const invalidRelationship = validateAuditAgainstProjection(
  {
    ...CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE,
    outcomes: [
      {
        ...CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE.outcomes[0],
        predictedSelectionKey: 'draw',
        classification: 'hit',
        settlement: {
          ...CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE.outcomes[0].settlement,
          observedSelectionKey: 'unknown',
        },
        metrics: { brierScore: 0, logLoss: 0 },
      },
    ],
  },
  CANONICAL_PROJECTION_V1_EXAMPLE,
);
const relationshipCodes = new Set(invalidRelationship.errors.map((error) => error.code));

assert.equal(invalidRelationship.valid, false, 'Non-reproducible audits should fail relationship validation');
assert.ok(relationshipCodes.has('market-count-mismatch'), 'Audit should cover every projected market');
assert.ok(relationshipCodes.has('predicted-selection-mismatch'), 'Top prediction should be reproducible');
assert.ok(relationshipCodes.has('observation-not-found'), 'Observed selection should exist in projection');
assert.ok(relationshipCodes.has('classification-mismatch'), 'Classification should match prediction and result');
assert.ok(relationshipCodes.has('metric-mismatch'), 'Scientific metrics should be reproducible');

const pushedOutcome = buildCanonicalAuditOutcome(
  CANONICAL_PROJECTION_V1_EXAMPLE.predictions[1],
  { ruleVersion: 'football-total-goals-v1', status: 'push', observedSelectionKey: null },
);
const outcomesWithPush = [
  CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE.outcomes[0],
  pushedOutcome,
  CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE.outcomes[2],
];
const auditWithPush = {
  ...CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE,
  outcomes: outcomesWithPush,
  summary: calculateCanonicalAuditSummary(outcomesWithPush),
};

assert.equal(validateCanonicalProjectionAudit(auditWithPush).valid, true, 'Push should be excluded from error metrics');
assert.equal(validateAuditAgainstProjection(auditWithPush, CANONICAL_PROJECTION_V1_EXAMPLE).valid, true, 'Push should remain reproducible');
assert.equal(auditWithPush.summary.excludedMarkets, 1, 'Push should count as an excluded market');

const blockedRelationship = validateAuditAgainstProjection(
  CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE,
  { ...CANONICAL_PROJECTION_V1_EXAMPLE, status: 'blocked' },
);

assert.ok(
  blockedRelationship.errors.some((error) => error.code === 'projection-not-auditable'),
  'Blocked projections should not generate scientific audits',
);

assert.equal(validateCanonicalProjectionAudit(null).valid, false, 'A missing audit should be invalid');
assert.equal(validateAuditAgainstProjection(null, CANONICAL_PROJECTION_V1_EXAMPLE).valid, false, 'A missing relationship should be invalid');

console.log('Canonical projection audit contract tests passed');
