import {
  addError,
  isRecord,
  isRequiredText,
  validateRequiredText,
} from './contractValidation.js';

function isPercentage(value) {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

function validateStringArray(errors, value, path, requireItems = false) {
  if (!Array.isArray(value)) {
    addError(errors, path, 'required-array', `${path} must be an array`);
    return;
  }

  if (requireItems && value.length === 0) {
    addError(errors, path, 'required-items', `${path} must not be empty`);
  }

  value.forEach((item, index) => {
    if (!isRequiredText(item)) {
      addError(errors, `${path}.${index}`, 'required-text', `${path} items must be non-empty strings`);
    }
  });
}

function validateProjectionModels(errors, models) {
  if (!isRecord(models)) {
    addError(errors, 'models', 'required-object', 'models must be an object');
    return;
  }

  validateRequiredText(errors, models.statistical, 'models.statistical');
  validateRequiredText(errors, models.calibration, 'models.calibration');
  validateRequiredText(errors, models.explanation, 'models.explanation');
}

function validateCompletedMetrics(errors, metrics) {
  const expectedGoals = isRecord(metrics.expectedGoals) ? metrics.expectedGoals : {};

  if (!Number.isFinite(expectedGoals.home) || expectedGoals.home < 0) {
    addError(errors, 'metrics.expectedGoals.home', 'invalid-expected-goals', 'home expected goals must be non-negative');
  }

  if (!Number.isFinite(expectedGoals.away) || expectedGoals.away < 0) {
    addError(errors, 'metrics.expectedGoals.away', 'invalid-expected-goals', 'away expected goals must be non-negative');
  }

  if (!isPercentage(metrics.confidence)) {
    addError(errors, 'metrics.confidence', 'invalid-percentage', 'confidence must stay within 0-100');
  }

  if (!Number.isFinite(metrics.calibrationReliability)
    || metrics.calibrationReliability < 0
    || metrics.calibrationReliability > 1) {
    addError(
      errors,
      'metrics.calibrationReliability',
      'invalid-reliability',
      'calibrationReliability must stay within 0-1',
    );
  }
}

function validateBlockedMetrics(errors, metrics) {
  const expectedGoals = isRecord(metrics.expectedGoals) ? metrics.expectedGoals : {};

  if (expectedGoals.home !== null || expectedGoals.away !== null) {
    addError(errors, 'metrics.expectedGoals', 'blocked-output-present', 'blocked projections cannot expose expected goals');
  }

  if (metrics.confidence !== null || metrics.calibrationReliability !== null) {
    addError(errors, 'metrics', 'blocked-output-present', 'blocked projections cannot expose confidence or reliability');
  }
}

function validateProjectionMetrics(errors, metrics, status) {
  if (!isRecord(metrics)) {
    addError(errors, 'metrics', 'required-object', 'metrics must be an object');
    return;
  }

  if (!isPercentage(metrics.dataQualityScore)) {
    addError(errors, 'metrics.dataQualityScore', 'invalid-percentage', 'dataQualityScore must stay within 0-100');
  }

  if (status === 'completed') {
    validateCompletedMetrics(errors, metrics);
  } else if (status === 'blocked') {
    validateBlockedMetrics(errors, metrics);
  }
}

function validatePredictionSelections(errors, selections, path) {
  if (!Array.isArray(selections) || selections.length === 0) {
    addError(errors, `${path}.selections`, 'required-array', 'prediction selections must be a non-empty array');
    return;
  }

  const keys = new Set();
  let total = 0;

  selections.forEach((selection, index) => {
    const selectionPath = `${path}.selections.${index}`;

    if (!isRecord(selection)) {
      addError(errors, selectionPath, 'required-object', `${selectionPath} must be an object`);
      return;
    }

    validateRequiredText(errors, selection.key, `${selectionPath}.key`);

    if (Object.hasOwn(selection, 'decimalOdds')) {
      addError(
        errors,
        `${selectionPath}.decimalOdds`,
        'commercial-data-not-allowed',
        'canonical projections cannot contain market prices',
      );
    }

    if (!isPercentage(selection.probability)) {
      addError(
        errors,
        `${selectionPath}.probability`,
        'invalid-percentage',
        'probability must stay within 0-100',
      );
    } else {
      total += selection.probability;
    }

    if (keys.has(selection.key)) {
      addError(errors, `${selectionPath}.key`, 'duplicate-selection', 'prediction selection keys must be unique');
    }

    keys.add(selection.key);
  });

  if (total < 99.8 || total > 100.2) {
    addError(errors, `${path}.selections`, 'probability-sum-mismatch', 'market probabilities must sum to 100');
  }
}

function validateProjectionPredictions(errors, predictions, status) {
  if (!Array.isArray(predictions)) {
    addError(errors, 'predictions', 'required-array', 'predictions must be an array');
    return;
  }

  if (status === 'blocked' && predictions.length > 0) {
    addError(errors, 'predictions', 'blocked-output-present', 'blocked projections cannot expose predictions');
  }

  if (status === 'completed' && predictions.length === 0) {
    addError(errors, 'predictions', 'required-items', 'completed projections require predictions');
  }

  const marketIds = new Set();

  predictions.forEach((prediction, index) => {
    const path = `predictions.${index}`;

    if (!isRecord(prediction)) {
      addError(errors, path, 'required-object', `${path} must be an object`);
      return;
    }

    validateRequiredText(errors, prediction.marketId, `${path}.marketId`);

    if (marketIds.has(prediction.marketId)) {
      addError(errors, `${path}.marketId`, 'duplicate-market', 'prediction market IDs must be unique');
    }

    marketIds.add(prediction.marketId);
    validatePredictionSelections(errors, prediction.selections, path);
  });
}

function validateProjectionEvidence(errors, evidence, status) {
  if (!isRecord(evidence)) {
    addError(errors, 'evidence', 'required-object', 'evidence must be an object');
    return;
  }

  if (status === 'completed') {
    validateRequiredText(errors, evidence.featureSnapshotId, 'evidence.featureSnapshotId');
  } else if (evidence.featureSnapshotId !== null) {
    addError(errors, 'evidence.featureSnapshotId', 'blocked-output-present', 'blocked projections cannot reference features');
  }

  validateStringArray(errors, evidence.keyDrivers, 'evidence.keyDrivers', status === 'completed');
  validateStringArray(errors, evidence.riskFlags, 'evidence.riskFlags');
  validateStringArray(errors, evidence.blockReasons, 'evidence.blockReasons', status === 'blocked');

  if (status === 'completed' && Array.isArray(evidence.blockReasons) && evidence.blockReasons.length > 0) {
    addError(errors, 'evidence.blockReasons', 'unexpected-block-reason', 'completed projections cannot have block reasons');
  }
}

export {
  validateProjectionEvidence,
  validateProjectionMetrics,
  validateProjectionModels,
  validateProjectionPredictions,
};
