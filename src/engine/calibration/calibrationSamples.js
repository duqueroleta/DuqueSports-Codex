function buildTopPredictionCalibrationSamples(projection, audit) {
  const predictions = Array.isArray(projection?.predictions) ? projection.predictions : [];
  const predictionsByMarket = new Map(predictions.map((prediction) => [prediction.marketId, prediction]));
  const outcomes = Array.isArray(audit?.outcomes) ? audit.outcomes : [];

  return outcomes.flatMap((outcome) => {
    if (outcome?.settlement?.status !== 'settled') {
      return [];
    }

    const prediction = predictionsByMarket.get(outcome.marketId);
    const predictedSelection = prediction?.selections?.find(
      (selection) => selection.key === outcome.predictedSelectionKey,
    );

    if (!Number.isFinite(predictedSelection?.probability)) {
      return [];
    }

    return [{
      marketId: outcome.marketId,
      selectionKey: outcome.predictedSelectionKey,
      probability: predictedSelection.probability,
      observed: outcome.classification === 'hit',
    }];
  });
}

export { buildTopPredictionCalibrationSamples };
