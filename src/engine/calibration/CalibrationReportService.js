import { isRecord, isRequiredText, isUtcIsoDate } from '../contracts/contractValidation.js';
import { CANONICAL_MARKET_TYPES } from '../contracts/CanonicalMarketContract.js';
import { HISTORICAL_DATASET_PARTITIONS } from '../datasets/historicalDatasetValidation.js';
import {
  CALIBRATION_BUCKET_WIDTH,
  summarizeCalibrationSamples,
} from './calibrationMetrics.js';
import {
  MINIMUM_CALIBRATION_SAMPLES,
  buildMarketCalibrationSegments,
  summarizeWithAdequacy,
} from './calibrationSegmentation.js';

const CANONICAL_CALIBRATION_REPORT_SCHEMA_VERSION = 'canonical-calibration-report.v1';
const CALIBRATION_REPORT_MODEL = 'top-prediction-calibration-v2';

function reportError(path, code, message) {
  return { path, code, message };
}

function buildCalibrationReportId({ backtestRunId, model, generatedAt } = {}) {
  if (![backtestRunId, model].every(isRequiredText) || !isUtcIsoDate(generatedAt)) {
    return null;
  }

  return ['calibration-report', backtestRunId, model, generatedAt]
    .map((part) => encodeURIComponent(part.trim()))
    .join(':');
}

function collectCalibrationSamples(backtestRun, errors) {
  const samples = [];

  backtestRun.cases.forEach((testCase, caseIndex) => {
    if (testCase?.status !== 'audited') {
      return;
    }

    if (!HISTORICAL_DATASET_PARTITIONS.includes(testCase.partition)) {
      errors.push(reportError(`cases.${caseIndex}.partition`, 'unsupported-partition', 'calibration case must use a historical partition'));
    }

    if (!Array.isArray(testCase.calibrationSamples)) {
      errors.push(reportError(`cases.${caseIndex}.calibrationSamples`, 'required-array', 'audited cases require calibration samples'));
      return;
    }

    testCase.calibrationSamples.forEach((sample, sampleIndex) => {
      const path = `cases.${caseIndex}.calibrationSamples.${sampleIndex}`;

      if (!isRecord(sample)
        || !isRequiredText(sample.marketId)
        || !isRequiredText(sample.selectionKey)
        || !Number.isFinite(sample.probability)
        || sample.probability < 0
        || sample.probability > 100
        || typeof sample.observed !== 'boolean'
        || !CANONICAL_MARKET_TYPES.includes(sample.marketType)) {
        errors.push(reportError(path, 'invalid-calibration-sample', 'sample requires market identity, canonical type, probability within 0-100 and observed boolean'));
        return;
      }

      samples.push({ ...sample, partition: testCase.partition });
    });
  });

  if (samples.length === 0) {
    errors.push(reportError('cases', 'no-calibration-samples', 'calibration requires settled audited markets'));
  }

  return samples;
}

function createCalibrationReport({ backtestRun, generatedAt } = {}) {
  const errors = [];

  if (!isRecord(backtestRun) || backtestRun.validation?.valid !== true || !isRequiredText(backtestRun.id)) {
    errors.push(reportError('backtestRun', 'invalid-backtest-run', 'a valid canonical backtest run is required'));
  }

  if (isRecord(backtestRun) && !Array.isArray(backtestRun.cases)) {
    errors.push(reportError('backtestRun.cases', 'required-array', 'backtest cases are required'));
  }

  if (isRecord(backtestRun) && !isUtcIsoDate(backtestRun.execution?.runAt)) {
    errors.push(reportError('backtestRun.execution.runAt', 'invalid-utc-date', 'backtest runAt must be an ISO UTC date'));
  }

  if (isRecord(backtestRun)
    && (!isRequiredText(backtestRun.dataset?.id)
      || !isRequiredText(backtestRun.dataset?.evidenceLevel))) {
    errors.push(reportError('backtestRun.dataset', 'invalid-dataset-reference', 'backtest dataset identity and evidence level are required'));
  }

  if (!isUtcIsoDate(generatedAt)) {
    errors.push(reportError('generatedAt', 'invalid-utc-date', 'generatedAt must be an ISO UTC date'));
  } else if (isUtcIsoDate(backtestRun?.execution?.runAt)
    && Date.parse(generatedAt) < Date.parse(backtestRun.execution.runAt)) {
    errors.push(reportError('generatedAt', 'report-before-backtest', 'calibration report cannot predate backtesting'));
  }

  if (errors.length > 0) {
    return { model: CALIBRATION_REPORT_MODEL, report: null, validation: { valid: false, errors } };
  }

  const samples = collectCalibrationSamples(backtestRun, errors);

  if (errors.length > 0) {
    return { model: CALIBRATION_REPORT_MODEL, report: null, validation: { valid: false, errors } };
  }

  const report = {
    schemaVersion: CANONICAL_CALIBRATION_REPORT_SCHEMA_VERSION,
    id: buildCalibrationReportId({
      backtestRunId: backtestRun.id,
      model: CALIBRATION_REPORT_MODEL,
      generatedAt,
    }),
    source: {
      backtestRunId: backtestRun.id,
      datasetId: backtestRun.dataset.id,
      evidenceLevel: backtestRun.dataset.evidenceLevel,
      claimStatus: backtestRun.dataset.evidenceLevel === 'infrastructure-only'
        ? 'infrastructure-only'
        : 'candidate-not-approved',
    },
    execution: {
      model: CALIBRATION_REPORT_MODEL,
      generatedAt,
      bucketWidth: CALIBRATION_BUCKET_WIDTH,
      minimumSamples: MINIMUM_CALIBRATION_SAMPLES,
    },
    overall: {
      ...summarizeCalibrationSamples(samples),
      adequacy: summarizeWithAdequacy(samples).assessment,
      minimumSamples: MINIMUM_CALIBRATION_SAMPLES,
    },
    partitions: Object.fromEntries(HISTORICAL_DATASET_PARTITIONS.map((partition) => [
      partition,
      summarizeCalibrationSamples(samples.filter((sample) => sample.partition === partition)),
    ])),
    marketSegments: buildMarketCalibrationSegments(samples, CANONICAL_MARKET_TYPES),
  };

  return {
    model: CALIBRATION_REPORT_MODEL,
    report,
    validation: { valid: true, errors: [] },
  };
}

export {
  CALIBRATION_REPORT_MODEL,
  CANONICAL_CALIBRATION_REPORT_SCHEMA_VERSION,
  buildCalibrationReportId,
  createCalibrationReport,
};
