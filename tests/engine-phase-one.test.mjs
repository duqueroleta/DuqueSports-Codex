import assert from 'node:assert/strict';
import { matches } from '../src/data/matches.js';
import { adaptMatchToEngineInput } from '../src/engine/adapters/mockMatchAdapter.js';
import { runDataQuality } from '../src/engine/data-quality/DataQualityEngine.js';
import { runProjectionPipeline } from '../src/engine/projection/ProjectionPipeline.js';

const sampleMatch = matches[0];
const engineInput = adaptMatchToEngineInput(sampleMatch);
const dataQuality = runDataQuality(engineInput);
const projection = runProjectionPipeline(engineInput);

assert.equal(dataQuality.passed, true, 'Data Quality should approve the sample match');
assert.equal(projection.blocked, undefined, 'Projection should not be blocked');
assert.ok(projection.expectedHomeGoals > 0, 'Expected home goals should be positive');
assert.ok(projection.expectedAwayGoals > 0, 'Expected away goals should be positive');
assert.ok(projection.confidence >= 0 && projection.confidence <= 100, 'Confidence should stay within 0-100');
assert.ok(projection.probabilities.over25 >= 1 && projection.probabilities.over25 <= 98, 'Over 2.5 probability should be calibrated');
assert.equal(projection.trace.recency.home.sampleSize, 5, 'Recency Engine should use five recent matches');

console.log('DUQUE Engine Phase 1 tests passed');
