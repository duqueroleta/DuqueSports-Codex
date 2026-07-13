import assert from 'node:assert/strict';
import { CANONICAL_MARKET_TYPES } from '../../src/engine/contracts/CanonicalMarketContract.js';
import {
  buildModelRegistrationId,
} from '../../src/engine/registry/ModelRegistrationContract.js';
import {
  MODEL_COMPARISON_SCHEMA_VERSION,
  MODEL_COMPARATOR_VERSION,
  compareModelCandidates,
} from '../../src/engine/registry/ModelComparisonService.js';
import { CANDIDATE_MODEL_REGISTRATION_V1 } from '../../src/engine/registry/examples/candidateModelRegistration.v1.js';

function backtestSummary(brier, logLoss) {
  return {
    totalCases: 6,
    auditedCases: 6,
    blockedCases: 0,
    rejectedCases: 0,
    auditedMarkets: 18,
    settledMarkets: 18,
    hits: 11,
    misses: 7,
    excludedMarkets: 0,
    meanBrierScore: brier,
    meanLogLoss: logLoss,
  };
}

function calibrationSummary(ece, brier) {
  return {
    samples: 18,
    expectedCalibrationError: ece,
    maximumCalibrationError: ece + 2,
    brierScore: brier,
  };
}

function createBacktest(id, brier, logLoss) {
  const summary = backtestSummary(brier, logLoss);
  return {
    id,
    dataset: {
      id: CANDIDATE_MODEL_REGISTRATION_V1.dataset.id,
      evidenceLevel: 'infrastructure-only',
    },
    execution: {
      evaluatorVersion: 'canonical-backtest-evaluator-v1',
      runAt: '2026-07-13T23:10:00.000Z',
      engineVersions: [CANDIDATE_MODEL_REGISTRATION_V1.engineVersion],
    },
    cases: ['1', '2', '3', '4', '5', '6'].map((idPart) => ({ matchId: `match:synthetic:${idPart}` })),
    summary: {
      overall: summary,
      partitions: { train: summary, calibration: summary, test: summary },
    },
    validation: { valid: true },
  };
}

function createCalibrationReport(id, backtestId, ece, brier) {
  const summary = calibrationSummary(ece, brier);
  return {
    id,
    source: {
      backtestRunId: backtestId,
      datasetId: CANDIDATE_MODEL_REGISTRATION_V1.dataset.id,
      evidenceLevel: 'infrastructure-only',
    },
    execution: {
      model: 'top-prediction-calibration-v2',
      generatedAt: '2026-07-13T23:20:00.000Z',
      bucketWidth: 10,
      minimumSamples: 30,
    },
    overall: summary,
    partitions: { train: summary, calibration: summary, test: summary },
    marketSegments: Object.fromEntries(CANONICAL_MARKET_TYPES.map((marketType) => [marketType, {
      overall: { assessment: 'insufficient-sample', metrics: summary },
    }])),
  };
}

const baselineBacktest = createBacktest(CANDIDATE_MODEL_REGISTRATION_V1.evaluation.backtestRunId, 0.22, 0.71);
const baselineCalibration = createCalibrationReport(
  CANDIDATE_MODEL_REGISTRATION_V1.evaluation.calibrationReportId,
  baselineBacktest.id,
  12,
  0.24,
);
const candidateBacktest = createBacktest('backtest:synthetic:phase-89:candidate', 0.18, 0.64);
const candidateCalibration = createCalibrationReport(
  'calibration-report:synthetic:phase-89:candidate',
  candidateBacktest.id,
  8,
  0.2,
);
const candidateRegisteredAt = '2026-07-13T23:32:00.000Z';
const candidateRegistration = {
  ...CANDIDATE_MODEL_REGISTRATION_V1,
  id: buildModelRegistrationId({
    name: CANDIDATE_MODEL_REGISTRATION_V1.name,
    version: 'candidate-1.1.0',
    codeRevision: '2222222222222222222222222222222222222222',
    registeredAt: candidateRegisteredAt,
  }),
  version: 'candidate-1.1.0',
  registeredAt: candidateRegisteredAt,
  code: {
    ...CANDIDATE_MODEL_REGISTRATION_V1.code,
    revision: '2222222222222222222222222222222222222222',
  },
  parameters: {
    snapshotId: 'parameters:synthetic:candidate-1.1.0',
    checksum: `sha256:${'b'.repeat(64)}`,
  },
  evaluation: {
    backtestRunId: candidateBacktest.id,
    calibrationReportId: candidateCalibration.id,
    evidenceLevel: 'infrastructure-only',
  },
};
const baseline = {
  registration: CANDIDATE_MODEL_REGISTRATION_V1,
  backtestRun: baselineBacktest,
  calibrationReport: baselineCalibration,
};
const candidate = {
  registration: candidateRegistration,
  backtestRun: candidateBacktest,
  calibrationReport: candidateCalibration,
};
const parameters = { baseline, candidate, generatedAt: '2026-07-13T23:40:00.000Z' };
const generated = compareModelCandidates(parameters);
const repeated = compareModelCandidates(parameters);

