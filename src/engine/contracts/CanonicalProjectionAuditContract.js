import {
  addError,
  isRecord,
  isRequiredText,
  isUtcIsoDate,
  validateRequiredText,
} from './contractValidation.js';
import { calculateCanonicalAuditSummary } from './canonicalAuditMetrics.js';
import { validateAuditAgainstProjection } from './canonicalAuditRelationship.js';

const CANONICAL_PROJECTION_AUDIT_SCHEMA_VERSION = 'canonical-projection-audit.v1';
const CANONICAL_SETTLEMENT_STATUSES = Object.freeze(['settled', 'push', 'void', 'partial']);
const CANONICAL_AUDIT_CLASSIFICATIONS = Object.freeze(['hit', 'miss', 'push', 'void', 'partial']);

function buildCanonicalProjectionAuditId({
  projectionId,
  resultSnapshotId,
  evaluatorVersion,
  auditedAt,
} = {}) {
  const parts = [projectionId, resultSnapshotId, evaluatorVersion, auditedAt];

  if (!parts.every(isRequiredText) || !isUtcIsoDate(auditedAt)) {
    return null;
  }

  return ['audit', ...parts.map((part) => encodeURIComponent(part.trim()))].join(':');
}

function validateObservedResult(errors, result) {
  if (!isRecord(result)) {
    addError(errors, 'result', 'required-object', 'result must be an object');
    return;
  }

  validateRequiredText(errors, result.snapshotId, 'result.snapshotId');

  if (!isUtcIsoDate(result.finalizedAt)) {
    addError(errors, 'result.finalizedAt', 'invalid-utc-date', 'finalizedAt must be an ISO UTC date');
  }

  const score = isRecord(result.score) ? result.score : {};

  ['home', 'away'].forEach((side) => {
    if (!Number.isInteger(score[side]) || score[side] < 0) {
      addError(errors, `result.score.${side}`, 'invalid-score', 'final score must be a non-negative integer');
    }
  });
}

function validateOutcomeMetrics(errors, outcome, path) {
  const metrics = isRecord(outcome.metrics) ? outcome.metrics : {};
  const isSettled = outcome.settlement?.status === 'settled';

  if (isSettled) {
    if (!Number.isFinite(metrics.brierScore) || metrics.brierScore < 0 || metrics.brierScore > 1) {
      addError(errors, `${path}.metrics.brierScore`, 'invalid-brier-score', 'Brier Score must stay within 0-1');
    }

    if (!Number.isFinite(metrics.logLoss) || metrics.logLoss < 0) {
      addError(errors, `${path}.metrics.logLoss`, 'invalid-log-loss', 'Log Loss must be zero or greater');
    }
  } else if (metrics.brierScore !== null || metrics.logLoss !== null) {
    addError(errors, `${path}.metrics`, 'excluded-metrics-present', 'excluded settlements cannot expose error metrics');
  }
}

function validateAuditOutcome(errors, outcome, index) {
  const path = `outcomes.${index}`;

  if (!isRecord(outcome)) {
    addError(errors, path, 'required-object', `${path} must be an object`);
    return;
  }

  validateRequiredText(errors, outcome.marketId, `${path}.marketId`);
  validateRequiredText(errors, outcome.predictedSelectionKey, `${path}.predictedSelectionKey`);

  if (!CANONICAL_AUDIT_CLASSIFICATIONS.includes(outcome.classification)) {
    addError(errors, `${path}.classification`, 'unsupported-classification', 'audit classification must be supported');
  }

  const settlement = isRecord(outcome.settlement) ? outcome.settlement : {};
  validateRequiredText(errors, settlement.ruleVersion, `${path}.settlement.ruleVersion`);

  if (!CANONICAL_SETTLEMENT_STATUSES.includes(settlement.status)) {
    addError(errors, `${path}.settlement.status`, 'unsupported-settlement', 'settlement status must be supported');
  }

  if (settlement.status === 'settled') {
    validateRequiredText(errors, settlement.observedSelectionKey, `${path}.settlement.observedSelectionKey`);

    if (!['hit', 'miss'].includes(outcome.classification)) {
      addError(errors, `${path}.classification`, 'classification-mismatch', 'settled markets must be hit or miss');
    }
  } else {
    if (settlement.observedSelectionKey !== null) {
      addError(errors, `${path}.settlement.observedSelectionKey`, 'excluded-observation-present', 'excluded settlements cannot select an outcome');
    }

    if (outcome.classification !== settlement.status) {
      addError(errors, `${path}.classification`, 'classification-mismatch', 'classification must match excluded settlement');
    }
  }

  validateOutcomeMetrics(errors, outcome, path);
}

