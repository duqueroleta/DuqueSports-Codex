import { createCanonicalProjectionAudit } from '../audit/CanonicalProjectionAuditService.js';
import { buildTopPredictionCalibrationSamples } from '../calibration/calibrationSamples.js';
import {
  validateCanonicalProjection,
  validateProjectionAgainstMarkets,
} from '../contracts/CanonicalProjectionContract.js';
import { isRequiredText, isUtcIsoDate } from '../contracts/contractValidation.js';
import { validateHistoricalDataset } from '../datasets/HistoricalDatasetContract.js';
import { HISTORICAL_DATASET_PARTITIONS } from '../datasets/historicalDatasetValidation.js';
import { buildBacktestSummary } from './backtestAggregation.js';

const CANONICAL_BACKTEST_RUNNER_MODEL = 'canonical-backtest-runner-v1';

function backtestError(path, code, message) {
  return { path, code, message };
}

function buildCanonicalBacktestRunId({ datasetId, evaluatorVersion, runAt } = {}) {
  if (![datasetId, evaluatorVersion].every(isRequiredText) || !isUtcIsoDate(runAt)) {
    return null;
  }

  return ['backtest', datasetId, evaluatorVersion, runAt]
    .map((part) => encodeURIComponent(part.trim()))
    .join(':');
}

function prefixErrors(errors, prefix) {
  return errors.map((error) => ({ ...error, path: `${prefix}.${error.path}` }));
}

function validateCaseLinks(record, testCase, path) {
  const errors = [];
  const projection = testCase?.projection;
  const result = testCase?.result;

  if (projection?.matchId !== record.matchId) {
    errors.push(backtestError(`${path}.projection.matchId`, 'projection-match-mismatch', 'projection must reference the dataset match'));
  }

  if (projection?.input?.dataCutoffAt !== record.featureCutoffAt) {
    errors.push(backtestError(`${path}.projection.input.dataCutoffAt`, 'feature-cutoff-mismatch', 'projection cutoff must match the frozen record'));
  }

  if (projection?.status === 'completed'
    && projection?.evidence?.featureSnapshotId !== record.featureSnapshotId) {
    errors.push(backtestError(`${path}.projection.evidence.featureSnapshotId`, 'feature-snapshot-mismatch', 'projection must use the frozen feature snapshot'));
  }

  if (isUtcIsoDate(projection?.execution?.generatedAt)
    && Date.parse(projection.execution.generatedAt) > Date.parse(record.kickoffAt)) {
    errors.push(backtestError(`${path}.projection.execution.generatedAt`, 'post-kickoff-projection', 'historical projection cannot be generated after kickoff'));
  }

  if (result?.snapshotId !== record.resultSnapshotId) {
    errors.push(backtestError(`${path}.result.snapshotId`, 'result-snapshot-mismatch', 'result must match the frozen result snapshot'));
  }

  if (result?.finalizedAt !== record.resultFinalizedAt) {
    errors.push(backtestError(`${path}.result.finalizedAt`, 'result-finalization-mismatch', 'result finalization must match the dataset record'));
  }

  return errors;
}

function evaluateBacktestCase(record, testCase, index, evaluatorVersion, runAt) {
  const path = `cases.${index}`;
  const projection = testCase?.projection;
  const markets = Array.isArray(testCase?.markets) ? testCase.markets : [];
  const projectionValidation = validateCanonicalProjection(projection);
  const errors = [
    ...prefixErrors(projectionValidation.errors, `${path}.projection`),
    ...validateCaseLinks(record, testCase, path),
  ];

  if (projection?.status === 'completed') {
    const relationship = validateProjectionAgainstMarkets(projection, markets);
    errors.push(...prefixErrors(relationship.errors, `${path}.markets`));
  }

  if (errors.length > 0) {
    return { matchId: record.matchId, partition: record.partition, status: 'rejected', audit: null, calibrationSamples: [], errors };
  }

  if (projection.status === 'blocked') {
    return { matchId: record.matchId, partition: record.partition, status: 'blocked', audit: null, calibrationSamples: [], errors: [] };
  }

  const generated = createCanonicalProjectionAudit({
    projection,
    markets,
    result: testCase.result,
    evaluatorVersion,
    auditedAt: runAt,
  });

  return {
    matchId: record.matchId,
    partition: record.partition,
    status: generated.validation.valid ? 'audited' : 'rejected',
    audit: generated.validation.valid ? generated.audit : null,
    calibrationSamples: generated.validation.valid
      ? buildTopPredictionCalibrationSamples(projection, generated.audit)
      : [],
    errors: generated.validation.valid
      ? []
      : prefixErrors(generated.validation.errors, `${path}.audit`),
  };
}

