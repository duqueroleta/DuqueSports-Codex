import assert from 'node:assert/strict';
import { matches } from '../../src/data/matches.js';
import { adaptProjectionToCanonical } from '../../src/engine/adapters/CanonicalProjectionAdapter.js';
import { adaptMatchToEngineInput } from '../../src/engine/adapters/mockMatchAdapter.js';
import {
  CANONICAL_BACKTEST_RUNNER_MODEL,
  runCanonicalBacktest,
} from '../../src/engine/backtesting/CanonicalBacktestRunner.js';
import { SYNTHETIC_HISTORICAL_DATASET_V1 } from '../../src/engine/datasets/examples/syntheticHistoricalDataset.v1.js';
import { runProjectionPipeline } from '../../src/engine/projection/ProjectionPipeline.js';

function createCase(record, index) {
  const baseInput = adaptMatchToEngineInput(matches[0]);
  const projection = runProjectionPipeline({ ...baseInput, id: record.matchId });
  const generatedAt = new Date(Date.parse(record.featureCutoffAt) + 1000).toISOString();
  const adapted = adaptProjectionToCanonical({
    projection,
    inputSnapshotId: `engine-input:synthetic:${index + 1}`,
    dataCutoffAt: record.featureCutoffAt,
    generatedAt,
  });

  return {
    projection: {
      ...adapted.projection,
      evidence: {
        ...adapted.projection.evidence,
        featureSnapshotId: record.featureSnapshotId,
      },
    },
    markets: adapted.markets,
    result: {
      snapshotId: record.resultSnapshotId,
      finalizedAt: record.resultFinalizedAt,
      score: index % 2 === 0 ? { home: 2, away: 1 } : { home: 0, away: 1 },
    },
  };
}

const cases = SYNTHETIC_HISTORICAL_DATASET_V1.records.map(createCase);
const parameters = {
  dataset: SYNTHETIC_HISTORICAL_DATASET_V1,
  cases,
  evaluatorVersion: 'canonical-backtest-evaluator-v1',
  runAt: '2026-07-13T23:10:00.000Z',
};
const frozenDatasetBeforeRun = JSON.stringify(SYNTHETIC_HISTORICAL_DATASET_V1);
const generated = runCanonicalBacktest(parameters);
const repeated = runCanonicalBacktest(parameters);

assert.equal(generated.model, CANONICAL_BACKTEST_RUNNER_MODEL);
assert.equal(generated.validation.valid, true, 'Complete frozen cases should produce a valid run');
assert.equal(generated.dataset.evidenceLevel, 'infrastructure-only', 'Synthetic data cannot claim scientific evidence');
assert.equal(generated.summary.overall.totalCases, 6);
assert.equal(generated.summary.overall.auditedCases, 6);
assert.equal(generated.summary.overall.auditedMarkets, 18);
assert.equal(generated.summary.overall.rejectedCases, 0);
assert.ok(
  generated.cases.every((testCase) => testCase.calibrationSamples.length === 3),
  'Each settled projected market should produce one top-prediction calibration sample',
);
assert.deepEqual(
  [...new Set(generated.cases[0].calibrationSamples.map((sample) => sample.marketType))],
  ['match-result', 'total-goals', 'both-teams-score'],
  'Calibration samples should preserve canonical market types',
);
assert.equal(generated.summary.partitions.train.totalCases, 2);
assert.equal(generated.summary.partitions.calibration.totalCases, 2);
assert.equal(generated.summary.partitions.test.totalCases, 2);
assert.ok(Number.isFinite(generated.summary.overall.meanBrierScore));
assert.ok(Number.isFinite(generated.summary.overall.meanLogLoss));
assert.deepEqual(repeated, generated, 'Equal frozen inputs must reproduce the complete backtest');
assert.equal(JSON.stringify(SYNTHETIC_HISTORICAL_DATASET_V1), frozenDatasetBeforeRun, 'Runner must not mutate the dataset');

const blockedProjection = {
  ...cases[0].projection,
  status: 'blocked',
  metrics: {
    expectedGoals: { home: null, away: null },
    confidence: null,
    dataQualityScore: 30,
    calibrationReliability: null,
  },
  predictions: [],
  evidence: {
    featureSnapshotId: null,
    keyDrivers: [],
    riskFlags: [],
    blockReasons: ['Historical input did not satisfy Data Quality.'],
  },
};
const withBlocked = runCanonicalBacktest({
  ...parameters,
  cases: [{ ...cases[0], projection: blockedProjection, markets: [] }, ...cases.slice(1)],
});

assert.equal(withBlocked.validation.valid, true, 'Valid Data Quality blocks should remain part of coverage');
assert.equal(withBlocked.cases[0].status, 'blocked');
assert.deepEqual(withBlocked.cases[0].calibrationSamples, []);
assert.equal(withBlocked.summary.overall.blockedCases, 1);
assert.equal(withBlocked.summary.overall.auditedCases, 5);

const postKickoff = runCanonicalBacktest({
  ...parameters,
  cases: cases.map((testCase, index) => index === 0
    ? {
      ...testCase,
      projection: {
        ...testCase.projection,
        execution: { ...testCase.projection.execution, generatedAt: '2025-01-15T21:00:00.000Z' },
      },
    }
    : testCase),
});

assert.equal(postKickoff.validation.valid, false, 'Post-kickoff projections must invalidate backtesting');
assert.ok(postKickoff.validation.errors.some((error) => error.code === 'post-kickoff-projection'));

const wrongResult = runCanonicalBacktest({
  ...parameters,
  cases: cases.map((testCase, index) => index === 0
    ? { ...testCase, result: { ...testCase.result, snapshotId: 'result:wrong' } }
    : testCase),
});

assert.ok(wrongResult.validation.errors.some((error) => error.code === 'result-snapshot-mismatch'));

const missing = runCanonicalBacktest({ ...parameters, cases: cases.slice(1) });
assert.equal(missing.validation.valid, false);
assert.ok(missing.validation.errors.some((error) => error.code === 'missing-backtest-case'));
assert.equal(runCanonicalBacktest().validation.valid, false, 'Missing input should fail without throwing');

console.log('Canonical backtest runner tests passed');
