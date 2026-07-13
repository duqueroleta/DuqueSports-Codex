import assert from 'node:assert/strict';
import {
  MINIMUM_CALIBRATION_SAMPLES,
  buildMarketCalibrationSegments,
  summarizeWithAdequacy,
} from '../../src/engine/calibration/calibrationSegmentation.js';

const createSamples = (count, marketType, partition = 'test') => Array.from(
  { length: count },
  (_, index) => ({
    marketId: `market:${marketType}:${index}`,
    marketType,
    selectionKey: 'over',
    probability: 60,
    observed: index % 2 === 0,
    partition,
  }),
);

const insufficient = summarizeWithAdequacy(createSamples(MINIMUM_CALIBRATION_SAMPLES - 1, 'total-goals'));
const eligible = summarizeWithAdequacy(createSamples(MINIMUM_CALIBRATION_SAMPLES, 'total-goals'));

assert.equal(insufficient.assessment, 'insufficient-sample');
assert.equal(insufficient.metrics.samples, 29);
assert.equal(eligible.assessment, 'eligible', 'Threshold should become eligible at exactly thirty samples');
assert.equal(eligible.metrics.samples, 30);

const segments = buildMarketCalibrationSegments(
  [
    ...createSamples(30, 'total-goals', 'test'),
    ...createSamples(5, 'both-teams-score', 'calibration'),
  ],
  ['total-goals', 'both-teams-score', 'total-corners'],
);

assert.equal(segments['total-goals'].overall.assessment, 'eligible');
assert.equal(segments['total-goals'].partitions.test.assessment, 'eligible');
assert.equal(segments['total-goals'].partitions.train.assessment, 'insufficient-sample');
assert.equal(segments['both-teams-score'].overall.metrics.samples, 5);
assert.equal(segments['total-corners'].overall.metrics.samples, 0);
assert.ok(Number.isFinite(segments['total-goals'].overall.metrics.expectedCalibrationError));

console.log('Calibration segmentation tests passed');
