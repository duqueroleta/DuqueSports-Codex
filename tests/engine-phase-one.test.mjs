import assert from 'node:assert/strict';
import { matches } from '../src/data/matches.js';
import { adaptMatchToEngineInput } from '../src/engine/adapters/mockMatchAdapter.js';
import { runDataQuality } from '../src/engine/data-quality/DataQualityEngine.js';
import { FEATURE_CATALOG } from '../src/engine/feature-store/featureCatalog.js';
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
assert.equal(FEATURE_CATALOG.length, 6, 'Feature catalog should expose six phase-two features');
assert.equal(projection.trace.featureStore.valid, true, 'Feature Store snapshot should be valid');
assert.equal(projection.trace.featureStore.catalogSize, 6, 'Projection trace should include the Feature Store catalog size');
assert.ok(
  projection.trace.featureStore.features.home.some((feature) => feature.featureId === 'adjusted_xg'),
  'Feature Store should register home adjusted_xg',
);
assert.ok(
  projection.trace.featureStore.features.match.some((feature) => feature.featureId === 'xg_differential'),
  'Feature Store should register match xg_differential',
);

console.log('DUQUE Engine Phase 1-2 tests passed');
