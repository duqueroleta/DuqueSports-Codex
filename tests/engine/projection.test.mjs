import assert from 'node:assert/strict';
import { matches } from '../../src/data/matches.js';
import { adaptMatchToEngineInput } from '../../src/engine/adapters/mockMatchAdapter.js';
import { runProbabilityCalibrationEngine } from '../../src/engine/calibration/ProbabilityCalibrationEngine.js';
import { runDataQuality } from '../../src/engine/data-quality/DataQualityEngine.js';
import { FEATURE_CATALOG } from '../../src/engine/feature-store/featureCatalog.js';
import { runProjectionPipeline } from '../../src/engine/projection/ProjectionPipeline.js';
import { runPoissonEngine } from '../../src/engine/statistical/PoissonEngine.js';

const engineInput = adaptMatchToEngineInput(matches[0]);
const dataQuality = runDataQuality(engineInput);
const projection = runProjectionPipeline(engineInput);

assert.equal(dataQuality.passed, true, 'Data Quality should approve the sample match');
assert.equal(projection.blocked, undefined, 'Projection should not be blocked');
assert.ok(projection.expectedHomeGoals > 0, 'Expected home goals should be positive');
assert.ok(projection.expectedAwayGoals > 0, 'Expected away goals should be positive');
assert.ok(projection.confidence >= 0 && projection.confidence <= 100, 'Confidence should stay within 0-100');
assert.ok(projection.probabilities.over25 >= 1 && projection.probabilities.over25 <= 98, 'Over 2.5 probability should be calibrated');
assert.ok(projection.probabilities.btts >= 1 && projection.probabilities.btts <= 98, 'BTTS probability should be calibrated');
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
assert.equal(projection.trace.statistical.poisson.model, 'poisson-goals-v1', 'Projection should use Poisson statistical core');
assert.ok(projection.trace.statistical.poisson.matrix.length > 0, 'Poisson Engine should expose a score matrix');
assert.ok(
  projection.trace.statistical.poisson.correctScore.probability > 0,
  'Poisson Engine should expose the most likely scoreline',
);
assert.equal(projection.trace.calibration.model, 'probability-calibration-v1', 'Projection should use probability calibration');
assert.ok(
  projection.trace.calibration.reliability >= 0.35 && projection.trace.calibration.reliability <= 0.92,
  'Calibration reliability should stay within defined bounds',
);
assert.equal(projection.trace.explainability.model, 'explanation-engine-v1', 'Projection should use the Explanation Engine');
assert.equal(projection.aiExplanation.model, 'explanation-engine-v1', 'Projection should expose AI explanation');
assert.ok(projection.aiExplanation.keyDrivers.length >= 3, 'AI explanation should expose key drivers');
assert.ok(projection.aiExplanation.riskFlags.length >= 1, 'AI explanation should expose risk flags');
assert.equal(projection.trace.ranking.model, 'opportunity-ranking-v1', 'Projection should use Opportunity Ranking Engine');
assert.ok(projection.opportunityRanking.opportunityScore >= 0, 'Opportunity score should be non-negative');
assert.ok(projection.opportunityRanking.opportunityScore <= 100, 'Opportunity score should stay within 0-100');
assert.ok(projection.opportunityRanking.tier.length > 0, 'Opportunity ranking should expose a tier');

const poisson = runPoissonEngine({ homeLambda: 1.8, awayLambda: 1.1 });
const oneXTwoTotal = poisson.probabilities.homeWin + poisson.probabilities.draw + poisson.probabilities.awayWin;
const totalsMarket = poisson.probabilities.over25 + poisson.probabilities.under25;
const calibration = runProbabilityCalibrationEngine({
  probabilities: poisson.probabilities,
  dataQualityScore: 88,
  confidence: 81,
});
const calibratedOneXTwoTotal = calibration.probabilities.homeWin + calibration.probabilities.draw + calibration.probabilities.awayWin;
const calibratedTotalsMarket = calibration.probabilities.over25 + calibration.probabilities.under25;

assert.ok(Math.abs(oneXTwoTotal - 100) <= 0.2, 'Poisson 1X2 probabilities should sum to 100');
assert.ok(Math.abs(totalsMarket - 100) <= 0.2, 'Poisson totals market should sum to 100');
assert.ok(Math.abs(calibratedOneXTwoTotal - 100) <= 0.2, 'Calibrated 1X2 probabilities should sum to 100');
assert.ok(Math.abs(calibratedTotalsMarket - 100) <= 0.2, 'Calibrated totals market should sum to 100');

console.log('Engine projection tests passed');
