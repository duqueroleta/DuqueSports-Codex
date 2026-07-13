import assert from 'node:assert/strict';
import { matches } from '../../src/data/matches.js';
import {
  CANONICAL_PROJECTION_ADAPTER_MODEL,
  adaptProjectionToCanonical,
  normalizeCanonicalMatchId,
} from '../../src/engine/adapters/CanonicalProjectionAdapter.js';
import { adaptMatchToEngineInput } from '../../src/engine/adapters/mockMatchAdapter.js';
import { runProjectionPipeline } from '../../src/engine/projection/ProjectionPipeline.js';

const engineInput = adaptMatchToEngineInput(matches[0]);
const pipelineProjection = runProjectionPipeline(engineInput);
const metadata = {
  inputSnapshotId: 'engine-input:mock:1:2026-07-13T12:00:00.000Z',
  dataCutoffAt: '2026-07-13T12:00:00.000Z',
  generatedAt: '2026-07-13T12:00:01.000Z',
};
const adapted = adaptProjectionToCanonical({ projection: pipelineProjection, ...metadata });
const repeated = adaptProjectionToCanonical({ projection: pipelineProjection, ...metadata });

assert.equal(adapted.model, CANONICAL_PROJECTION_ADAPTER_MODEL, 'Adapter should expose its model version');
assert.equal(adapted.projection.status, 'completed', 'Approved pipeline output should become a completed projection');
assert.equal(adapted.projection.matchId, 'match:internal:1', 'Adapter should normalize the internal match ID');
assert.equal(adapted.markets.length, 3, 'Pipeline should expose three canonical probability markets');
assert.equal(adapted.validation.valid, true, 'Completed canonical envelope should be valid');
assert.equal(adapted.validation.projection.valid, true, 'Adapted projection should satisfy its contract');
assert.equal(adapted.validation.relationship.valid, true, 'Adapted predictions should match canonical markets');
assert.ok(adapted.validation.markets.every((validation) => validation.valid), 'Every generated market should be valid');
assert.deepEqual(repeated.projection, adapted.projection, 'Equal source and metadata should reproduce the projection');
assert.deepEqual(repeated.markets, adapted.markets, 'Equal source and metadata should reproduce the markets');
assert.equal(
  adapted.projection.predictions[0].selections[0].probability,
  pipelineProjection.probabilities.homeWin,
  'Adapter should preserve calibrated home probability',
);
assert.equal(
  adapted.projection.predictions[2].selections[1].probability,
  Number((100 - pipelineProjection.probabilities.btts).toFixed(1)),
  'Adapter should complete the BTTS probability group',
);
assert.equal(Object.hasOwn(adapted.projection, 'odds'), false, 'Canonical projection should not contain odds');
assert.ok(
  adapted.projection.predictions.every((prediction) => (
    prediction.selections.every((selection) => !Object.hasOwn(selection, 'decimalOdds'))
  )),
  'Canonical predictions should not contain commercial prices',
);
assert.equal(normalizeCanonicalMatchId('match:external:9'), 'match:external:9', 'Canonical IDs should be preserved');

const blockedInput = {
  ...engineInput,
  homeTeam: {
    ...engineInput.homeTeam,
    recentMatches: [],
  },
};
const blockedPipelineProjection = runProjectionPipeline(blockedInput);
const blocked = adaptProjectionToCanonical({ projection: blockedPipelineProjection, ...metadata });

assert.equal(blocked.projection.status, 'blocked', 'Rejected input should become a blocked canonical projection');
assert.equal(blocked.projection.predictions.length, 0, 'Blocked projection should not expose probabilities');
assert.equal(blocked.markets.length, 0, 'Blocked projection should not publish projected markets');
assert.ok(blocked.projection.evidence.blockReasons.length > 0, 'Blocked projection should preserve Data Quality issues');
assert.equal(blocked.validation.projection.valid, true, 'Blocked projection should satisfy the canonical contract');
assert.equal(blocked.validation.relationship.skipped, true, 'Blocked projection should skip market relationship validation');
assert.equal(blocked.validation.valid, true, 'Blocked canonical envelope should remain valid');

const malformed = adaptProjectionToCanonical({
  projection: {
    ...pipelineProjection,
    probabilities: {
      ...pipelineProjection.probabilities,
      btts: 150,
    },
  },
  ...metadata,
});

assert.equal(malformed.validation.valid, false, 'Adapter should expose malformed pipeline probabilities');
assert.ok(
  malformed.validation.projection.errors.some((error) => error.code === 'invalid-percentage'),
  'Malformed probabilities should produce structured contract errors',
);
assert.equal(
  adaptProjectionToCanonical().validation.valid,
  false,
  'Missing adapter input should return validation errors without throwing',
);

console.log('Canonical projection adapter tests passed');
