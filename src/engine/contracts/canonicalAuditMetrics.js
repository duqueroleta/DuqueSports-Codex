function roundMetric(value) {
  return Number(value.toFixed(6));
}

function getPredictedSelectionKey(prediction) {
  const selections = Array.isArray(prediction?.selections) ? prediction.selections : [];

  if (selections.length === 0) {
    return null;
  }

  return selections.reduce((best, selection) => (
    Number.isFinite(selection?.probability)
      && (!best || selection.probability > best.probability)
      ? selection
      : best
  ), null)?.key ?? null;
}

function calculateBrierScore(selections, observedSelectionKey) {
  if (!Array.isArray(selections) || selections.length === 0) {
    return null;
  }

  const hasObservedSelection = selections.some((selection) => selection?.key === observedSelectionKey);

  if (!hasObservedSelection || selections.some((selection) => !Number.isFinite(selection?.probability))) {
    return null;
  }

  const squaredError = selections.reduce((total, selection) => {
    const probability = selection.probability / 100;
    const observed = selection.key === observedSelectionKey ? 1 : 0;
    return total + ((probability - observed) ** 2);
  }, 0);

  return roundMetric(squaredError / selections.length);
}

function calculateLogLoss(selections, observedSelectionKey) {
  const observedSelection = Array.isArray(selections)
    ? selections.find((selection) => selection?.key === observedSelectionKey)
    : null;

  if (!Number.isFinite(observedSelection?.probability)) {
    return null;
  }

  const probability = Math.min(1, Math.max(observedSelection.probability / 100, 1e-15));
  return roundMetric(-Math.log(probability));
}

function buildCanonicalAuditOutcome(prediction, settlement) {
  const status = settlement?.status;
  const observedSelectionKey = status === 'settled' ? settlement.observedSelectionKey : null;
  const predictedSelectionKey = getPredictedSelectionKey(prediction);
  const isSettled = status === 'settled';

  return {
    marketId: prediction?.marketId ?? null,
    settlement: {
      ruleVersion: settlement?.ruleVersion ?? null,
      status: status ?? null,
      observedSelectionKey,
    },
    predictedSelectionKey,
    classification: isSettled
      ? predictedSelectionKey === observedSelectionKey ? 'hit' : 'miss'
      : status ?? null,
    metrics: {
      brierScore: isSettled
        ? calculateBrierScore(prediction?.selections, observedSelectionKey)
        : null,
      logLoss: isSettled
        ? calculateLogLoss(prediction?.selections, observedSelectionKey)
        : null,
    },
  };
}

function averageMetric(outcomes, key) {
  const values = outcomes
    .map((outcome) => outcome?.metrics?.[key])
    .filter(Number.isFinite);

  if (values.length === 0) {
    return null;
  }

  return roundMetric(values.reduce((total, value) => total + value, 0) / values.length);
}

function calculateCanonicalAuditSummary(outcomes) {
  const normalizedOutcomes = Array.isArray(outcomes) ? outcomes : [];
  const settledOutcomes = normalizedOutcomes.filter((outcome) => outcome?.settlement?.status === 'settled');

  return {
    auditedMarkets: normalizedOutcomes.length,
    settledMarkets: settledOutcomes.length,
    hits: settledOutcomes.filter((outcome) => outcome.classification === 'hit').length,
    misses: settledOutcomes.filter((outcome) => outcome.classification === 'miss').length,
    excludedMarkets: normalizedOutcomes.length - settledOutcomes.length,
    meanBrierScore: averageMetric(settledOutcomes, 'brierScore'),
    meanLogLoss: averageMetric(settledOutcomes, 'logLoss'),
  };
}

export {
  buildCanonicalAuditOutcome,
  calculateBrierScore,
  calculateCanonicalAuditSummary,
  calculateLogLoss,
  getPredictedSelectionKey,
};
