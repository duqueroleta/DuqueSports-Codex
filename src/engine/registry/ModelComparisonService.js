import { CANONICAL_MARKET_TYPES } from '../contracts/CanonicalMarketContract.js';
import { isRecord, isRequiredText, isUtcIsoDate } from '../contracts/contractValidation.js';
import { HISTORICAL_DATASET_PARTITIONS } from '../datasets/historicalDatasetValidation.js';
import { validateModelRegistration } from './ModelRegistrationContract.js';
import {
  compareBacktestSummary,
  compareCalibrationSummary,
} from './modelComparisonMetrics.js';

const MODEL_COMPARISON_SCHEMA_VERSION = 'canonical-model-comparison.v1';
const MODEL_COMPARATOR_VERSION = 'model-candidate-comparator-v1';

function comparisonError(path, code, message) {
  return { path, code, message };
}

function prefixErrors(errors, prefix) {
  return errors.map((error) => ({ ...error, path: `${prefix}.${error.path}` }));
}

function buildModelComparisonId({ baselineRegistrationId, candidateRegistrationId, generatedAt } = {}) {
  if (![baselineRegistrationId, candidateRegistrationId].every(isRequiredText)
    || !isUtcIsoDate(generatedAt)) {
    return null;
  }

  return [
    'model-comparison',
    baselineRegistrationId,
    candidateRegistrationId,
    MODEL_COMPARATOR_VERSION,
    generatedAt,
  ].map((part) => encodeURIComponent(part.trim())).join(':');
}

function validateArtifactSet(artifactSet, label) {
  const errors = [];

  if (!isRecord(artifactSet)
    || !isRecord(artifactSet.registration)
    || !isRecord(artifactSet.backtestRun)
    || !isRecord(artifactSet.calibrationReport)) {
    errors.push(comparisonError(label, 'required-artifact-set', 'registration, backtest and calibration report are required'));
    return errors;
  }

  const { registration, backtestRun, calibrationReport } = artifactSet;
  const registrationValidation = validateModelRegistration(registration);
  errors.push(...prefixErrors(registrationValidation.errors, `${label}.registration`));

  if (backtestRun.validation?.valid !== true || !isRequiredText(backtestRun.id)) {
    errors.push(comparisonError(`${label}.backtestRun`, 'invalid-backtest-run', 'comparison requires a valid backtest'));
  }

  if (!isRequiredText(calibrationReport.id)
    || !isRequiredText(calibrationReport.execution?.model)
    || !isUtcIsoDate(calibrationReport.execution?.generatedAt)) {
    errors.push(comparisonError(`${label}.calibrationReport`, 'invalid-calibration-report', 'comparison requires a versioned calibration report'));
  }

  if (registration.evaluation?.backtestRunId !== backtestRun.id
    || registration.evaluation?.calibrationReportId !== calibrationReport.id
    || calibrationReport.source?.backtestRunId !== backtestRun.id) {
    errors.push(comparisonError(`${label}.registration.evaluation`, 'artifact-reference-mismatch', 'registration must reference its supplied evaluations'));
  }

  if (registration.dataset?.id !== backtestRun.dataset?.id
    || registration.dataset?.id !== calibrationReport.source?.datasetId
    || registration.evaluation?.evidenceLevel !== backtestRun.dataset?.evidenceLevel
    || registration.evaluation?.evidenceLevel !== calibrationReport.source?.evidenceLevel) {
    errors.push(comparisonError(`${label}.registration.dataset`, 'artifact-evidence-mismatch', 'dataset and evidence level must remain consistent'));
  }

  if (isUtcIsoDate(registration.registeredAt)
    && [backtestRun.execution?.runAt, calibrationReport.execution?.generatedAt]
      .filter(isUtcIsoDate)
      .some((date) => Date.parse(registration.registeredAt) < Date.parse(date))) {
    errors.push(comparisonError(`${label}.registration.registeredAt`, 'registration-before-evaluation', 'registration cannot predate its evaluation artifacts'));
  }

  if (!Array.isArray(backtestRun.execution?.engineVersions)
    || !backtestRun.execution.engineVersions.includes(registration.engineVersion)) {
    errors.push(comparisonError(`${label}.registration.engineVersion`, 'engine-version-mismatch', 'registered Engine version must exist in backtesting'));
  }

  return errors;
}

function getCaseSet(backtestRun) {
  return (Array.isArray(backtestRun?.cases) ? backtestRun.cases : [])
    .map((item) => item?.matchId)
    .filter(isRequiredText)
    .sort();
}

