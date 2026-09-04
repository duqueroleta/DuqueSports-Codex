import assert from 'node:assert/strict';
import { matches } from '../../src/data/matches.js';
import { adaptMatchToEngineInput } from '../../src/engine/adapters/mockMatchAdapter.js';
import { buildDiscreteDistribution } from '../../src/engine/forecasting/DiscreteDistributionEngine.js';
import { runForecastEnsemble } from '../../src/engine/forecasting/ForecastEnsembleEngine.js';
import { runProjectionPipeline } from '../../src/engine/projection/ProjectionPipeline.js';

const overdispersed = buildDiscreteDistribution({ mean: 15.37, variance: 28 });
const totalMass = overdispersed.probabilities.reduce((sum, item) => sum + item.probability, 0);

assert.equal(overdispersed.family, 'negative-binomial', 'Overdispersed count forecasts should use Negative Binomial');
assert.ok(Math.abs(totalMass - 1) < 0.000001, 'Discrete forecast probabilities should normalize to 1');
assert.ok(Number.isInteger(overdispersed.summary.mode), 'Exact-count mode should be a discrete integer');
assert.ok(
  overdispersed.summary.intervals.p80.low <= overdispersed.summary.mode
    && overdispersed.summary.intervals.p80.high >= overdispersed.summary.mode,
  'P80 interval should contain the modal count in the reference distribution',
);

const tightConsensus = runForecastEnsemble({
  forecasts: [
    { id: 'a', mean: 15, weight: 1 },
    { id: 'b', mean: 15.5, weight: 1 },
    { id: 'c', mean: 16, weight: 1 },
  ],
});
const wideConsensus = runForecastEnsemble({
  forecasts: [
    { id: 'a', mean: 10, weight: 1 },
    { id: 'b', mean: 16, weight: 1 },
    { id: 'c', mean: 23, weight: 1 },
  ],
});

assert.ok(
  tightConsensus.consensusIndex > wideConsensus.consensusIndex,
  'Consensus Index should fall as component forecasts diverge',
);
assert.equal(
  tightConsensus.consensusMeaning,
  'model-agreement-not-hit-probability',
  'Consensus Index must never be presented as hit probability',
);

const engineInput = adaptMatchToEngineInput(matches[0]);
const projection = runProjectionPipeline(engineInput);
const intelligence = projection.forecastIntelligence;

assert.ok(intelligence, 'Projection Pipeline should expose additive Forecast Intelligence');
assert.equal(intelligence.model, 'forecast-intelligence-layer-v1');
assert.equal(intelligence.additive, true, 'Forecast Intelligence should be explicitly additive');
assert.equal(intelligence.replacesLegacyProjection, false, 'Forecast Intelligence must not replace legacy projection');
assert.deepEqual(
  intelligence.focusMetrics,
  ['shots', 'shotsOnTarget', 'corners'],
  'First Forecast Intelligence release should focus on operational count markets',
);
assert.equal(
  projection.trace.forecasting.model,
  'forecast-intelligence-layer-v1',
  'Forecast Intelligence should be auditable through the projection trace',
);

const homeShots = intelligence.markets.shots.home;
const homeCorners = intelligence.markets.corners.home;

assert.ok(homeShots.ensemble.consensusIndex >= 0 && homeShots.ensemble.consensusIndex <= 100);
assert.equal(homeShots.ensemble.consensusMeaning, 'model-agreement-not-hit-probability');
assert.ok(Number.isInteger(homeShots.exactCountGuidance.mode));
assert.equal(homeShots.monteCarlo.iterations, 10000, 'Forecast Intelligence should run deterministic Monte Carlo validation');
assert.ok(
  Math.abs(homeShots.monteCarlo.mean - homeShots.distribution.summary.mean) < 0.4,
  'Monte Carlo mean should remain close to the analytical scenario-mixture mean',
);
assert.equal(
  homeCorners.evidence.coverage,
  0,
  'Missing direct corner history in mock input should be surfaced instead of hidden',
);
assert.ok(
  homeCorners.evidence.limitations.length > 0,
  'Low-evidence markets should expose explicit limitations',
);
assert.match(
  homeShots.exactCountGuidance.rule,
  /do not round the expected value/i,
  'Exact-count guidance should prevent rounded-mean selection',
);

console.log('Forecast Intelligence tests passed');