assert.equal(generated.model, MODEL_COMPARATOR_VERSION);
assert.equal(generated.validation.valid, true);
assert.equal(generated.comparison.schemaVersion, MODEL_COMPARISON_SCHEMA_VERSION);
assert.equal(generated.comparison.methodology.deltaDefinition, 'candidate-minus-baseline');
assert.equal(generated.comparison.differences.backtest.overall.quality.meanBrierScore.delta, -0.04);
assert.equal(generated.comparison.differences.backtest.overall.quality.meanLogLoss.delta, -0.07);
assert.equal(generated.comparison.differences.calibration.overall.expectedCalibrationError.delta, -4);
assert.equal(generated.comparison.governance.comparisonUse, 'infrastructure-only');
assert.equal(generated.comparison.governance.automaticPromotion, false);
assert.equal(generated.comparison.governance.decision, 'manual-review-required');
assert.equal(Object.hasOwn(generated.comparison, 'winner'), false, 'Comparator must not declare a winner');
assert.deepEqual(repeated, generated, 'Equal artifacts and time should reproduce the comparison');

const mismatchedDataset = compareModelCandidates({
  ...parameters,
  candidate: {
    ...candidate,
    registration: {
      ...candidateRegistration,
      dataset: { ...candidateRegistration.dataset, id: 'dataset:other' },
    },
    backtestRun: {
      ...candidateBacktest,
      dataset: { ...candidateBacktest.dataset, id: 'dataset:other' },
    },
    calibrationReport: {
      ...candidateCalibration,
      source: { ...candidateCalibration.source, datasetId: 'dataset:other' },
    },
  },
});

assert.equal(mismatchedDataset.validation.valid, false);
assert.ok(mismatchedDataset.validation.errors.some((error) => error.code === 'dataset-mismatch'));

const mismatchedCases = compareModelCandidates({
  ...parameters,
  candidate: {
    ...candidate,
    backtestRun: { ...candidateBacktest, cases: candidateBacktest.cases.slice(1) },
  },
});

assert.ok(mismatchedCases.validation.errors.some((error) => error.code === 'case-set-mismatch'));

const duplicated = compareModelCandidates({ ...parameters, candidate: baseline });
assert.ok(duplicated.validation.errors.some((error) => error.code === 'duplicate-registration'));

const prematureRegisteredAt = '2026-07-13T23:00:00.000Z';
const prematureRegistration = {
  ...candidateRegistration,
  id: buildModelRegistrationId({
    name: candidateRegistration.name,
    version: candidateRegistration.version,
    codeRevision: candidateRegistration.code.revision,
    registeredAt: prematureRegisteredAt,
  }),
  registeredAt: prematureRegisteredAt,
};
const premature = compareModelCandidates({
  ...parameters,
  candidate: { ...candidate, registration: prematureRegistration },
});

assert.ok(premature.validation.errors.some((error) => error.code === 'registration-before-evaluation'));
assert.equal(compareModelCandidates().validation.valid, false, 'Missing artifacts should fail without throwing');

console.log('Model comparison service tests passed');