function validateCompatibility(baseline, candidate) {
  const errors = [];
  const baselineRegistration = baseline.registration;
  const candidateRegistration = candidate.registration;

  if (baselineRegistration.id === candidateRegistration.id) {
    errors.push(comparisonError('candidate.registration.id', 'duplicate-registration', 'comparison requires two distinct registrations'));
  }

  if (baselineRegistration.name !== candidateRegistration.name) {
    errors.push(comparisonError('candidate.registration.name', 'model-family-mismatch', 'candidates must belong to the same model family'));
  }

  if (baselineRegistration.dataset?.id !== candidateRegistration.dataset?.id
    || baselineRegistration.dataset?.kind !== candidateRegistration.dataset?.kind) {
    errors.push(comparisonError('candidate.registration.dataset', 'dataset-mismatch', 'candidates must use the same frozen dataset'));
  }

  if (baselineRegistration.evaluation?.evidenceLevel
    !== candidateRegistration.evaluation?.evidenceLevel) {
    errors.push(comparisonError('candidate.registration.evaluation.evidenceLevel', 'evidence-level-mismatch', 'candidates must use the same evidence level'));
  }

  if (baseline.backtestRun.execution?.evaluatorVersion
    !== candidate.backtestRun.execution?.evaluatorVersion) {
    errors.push(comparisonError('candidate.backtestRun.execution.evaluatorVersion', 'evaluator-mismatch', 'backtests must use the same evaluator'));
  }

  const baselineCalibration = baseline.calibrationReport.execution;
  const candidateCalibration = candidate.calibrationReport.execution;

  if (baselineCalibration?.model !== candidateCalibration?.model
    || baselineCalibration?.bucketWidth !== candidateCalibration?.bucketWidth
    || baselineCalibration?.minimumSamples !== candidateCalibration?.minimumSamples) {
    errors.push(comparisonError('candidate.calibrationReport.execution', 'calibration-method-mismatch', 'calibration methodology must match'));
  }

  if (JSON.stringify(getCaseSet(baseline.backtestRun))
    !== JSON.stringify(getCaseSet(candidate.backtestRun))) {
    errors.push(comparisonError('candidate.backtestRun.cases', 'case-set-mismatch', 'backtests must cover the same matches'));
  }

  return errors;
}

function buildDifferences(baseline, candidate) {
  const backtestPartitions = Object.fromEntries(HISTORICAL_DATASET_PARTITIONS.map((partition) => [
    partition,
    compareBacktestSummary(
      baseline.backtestRun.summary?.partitions?.[partition],
      candidate.backtestRun.summary?.partitions?.[partition],
    ),
  ]));
  const calibrationPartitions = Object.fromEntries(HISTORICAL_DATASET_PARTITIONS.map((partition) => [
    partition,
    compareCalibrationSummary(
      baseline.calibrationReport.partitions?.[partition],
      candidate.calibrationReport.partitions?.[partition],
    ),
  ]));
  const marketSegments = Object.fromEntries(CANONICAL_MARKET_TYPES.map((marketType) => [
    marketType,
    {
      baselineAssessment: baseline.calibrationReport.marketSegments?.[marketType]?.overall?.assessment ?? null,
      candidateAssessment: candidate.calibrationReport.marketSegments?.[marketType]?.overall?.assessment ?? null,
      metrics: compareCalibrationSummary(
        baseline.calibrationReport.marketSegments?.[marketType]?.overall?.metrics,
        candidate.calibrationReport.marketSegments?.[marketType]?.overall?.metrics,
      ),
    },
  ]));

  return {
    backtest: {
      overall: compareBacktestSummary(baseline.backtestRun.summary?.overall, candidate.backtestRun.summary?.overall),
      partitions: backtestPartitions,
    },
    calibration: {
      overall: compareCalibrationSummary(baseline.calibrationReport.overall, candidate.calibrationReport.overall),
      partitions: calibrationPartitions,
      marketSegments,
    },
  };
}

function compareModelCandidates({ baseline, candidate, generatedAt } = {}) {
  const errors = [
    ...validateArtifactSet(baseline, 'baseline'),
    ...validateArtifactSet(candidate, 'candidate'),
  ];

  if (!isUtcIsoDate(generatedAt)) {
    errors.push(comparisonError('generatedAt', 'invalid-utc-date', 'generatedAt must be an ISO UTC date'));
  }

  if (errors.length === 0) {
    errors.push(...validateCompatibility(baseline, candidate));

    if ([baseline.registration.registeredAt, candidate.registration.registeredAt]
      .some((date) => Date.parse(generatedAt) < Date.parse(date))) {
      errors.push(comparisonError('generatedAt', 'comparison-before-registration', 'comparison cannot predate either registration'));
    }
  }

  if (errors.length > 0) {
    return { model: MODEL_COMPARATOR_VERSION, comparison: null, validation: { valid: false, errors } };
  }

  const evidenceLevel = baseline.registration.evaluation.evidenceLevel;
  const comparison = {
    schemaVersion: MODEL_COMPARISON_SCHEMA_VERSION,
    id: buildModelComparisonId({
      baselineRegistrationId: baseline.registration.id,
      candidateRegistrationId: candidate.registration.id,
      generatedAt,
    }),
    generatedAt,
    baseline: {
      registrationId: baseline.registration.id,
      version: baseline.registration.version,
      codeRevision: baseline.registration.code.revision,
    },
    candidate: {
      registrationId: candidate.registration.id,
      version: candidate.registration.version,
      codeRevision: candidate.registration.code.revision,
    },
    methodology: {
      comparatorVersion: MODEL_COMPARATOR_VERSION,
      deltaDefinition: 'candidate-minus-baseline',
      datasetId: baseline.registration.dataset.id,
      evidenceLevel,
    },
    differences: buildDifferences(baseline, candidate),
    governance: {
      comparisonUse: evidenceLevel === 'infrastructure-only'
        ? 'infrastructure-only'
        : 'scientific-review-input',
      automaticPromotion: false,
      decision: 'manual-review-required',
    },
  };

  return {
    model: MODEL_COMPARATOR_VERSION,
    comparison,
    validation: { valid: true, errors: [] },
  };
}

export {
  MODEL_COMPARISON_SCHEMA_VERSION,
  MODEL_COMPARATOR_VERSION,
  buildModelComparisonId,
  compareModelCandidates,
};
