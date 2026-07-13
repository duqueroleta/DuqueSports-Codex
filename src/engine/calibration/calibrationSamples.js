function buildTopPredictionCalibrationSamples(projection, audit, markets) {
  const predictions = Array.isArray(projection?.predictions) ? projection.predictions : [];
  const predictionsByMarket = new Map(predictions.map((prediction) => [prediction.marketId, prediction]));
  const marketsById = new Map(
    (Array.isArray(markets) ? markets : []).map((market) => [market.id, market]),
  );
  const outcomes = Array.isArray(audit?.outcomes) ? audit.outcomes : [];

  return outcomes.flatMap((outcome) => {
    if (outcome?.settlement?.status !== 'settled') {
      return [];
    }

    const prediction = predictionsByMarket.get(outcome.marketId);
    const market = marketsById.get(outcome.marketId);
    const predictedSelection = prediction?.selections?.find(
      (selection) => selection.key === outcome.predictedSelectionKey,
    );

    if (!Number.isFinite(predictedSelection?.probability) || typeof market?.type !== 'string') {
      return [];
    }

    return [{
      marketId: outcome.marketId,
      marketType: market.type,
      selectionKey: outcome.predictedSelectionKey,
      probability: predictedSelection.probability,
      observed: outcome.classification === 'hit',
    }];
  });
}

export { buildTopPredictionCalibrationSamples };
