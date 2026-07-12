import {
  addError,
  isRecord,
  isRequiredText,
  isUtcIsoDate,
  validateRequiredText,
} from './contractValidation.js';
import {
  validateProjectionEvidence,
  validateProjectionMetrics,
  validateProjectionModels,
  validateProjectionPredictions,
} from './canonicalProjectionValidation.js';

const CANONICAL_PROJECTION_SCHEMA_VERSION = 'canonical-projection.v1';
const CANONICAL_PROJECTION_STATUSES = Object.freeze(['completed', 'blocked']);

function buildCanonicalProjectionId({
  matchId,
  inputSnapshotId,
  engineVersion,
  generatedAt,
} = {}) {
  const parts = [matchId, inputSnapshotId, engineVersion, generatedAt];

  if (!parts.every(isRequiredText) || !isUtcIsoDate(generatedAt)) {
    return null;
  }

  return ['projection', ...parts.map((part) => encodeURIComponent(part.trim()))].join(':');
}

function validateProjectionChronology(errors, cutoffAt, generatedAt) {
  if (isUtcIsoDate(cutoffAt)
    && isUtcIsoDate(generatedAt)
    && Date.parse(generatedAt) < Date.parse(cutoffAt)) {
    addError(errors, 'execution.generatedAt', 'generated-before-cutoff', 'projection cannot predate its data cutoff');
  }
}

function validateCanonicalProjection(projection) {
  const errors = [];

  if (!isRecord(projection)) {
    addError(errors, 'projection', 'required-object', 'projection must be an object');
    return {
      schemaVersion: CANONICAL_PROJECTION_SCHEMA_VERSION,
      valid: false,
      errors,
    };
  }

  if (projection.schemaVersion !== CANONICAL_PROJECTION_SCHEMA_VERSION) {
    addError(
      errors,
      'schemaVersion',
      'unsupported-version',
      `schemaVersion must be ${CANONICAL_PROJECTION_SCHEMA_VERSION}`,
    );
  }

  validateRequiredText(errors, projection.matchId, 'matchId');

  if (!CANONICAL_PROJECTION_STATUSES.includes(projection.status)) {
    addError(errors, 'status', 'unsupported-projection-status', 'projection status must be supported');
  }

  ['odds', 'oddsSnapshotId', 'bookmaker'].forEach((field) => {
    if (Object.hasOwn(projection, field)) {
      addError(
        errors,
        field,
        'commercial-data-not-allowed',
        'canonical projections cannot contain bookmaker or odds data',
      );
    }
  });

  const input = isRecord(projection.input) ? projection.input : {};
  validateRequiredText(errors, input.snapshotId, 'input.snapshotId');

  if (!isUtcIsoDate(input.dataCutoffAt)) {
    addError(errors, 'input.dataCutoffAt', 'invalid-utc-date', 'dataCutoffAt must be an ISO UTC date');
  }

  const execution = isRecord(projection.execution) ? projection.execution : {};
  validateRequiredText(errors, execution.engineVersion, 'execution.engineVersion');

  if (!isUtcIsoDate(execution.generatedAt)) {
    addError(errors, 'execution.generatedAt', 'invalid-utc-date', 'generatedAt must be an ISO UTC date');
  }

  validateProjectionChronology(errors, input.dataCutoffAt, execution.generatedAt);

  const expectedId = buildCanonicalProjectionId({
    matchId: projection.matchId,
    inputSnapshotId: input.snapshotId,
    engineVersion: execution.engineVersion,
    generatedAt: execution.generatedAt,
  });

  if (!expectedId || projection.id !== expectedId) {
    addError(errors, 'id', 'non-idempotent-id', 'id must be derived from match, input, Engine and execution time');
  }

  validateProjectionModels(errors, projection.models);
  validateProjectionMetrics(errors, projection.metrics, projection.status);
  validateProjectionPredictions(errors, projection.predictions, projection.status);
  validateProjectionEvidence(errors, projection.evidence, projection.status);

  return {
    schemaVersion: CANONICAL_PROJECTION_SCHEMA_VERSION,
    valid: errors.length === 0,
    errors,
  };
}

function validateProjectionAgainstMarkets(projection, markets) {
  const errors = [];

  if (!isRecord(projection) || !Array.isArray(markets) || markets.length === 0) {
    addError(errors, 'relationship', 'required-contracts', 'projection and canonical markets are required');
    return { valid: false, errors };
  }

  const predictions = Array.isArray(projection.predictions) ? projection.predictions : [];
  const marketsById = new Map();

  markets.forEach((market, index) => {
    if (!isRecord(market) || !isRequiredText(market.id)) {
      addError(errors, `markets.${index}`, 'invalid-market', 'canonical market must expose an ID');
      return;
    }

    if (marketsById.has(market.id)) {
      addError(errors, `markets.${index}.id`, 'duplicate-market', 'canonical market IDs must be unique');
    }

    marketsById.set(market.id, market);
  });

  if (predictions.length !== markets.length) {
    addError(errors, 'predictions', 'market-count-mismatch', 'projection must cover the supplied markets exactly');
  }

  predictions.forEach((prediction, index) => {
    const market = marketsById.get(prediction?.marketId);

    if (!market) {
      addError(errors, `predictions.${index}.marketId`, 'market-not-found', 'prediction must reference a supplied market');
      return;
    }

    if (market.matchId !== projection.matchId) {
      addError(errors, `predictions.${index}.marketId`, 'match-mismatch', 'prediction market must belong to the same match');
    }

    const marketSelections = Array.isArray(market.selections) ? market.selections : [];
    const predictionSelections = Array.isArray(prediction.selections) ? prediction.selections : [];

    if (marketSelections.length === 0
      || predictionSelections.length === 0
      || marketSelections.some((selection) => !isRecord(selection) || !isRequiredText(selection.key))
      || predictionSelections.some((selection) => !isRecord(selection) || !isRequiredText(selection.key))) {
      addError(
        errors,
        `predictions.${index}.selections`,
        'invalid-selections',
        'market and prediction selections must expose canonical keys',
      );
    }

    const marketKeys = new Set(marketSelections.map((selection) => selection?.key));
    const predictionKeys = new Set(predictionSelections.map((selection) => selection?.key));
    const hasSameSelections = marketKeys.size === predictionKeys.size
      && [...marketKeys].every((key) => predictionKeys.has(key));

    if (!hasSameSelections) {
      addError(
        errors,
        `predictions.${index}.selections`,
        'selection-set-mismatch',
        'prediction selections must match the canonical market',
      );
    }
  });

  return { valid: errors.length === 0, errors };
}

export {
  CANONICAL_PROJECTION_SCHEMA_VERSION,
  CANONICAL_PROJECTION_STATUSES,
  buildCanonicalProjectionId,
  validateCanonicalProjection,
  validateProjectionAgainstMarkets,
};
