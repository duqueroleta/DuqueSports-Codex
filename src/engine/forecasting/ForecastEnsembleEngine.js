function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function runForecastEnsemble({ forecasts } = {}) {
  const validForecasts = (forecasts || []).filter((forecast) => (
    forecast
    && Number.isFinite(forecast.mean)
    && forecast.mean >= 0
    && Number.isFinite(forecast.weight ?? 1)
    && (forecast.weight ?? 1) > 0
  ));

  if (!validForecasts.length) {
    return null;
  }

  const weighted = validForecasts.map((forecast) => {
    const reliability = clamp(Number(forecast.reliability ?? 1), 0.1, 1);
    const effectiveWeight = (forecast.weight ?? 1) * reliability;

    return { ...forecast, reliability, effectiveWeight };
  });
  const totalWeight = weighted.reduce((sum, forecast) => sum + forecast.effectiveWeight, 0);
  const mean = weighted.reduce((sum, forecast) => (
    sum + (forecast.mean * forecast.effectiveWeight)
  ), 0) / totalWeight;
  const betweenModelVariance = weighted.reduce((sum, forecast) => (
    sum + (((forecast.mean - mean) ** 2) * forecast.effectiveWeight)
  ), 0) / totalWeight;
  const withinModelVariance = weighted.reduce((sum, forecast) => {
    const variance = Number.isFinite(forecast.variance) ? Math.max(0, forecast.variance) : 0;
    return sum + (variance * forecast.effectiveWeight);
  }, 0) / totalWeight;
  const totalVariance = withinModelVariance + betweenModelVariance;
  const disagreementRatio = Math.sqrt(betweenModelVariance) / Math.max(mean, 1);
  const consensusIndex = Math.round(clamp(100 - (disagreementRatio * 260), 0, 100));

  return {
    model: 'forecast-ensemble-v1',
    mean: Number(mean.toFixed(3)),
    variance: Number(totalVariance.toFixed(3)),
    betweenModelVariance: Number(betweenModelVariance.toFixed(3)),
    withinModelVariance: Number(withinModelVariance.toFixed(3)),
    consensusIndex,
    consensusMeaning: 'model-agreement-not-hit-probability',
    components: weighted.map((forecast) => ({
      id: forecast.id,
      mean: Number(forecast.mean.toFixed(3)),
      variance: Number((forecast.variance ?? 0).toFixed(3)),
      reliability: Number(forecast.reliability.toFixed(3)),
      normalizedWeight: Number((forecast.effectiveWeight / totalWeight).toFixed(4)),
    })),
  };
}

export { runForecastEnsemble };