function validateAuditSummary(errors, summary, outcomes) {
  if (!isRecord(summary)) {
    addError(errors, 'summary', 'required-object', 'summary must be an object');
    return;
  }

  const expected = calculateCanonicalAuditSummary(outcomes);
  const fields = Object.keys(expected);

  fields.forEach((field) => {
    if (summary[field] !== expected[field]) {
      addError(errors, `summary.${field}`, 'summary-mismatch', `${field} must match audited outcomes`);
    }
  });
}

function validateAuditChronology(errors, finalizedAt, auditedAt) {
  if (isUtcIsoDate(finalizedAt)
    && isUtcIsoDate(auditedAt)
    && Date.parse(auditedAt) < Date.parse(finalizedAt)) {
    addError(errors, 'evaluation.auditedAt', 'audit-before-result', 'audit cannot predate the final result');
  }
}

function validateCanonicalProjectionAudit(audit) {
  const errors = [];

  if (!isRecord(audit)) {
    addError(errors, 'audit', 'required-object', 'audit must be an object');
    return {
      schemaVersion: CANONICAL_PROJECTION_AUDIT_SCHEMA_VERSION,
      valid: false,
      errors,
    };
  }

  if (audit.schemaVersion !== CANONICAL_PROJECTION_AUDIT_SCHEMA_VERSION) {
    addError(
      errors,
      'schemaVersion',
      'unsupported-version',
      `schemaVersion must be ${CANONICAL_PROJECTION_AUDIT_SCHEMA_VERSION}`,
    );
  }

  validateRequiredText(errors, audit.matchId, 'matchId');
  validateRequiredText(errors, audit.projectionId, 'projectionId');

  ['odds', 'stake', 'profit', 'roi', 'bookmaker'].forEach((field) => {
    if (Object.hasOwn(audit, field)) {
      addError(errors, field, 'commercial-data-not-allowed', 'scientific audits cannot contain betting returns');
    }
  });

  validateObservedResult(errors, audit.result);

  const evaluation = isRecord(audit.evaluation) ? audit.evaluation : {};
  validateRequiredText(errors, evaluation.version, 'evaluation.version');

  if (!isUtcIsoDate(evaluation.auditedAt)) {
    addError(errors, 'evaluation.auditedAt', 'invalid-utc-date', 'auditedAt must be an ISO UTC date');
  }

  validateAuditChronology(errors, audit.result?.finalizedAt, evaluation.auditedAt);

  const expectedId = buildCanonicalProjectionAuditId({
    projectionId: audit.projectionId,
    resultSnapshotId: audit.result?.snapshotId,
    evaluatorVersion: evaluation.version,
    auditedAt: evaluation.auditedAt,
  });

  if (!expectedId || audit.id !== expectedId) {
    addError(errors, 'id', 'non-idempotent-id', 'id must be derived from projection, result and evaluation');
  }

  if (!Array.isArray(audit.outcomes) || audit.outcomes.length === 0) {
    addError(errors, 'outcomes', 'required-array', 'outcomes must be a non-empty array');
  } else {
    const marketIds = new Set();

    audit.outcomes.forEach((outcome, index) => {
      validateAuditOutcome(errors, outcome, index);

      if (marketIds.has(outcome?.marketId)) {
        addError(errors, `outcomes.${index}.marketId`, 'duplicate-market', 'audited market IDs must be unique');
      }

      marketIds.add(outcome?.marketId);
    });
  }

  validateAuditSummary(errors, audit.summary, audit.outcomes);

  return {
    schemaVersion: CANONICAL_PROJECTION_AUDIT_SCHEMA_VERSION,
    valid: errors.length === 0,
    errors,
  };
}

export {
  CANONICAL_AUDIT_CLASSIFICATIONS,
  CANONICAL_PROJECTION_AUDIT_SCHEMA_VERSION,
  CANONICAL_SETTLEMENT_STATUSES,
  buildCanonicalProjectionAuditId,
  validateAuditAgainstProjection,
  validateCanonicalProjectionAudit,
};