function runCanonicalBacktest({ dataset, cases, evaluatorVersion, runAt } = {}) {
  const datasetValidation = validateHistoricalDataset(dataset);
  const executionErrors = [];

  if (!isRequiredText(evaluatorVersion)) {
    executionErrors.push(backtestError('execution.evaluatorVersion', 'required-text', 'evaluatorVersion is required'));
  }

  if (!isUtcIsoDate(runAt)) {
    executionErrors.push(backtestError('execution.runAt', 'invalid-utc-date', 'runAt must be an ISO UTC date'));
  } else if (isUtcIsoDate(dataset?.createdAt) && Date.parse(runAt) < Date.parse(dataset.createdAt)) {
    executionErrors.push(backtestError('execution.runAt', 'run-before-dataset', 'backtest cannot predate the frozen dataset'));
  }

  if (!datasetValidation.valid) {
    executionErrors.push(...prefixErrors(datasetValidation.errors, 'dataset'));
  }

  const suppliedCases = Array.isArray(cases) ? cases : [];
  const casesByMatch = new Map();

  suppliedCases.forEach((testCase, index) => {
    const matchId = testCase?.projection?.matchId;

    if (!isRequiredText(matchId)) {
      executionErrors.push(backtestError(`cases.${index}.projection.matchId`, 'required-text', 'case projection matchId is required'));
    } else if (casesByMatch.has(matchId)) {
      executionErrors.push(backtestError(`cases.${index}.projection.matchId`, 'duplicate-backtest-case', 'dataset match can only be evaluated once'));
    } else {
      casesByMatch.set(matchId, testCase);
    }
  });

  const records = datasetValidation.valid ? dataset.records : [];
  const recordIds = new Set(records.map((record) => record.matchId));

  suppliedCases.forEach((testCase, index) => {
    const matchId = testCase?.projection?.matchId;

    if (isRequiredText(matchId) && !recordIds.has(matchId)) {
      executionErrors.push(backtestError(`cases.${index}.projection.matchId`, 'case-not-in-dataset', 'case must belong to the frozen dataset'));
    }
  });

  const evaluatedCases = records.map((record, index) => {
    const testCase = casesByMatch.get(record.matchId);

    if (!testCase) {
      const error = backtestError(`cases.${index}`, 'missing-backtest-case', 'every dataset record requires one case');
      executionErrors.push(error);
      return { matchId: record.matchId, partition: record.partition, status: 'rejected', audit: null, calibrationSamples: [], errors: [error] };
    }

    return evaluateBacktestCase(record, testCase, index, evaluatorVersion, runAt);
  });
  const caseErrors = evaluatedCases.flatMap((item) => item.errors);
  const errors = [...executionErrors, ...caseErrors];

  return {
    model: CANONICAL_BACKTEST_RUNNER_MODEL,
    id: buildCanonicalBacktestRunId({ datasetId: dataset?.id, evaluatorVersion, runAt }),
    dataset: {
      id: dataset?.id ?? null,
      kind: dataset?.kind ?? null,
      evidenceLevel: dataset?.kind === 'observed' ? 'scientific-candidate' : 'infrastructure-only',
    },
    execution: { evaluatorVersion: evaluatorVersion ?? null, runAt: runAt ?? null },
    cases: evaluatedCases,
    summary: buildBacktestSummary(evaluatedCases, HISTORICAL_DATASET_PARTITIONS),
    validation: {
      valid: errors.length === 0,
      dataset: datasetValidation,
      errors,
    },
  };
}

export {
  CANONICAL_BACKTEST_RUNNER_MODEL,
  buildCanonicalBacktestRunId,
  runCanonicalBacktest,
};
