import assert from 'node:assert/strict';
import { matches } from '../../src/data/matches.js';
import { adaptProjectionToCanonical } from '../../src/engine/adapters/CanonicalProjectionAdapter.js';
import { adaptMatchToEngineInput } from '../../src/engine/adapters/mockMatchAdapter.js';
import {
  CANONICAL_SETTLEMENT_RULE_VERSION,
  settleCanonicalMarket,
} from '../../src/engine/audit/CanonicalMarketSettlementService.js';
import {
  CANONICAL_PROJECTION_AUDIT_SERVICE_MODEL,
  createCanonicalProjectionAudit,
} from '../../src/engine/audit/CanonicalProjectionAuditService.js';
import { runProjectionPipeline } from '../../src/engine/projection/ProjectionPipeline.js';

const pipelineProjection = runProjectionPipeline(adaptMatchToEngineInput(matches[0]));
const canonical = adaptProjectionToCanonical({
  projection: pipelineProjection,
  inputSnapshotId: 'engine-input:mock:1:2026-07-13T12:00:00.000Z',
  dataCutoffAt: '2026-07-13T12:00:00.000Z',
  generatedAt: '2026-07-13T12:00:01.000Z',
});
const result = {
  snapshotId: 'result:mock:1:final',
  finalizedAt: '2026-07-13T22:00:00.000Z',
  score: { home: 1, away: 2 },
};
const parameters = {
  projection: canonical.projection,
  markets: canonical.markets,
  result,
  evaluatorVersion: 'canonical-audit-evaluator-v1',
  auditedAt: '2026-07-13T22:00:01.000Z',
};
const generated = createCanonicalProjectionAudit(parameters);
const repeated = createCanonicalProjectionAudit(parameters);

assert.equal(generated.model, CANONICAL_PROJECTION_AUDIT_SERVICE_MODEL);
assert.equal(generated.validation.valid, true, 'Generated audit should satisfy contract and relationship');
assert.equal(generated.validation.audit.valid, true, 'Audit payload should be valid');
assert.equal(generated.validation.relationship.valid, true, 'Audit should reproduce the projection');
assert.deepEqual(repeated, generated, 'Equal inputs must reproduce the complete audit envelope');
assert.deepEqual(
  generated.audit.outcomes.map((outcome) => outcome.settlement.observedSelectionKey),
  ['away', 'over', 'yes'],
  'Final score should settle every projected market',
);
assert.equal(generated.audit.summary.auditedMarkets, 3);
assert.equal(generated.audit.summary.settledMarkets, 3);
assert.equal(Object.hasOwn(generated.audit, 'odds'), false, 'Scientific audit must not contain odds');
assert.equal(Object.hasOwn(generated.audit, 'profit'), false, 'Scientific audit must not contain profit');

const market = (type, line = null, period = 'full-match') => ({ type, line, period });

assert.deepEqual(
  settleCanonicalMarket(market('match-result'), { score: { home: 2, away: 2 } }),
  { ruleVersion: CANONICAL_SETTLEMENT_RULE_VERSION, status: 'settled', observedSelectionKey: 'draw' },
);
assert.equal(
  settleCanonicalMarket(market('total-goals', 3), { score: { home: 2, away: 1 } }).status,
  'push',
  'Integer totals should push on equality',
);
assert.equal(
  settleCanonicalMarket(market('total-goals', 2.25), { score: { home: 2, away: 0 } }).status,
  'partial',
  'Lower quarter lines should produce partial settlement on the lower integer',
);
assert.equal(
  settleCanonicalMarket(market('total-goals', 2.75), { score: { home: 2, away: 1 } }).status,
  'partial',
  'Upper quarter lines should produce partial settlement on the upper integer',
);
assert.equal(
  settleCanonicalMarket(market('total-goals', 2.5), { score: { home: 2, away: 1 } }).observedSelectionKey,
  'over',
);
assert.equal(
  settleCanonicalMarket(market('both-teams-score'), { score: { home: 2, away: 0 } }).observedSelectionKey,
  'no',
);
assert.equal(
  settleCanonicalMarket(market('total-corners', 8.5), {
    score: { home: 1, away: 0 },
    statistics: { corners: { home: 6, away: 4 } },
  }).observedSelectionKey,
  'over',
);
assert.equal(
  settleCanonicalMarket(market('total-corners', 8.5), result).status,
  'void',
  'Missing corner statistics must not be invented',
);
assert.equal(
  settleCanonicalMarket(market('double-chance'), result).status,
  'void',
  'Overlapping selections remain excluded in settlement v1',
);
assert.equal(
  settleCanonicalMarket(market('match-result', null, 'first-half'), result).status,
  'void',
  'Periods without observed partial scores must remain void',
);

const blocked = createCanonicalProjectionAudit({
  projection: { ...canonical.projection, status: 'blocked' },
  markets: canonical.markets,
  result,
  evaluatorVersion: 'canonical-audit-evaluator-v1',
  auditedAt: '2026-07-13T22:00:01.000Z',
});

assert.equal(blocked.audit, null, 'Blocked projections cannot generate scientific audits');
assert.equal(blocked.validation.valid, false);
assert.equal(blocked.validation.errors[0].code, 'projection-not-auditable');

const malformed = createCanonicalProjectionAudit({ ...parameters, result: null });
assert.equal(malformed.validation.valid, false, 'Missing result should return validation errors without throwing');
assert.ok(malformed.validation.errors.some((error) => error.code === 'required-object'));

const missingMarket = createCanonicalProjectionAudit({ ...parameters, markets: [] });
assert.equal(missingMarket.validation.valid, false, 'Missing market definitions should invalidate orchestration');
assert.ok(missingMarket.validation.errors.some((error) => error.code === 'market-not-found'));

console.log('Canonical settlement and audit service tests passed');
