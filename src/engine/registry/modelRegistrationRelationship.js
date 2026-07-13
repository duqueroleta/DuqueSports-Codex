import { isRecord, isUtcIsoDate } from '../contracts/contractValidation.js';
import { validateHistoricalDataset } from '../datasets/HistoricalDatasetContract.js';
import { validateModelRegistration } from './ModelRegistrationContract.js';

function relationshipError(path, code, message) {
  return { path, code, message };
}

function validateModelRegistrationEvidence(registration, { dataset, backtestRun, calibrationReport } = {}) {
  const errors = [];

  if (![registration, dataset, backtestRun, calibrationReport].every(isRecord)) {
    errors.push(relationshipError('evidence', 'required-artifacts', 'registration, dataset, backtest and calibration report are required'));
    return { valid: false, errors };
  }

  const registrationValidation = validateModelRegistration(registration);

  if (!registrationValidation.valid) {
    errors.push(...registrationValidation.errors.map((error) => ({
      ...error,
      path: `registration.${error.path}`,
    })));
  }

  const datasetValidation = validateHistoricalDataset(dataset);

  if (!datasetValidation.valid) {
    errors.push(...datasetValidation.errors.map((error) => ({ ...error, path: `dataset.${error.path}` })));
  }

  if (backtestRun.validation?.valid !== true) {
    errors.push(relationshipError('evaluation.backtestRunId', 'invalid-backtest-evidence', 'registered backtest must be valid'));
  }

  if (!isUtcIsoDate(backtestRun.execution?.runAt)
    || !isUtcIsoDate(calibrationReport.execution?.generatedAt)) {
    errors.push(relationshipError('evaluation', 'invalid-evaluation-chronology', 'evaluation artifacts require ISO UTC times'));
  }

  if (registration.dataset?.id !== dataset.id || registration.dataset?.kind !== dataset.kind) {
    errors.push(relationshipError('dataset', 'dataset-mismatch', 'registration must reference the supplied frozen dataset'));
  }

  if (registration.evaluation?.backtestRunId !== backtestRun.id
    || backtestRun.dataset?.id !== dataset.id) {
    errors.push(relationshipError('evaluation.backtestRunId', 'backtest-mismatch', 'backtest must reference the registered dataset'));
  }

  if (registration.evaluation?.calibrationReportId !== calibrationReport.id
    || calibrationReport.source?.backtestRunId !== backtestRun.id) {
    errors.push(relationshipError('evaluation.calibrationReportId', 'calibration-mismatch', 'calibration report must derive from the registered backtest'));
  }

  if (registration.evaluation?.evidenceLevel !== backtestRun.dataset?.evidenceLevel
    || registration.evaluation?.evidenceLevel !== calibrationReport.source?.evidenceLevel) {
    errors.push(relationshipError('evaluation.evidenceLevel', 'evidence-level-mismatch', 'evidence level must remain consistent across artifacts'));
  }

  const engineVersions = Array.isArray(backtestRun.execution?.engineVersions)
    ? backtestRun.execution.engineVersions
    : [];

  if (!engineVersions.includes(registration.engineVersion)) {
    errors.push(relationshipError('engineVersion', 'engine-version-mismatch', 'registered Engine version must exist in backtesting'));
  }

  const evaluationTimes = [backtestRun.execution?.runAt, calibrationReport.execution?.generatedAt]
    .filter(isUtcIsoDate)
    .map(Date.parse);

  if (isUtcIsoDate(registration.registeredAt)
    && evaluationTimes.some((time) => Date.parse(registration.registeredAt) < time)) {
    errors.push(relationshipError('registeredAt', 'registration-before-evaluation', 'model cannot be registered before its evaluations'));
  }

  return { valid: errors.length === 0, errors };
}

export { validateModelRegistrationEvidence };
