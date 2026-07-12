import {
  CANONICAL_PROJECTION_AUDIT_SCHEMA_VERSION,
  buildCanonicalProjectionAuditId,
} from '../CanonicalProjectionAuditContract.js';
import {
  buildCanonicalAuditOutcome,
  calculateCanonicalAuditSummary,
} from '../canonicalAuditMetrics.js';
import { CANONICAL_PROJECTION_V1_EXAMPLE } from './canonicalProjection.v1.js';

const EVALUATOR_VERSION = 'projection-audit-evaluator-v1';
const AUDITED_AT = '2026-07-13T00:00:00.000Z';
const RESULT_SNAPSHOT_ID = 'match-result:internal:1:final';
const OBSERVED_SELECTIONS = ['away', 'over', 'yes'];
const SETTLEMENT_RULES = [
  'football-match-result-v1',
  'football-total-goals-v1',
  'football-btts-v1',
];

const OUTCOMES = CANONICAL_PROJECTION_V1_EXAMPLE.predictions.map((prediction, index) => (
  buildCanonicalAuditOutcome(prediction, {
    ruleVersion: SETTLEMENT_RULES[index],
    status: 'settled',
    observedSelectionKey: OBSERVED_SELECTIONS[index],
  })
));

const CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE = Object.freeze({
  schemaVersion: CANONICAL_PROJECTION_AUDIT_SCHEMA_VERSION,
  id: buildCanonicalProjectionAuditId({
    projectionId: CANONICAL_PROJECTION_V1_EXAMPLE.id,
    resultSnapshotId: RESULT_SNAPSHOT_ID,
    evaluatorVersion: EVALUATOR_VERSION,
    auditedAt: AUDITED_AT,
  }),
  matchId: CANONICAL_PROJECTION_V1_EXAMPLE.matchId,
  projectionId: CANONICAL_PROJECTION_V1_EXAMPLE.id,
  result: {
    snapshotId: RESULT_SNAPSHOT_ID,
    finalizedAt: '2026-07-12T23:00:00.000Z',
    score: { home: 1, away: 2 },
  },
  evaluation: {
    version: EVALUATOR_VERSION,
    auditedAt: AUDITED_AT,
  },
  outcomes: OUTCOMES,
  summary: calculateCanonicalAuditSummary(OUTCOMES),
});

export { CANONICAL_PROJECTION_AUDIT_V1_EXAMPLE };
