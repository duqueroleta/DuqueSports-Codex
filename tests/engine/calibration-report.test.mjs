import assert from 'node:assert/strict';
import {
  CALIBRATION_REPORT_MODEL,
  CANONICAL_CALIBRATION_REPORT_SCHEMA_VERSION,
  createCalibrationReport,
} from '../../src/engine/calibration/CalibrationReportService.js';
import {
  getBucketIndex,
  summarizeCalibrationSamples,
} from '../../src/engine/calibration/calibrationMetrics.js';

const sample = (probability, observed, marketType = 'match-result') => ({
  marketId: `market:${probability}:${observed}`,
  marketType,
  selectionKey: 'home',
  probability,
  observed,
});
const backtestRun = {
  id: 'backtest:synthetic:phase-86',
  dataset: {
    id: 'dataset:synthetic:phase-86',
    evidenceLevel: 'infrastructure-only',
  },
  execution: { runAt: '2026-07-13T23:10:00.000Z' },
  cases: [
    { partition: 'train', status: 'audited', calibrationSamples: [sample(75, true), sample(75, false)] },
    { partition: 'calibration', status: 'audited', calibrationSamples: [sample(65, true), sample(70, true)] },
    { partition: 'test', status: 'audited', calibrationSamples: [sample(0, false), sample(100, true)] },
    { partition: 'test', status: 'blocked', calibrationSamples: [] },
  ],
  validation: { valid: true, errors: [] },
};
const parameters = { backtestRun, generatedAt: '2026-07-13T23:11:00.000Z' };
const generated = createCalibrationReport(parameters);
const repeated = createCalibrationReport(parameters);

assert.equal(generated.model, CALIBRATION_REPORT_MODEL);
assert.equal(generated.validation.valid, true);
assert.equal(generated.report.schemaVersion, CANONICAL_CALIBRATION_REPORT_SCHEMA_VERSION);
assert.equal(generated.report.source.claimStatus, 'infrastructure-only');
assert.equal(generated.report.overall.samples, 6);
assert.equal(generated.report.overall.adequacy, 'insufficient-sample');
assert.equal(generated.report.marketSegments['match-result'].overall.assessment, 'insufficient-sample');
assert.equal(generated.report.marketSegments['match-result'].overall.metrics.samples, 6);
assert.equal(generated.report.marketSegments['total-goals'].overall.metrics.samples, 0);
assert.equal(generated.report.partitions.train.samples, 2);
assert.equal(generated.report.partitions.calibration.samples, 2);
assert.equal(generated.report.partitions.test.samples, 2);
assert.equal(generated.report.overall.buckets[7].samples, 3, '70 and 75 percent should share the 70-80 bucket');
assert.equal(generated.report.overall.buckets[7].meanProbability, 73.333333);
assert.equal(generated.report.overall.buckets[7].observedRate, 66.666667);
assert.ok(Number.isFinite(generated.report.overall.expectedCalibrationError));
assert.ok(Number.isFinite(generated.report.overall.maximumCalibrationError));
assert.ok(Number.isFinite(generated.report.overall.brierScore));
assert.deepEqual(repeated, generated, 'Equal backtest and time must reproduce the report');
assert.equal(getBucketIndex(0), 0);
assert.equal(getBucketIndex(9.99), 0);
assert.equal(getBucketIndex(10), 1);
assert.equal(getBucketIndex(100), 9, 'One hundred percent must remain in the final bucket');

const empty = summarizeCalibrationSamples([]);
assert.equal(empty.samples, 0);
assert.equal(empty.expectedCalibrationError, null);
assert.equal(empty.buckets.length, 10);

const invalidSample = createCalibrationReport({
  ...parameters,
  backtestRun: {
    ...backtestRun,
    cases: [{ partition: 'test', status: 'audited', calibrationSamples: [sample(120, true)] }],
  },
});

assert.equal(invalidSample.report, null);
assert.ok(invalidSample.validation.errors.some((error) => error.code === 'invalid-calibration-sample'));

const invalidRun = createCalibrationReport({
  backtestRun: { ...backtestRun, validation: { valid: false } },
  generatedAt: parameters.generatedAt,
});

assert.equal(invalidRun.validation.valid, false);
assert.equal(invalidRun.report, null);
assert.equal(
  createCalibrationReport({
    backtestRun: { id: 'spoofed', validation: { valid: true } },
    generatedAt: parameters.generatedAt,
  }).validation.valid,
  false,
  'Incomplete runs cannot bypass validation by declaring themselves valid',
);
assert.equal(createCalibrationReport().validation.valid, false, 'Missing input should fail without throwing');

console.log('Calibration report tests passed');
