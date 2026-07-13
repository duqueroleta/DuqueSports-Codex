import {
  CANONICAL_PROJECTION_AUDIT_SCHEMA_VERSION,
  buildCanonicalProjectionAuditId,
  validateAuditAgainstProjection,
  validateCanonicalProjectionAudit,
} from '../contracts/CanonicalProjectionAuditContract.js';
import {
  buildCanonicalAuditOutcome,
  calculateCanonicalAuditSummary,
} from '../contracts/canonicalAuditMetrics.js';
import { settleCanonicalMarket } from './CanonicalMarketSettlementService.js';

const CANONICAL_PROJECTION_AUDIT_SERVICE_MODEL = 'canonical-projection-audit-service-v1';

function serviceError(path, code, message) {
  return { path, code, message };
}

function createCanonicalProjectionAudit({
  projection,
  markets,
  result,
  evaluatorVersion,
  auditedAt,
} = {}) {
  if (projection?.status !== 'completed') {
    const errors = [serviceError(
      'projection',
      'projection-not-auditable',
      'Only completed projections can generate an audit.',
    )];

    return {
      model: CANONICAL_PROJECTION_AUDIT_SERVICE_MODEL,
      audit: null,
      settlements: [],
      validation: { valid: false, errors },
    };
  }

  const marketList = Array.isArray(markets) ? markets : [];
  const marketsById = new Map(marketList.map((market) => [market?.id, market]));
  const predictions = Array.isArray(projection.predictions) ? projection.predictions : [];
  const serviceErrors = [];
  const settlements = predictions.map((prediction, index) => {
    const market = marketsById.get(prediction?.marketId);

    if (!market) {
      serviceErrors.push(serviceError(
        `projection.predictions.${index}.marketId`,
        'market-not-found',
        'Projected market must be supplied for settlement.',
      ));
    }

    return {
      marketId: prediction?.marketId ?? null,
      ...settleCanonicalMarket(market, result),
    };
  });
  const outcomes = predictions.map((prediction, index) => (
    buildCanonicalAuditOutcome(prediction, settlements[index])
  ));
  const audit = {
    schemaVersion: CANONICAL_PROJECTION_AUDIT_SCHEMA_VERSION,
    id: buildCanonicalProjectionAuditId({
      projectionId: projection.id,
      resultSnapshotId: result?.snapshotId,
      evaluatorVersion,
      auditedAt,
    }),
    matchId: projection.matchId,
    projectionId: projection.id,
    result: result ?? null,
    evaluation: {
      version: evaluatorVersion ?? null,
      auditedAt: auditedAt ?? null,
    },
    outcomes,
    summary: calculateCanonicalAuditSummary(outcomes),
  };
  const auditValidation = validateCanonicalProjectionAudit(audit);
  const relationshipValidation = validateAuditAgainstProjection(audit, projection);
  const errors = [
    ...serviceErrors,
    ...auditValidation.errors,
    ...relationshipValidation.errors,
  ];

  return {
    model: CANONICAL_PROJECTION_AUDIT_SERVICE_MODEL,
    audit,
    settlements,
    validation: {
      valid: errors.length === 0,
      audit: auditValidation,
      relationship: relationshipValidation,
      errors,
    },
  };
}

export {
  CANONICAL_PROJECTION_AUDIT_SERVICE_MODEL,
  createCanonicalProjectionAudit,
};
