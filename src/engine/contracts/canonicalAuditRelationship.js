import {
  addError,
  isRecord,
  isUtcIsoDate,
} from './contractValidation.js';
import { buildCanonicalAuditOutcome } from './canonicalAuditMetrics.js';

function metricsMatch(actual, expected) {
  if (actual === null || expected === null) {
    return actual === expected;
  }

  return Number.isFinite(actual) && Math.abs(actual - expected) <= 0.000001;
}

function validateAuditAgainstProjection(audit, projection) {
  const errors = [];

  if (!isRecord(audit) || !isRecord(projection)) {
    addError(errors, 'relationship', 'required-contracts', 'audit and projection are required');
    return { valid: false, errors };
  }

  if (projection.status !== 'completed') {
    addError(errors, 'projectionId', 'projection-not-auditable', 'only completed projections can be audited');
  }

  if (audit.projectionId !== projection.id) {
    addError(errors, 'projectionId', 'projection-mismatch', 'audit must reference the canonical projection');
  }

  if (audit.matchId !== projection.matchId) {
    addError(errors, 'matchId', 'match-mismatch', 'audit and projection must reference the same match');
  }

  if (isUtcIsoDate(audit.evaluation?.auditedAt)
    && isUtcIsoDate(projection.execution?.generatedAt)
    && Date.parse(audit.evaluation.auditedAt) < Date.parse(projection.execution.generatedAt)) {
    addError(errors, 'evaluation.auditedAt', 'audit-before-projection', 'audit cannot predate the projection');
  }

  const predictions = Array.isArray(projection.predictions) ? projection.predictions : [];
  const outcomes = Array.isArray(audit.outcomes) ? audit.outcomes : [];
  const predictionsByMarket = new Map(predictions.map((prediction) => [prediction?.marketId, prediction]));

  if (outcomes.length !== predictions.length) {
    addError(errors, 'outcomes', 'market-count-mismatch', 'audit must cover every projected market');
  }

  outcomes.forEach((outcome, index) => {
    const prediction = predictionsByMarket.get(outcome?.marketId);

    if (!prediction) {
      addError(errors, `outcomes.${index}.marketId`, 'prediction-not-found', 'audit market must exist in projection');
      return;
    }

    const expected = buildCanonicalAuditOutcome(prediction, outcome?.settlement);

    if (outcome?.predictedSelectionKey !== expected.predictedSelectionKey) {
      addError(errors, `outcomes.${index}.predictedSelectionKey`, 'predicted-selection-mismatch', 'predicted selection must match projection');
    }

    const predictionSelections = Array.isArray(prediction.selections) ? prediction.selections : [];

    if (outcome?.settlement?.status === 'settled'
      && !predictionSelections.some((selection) => selection?.key === outcome.settlement.observedSelectionKey)) {
      addError(errors, `outcomes.${index}.settlement.observedSelectionKey`, 'observation-not-found', 'observed selection must exist in projection');
    }

    if (outcome?.classification !== expected.classification) {
      addError(errors, `outcomes.${index}.classification`, 'classification-mismatch', 'classification must match prediction and result');
    }

    if (!metricsMatch(outcome?.metrics?.brierScore, expected.metrics.brierScore)) {
      addError(errors, `outcomes.${index}.metrics.brierScore`, 'metric-mismatch', 'Brier Score must be reproducible');
    }

    if (!metricsMatch(outcome?.metrics?.logLoss, expected.metrics.logLoss)) {
      addError(errors, `outcomes.${index}.metrics.logLoss`, 'metric-mismatch', 'Log Loss must be reproducible');
    }
  });

  return { valid: errors.length === 0, errors };
}

export { validateAuditAgainstProjection };
