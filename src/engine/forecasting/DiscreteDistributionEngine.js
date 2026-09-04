function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function logGamma(value) {
  const coefficients = [
    676.5203681218851,
    -1259.1392167224028,
    771.3234287776531,
    -176.6150291621406,
    12.507343278686905,
    -0.13857109526572012,
    9.984369578019572e-6,
    1.5056327351493116e-7,
  ];

  if (value < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * value)) - logGamma(1 - value);
  }

  let adjusted = value - 1;
  let series = 0.9999999999998099;

  coefficients.forEach((coefficient, index) => {
    series += coefficient / (adjusted + index + 1);
  });

  const shifted = adjusted + coefficients.length - 0.5;

  return 0.5 * Math.log(2 * Math.PI)
    + ((adjusted + 0.5) * Math.log(shifted))
    - shifted
    + Math.log(series);
}

function poissonPmf(mean, value) {
  if (value < 0 || !Number.isInteger(value)) {
    return 0;
  }

  const safeMean = Math.max(0.0001, mean);
  return Math.exp((-safeMean) + (value * Math.log(safeMean)) - logGamma(value + 1));
}

function negativeBinomialPmf(mean, variance, value) {
  if (value < 0 || !Number.isInteger(value)) {
    return 0;
  }

  const safeMean = Math.max(0.0001, mean);
  const safeVariance = Math.max(safeMean + 0.0001, variance);
  const shape = (safeMean ** 2) / (safeVariance - safeMean);
  const successProbability = shape / (shape + safeMean);
  const logCombination = logGamma(value + shape) - logGamma(shape) - logGamma(value + 1);
  const logProbability = logCombination
    + (shape * Math.log(successProbability))
    + (value * Math.log(1 - successProbability));

  return Math.exp(logProbability);
}

function inferMaxValue(mean, variance, suppliedMaxValue) {
  if (Number.isFinite(suppliedMaxValue)) {
    return Math.max(5, Math.floor(suppliedMaxValue));
  }

  const standardDeviation = Math.sqrt(Math.max(variance, mean, 1));
  return clamp(Math.ceil(mean + (7 * standardDeviation)), 15, 80);
}

function normalizeProbabilities(probabilities) {
  const total = probabilities.reduce((sum, item) => sum + item.probability, 0);

  if (total <= 0) {
    return probabilities;
  }

  return probabilities.map((item) => ({
    ...item,
    probability: item.probability / total,
  }));
}

function weightedQuantile(probabilities, quantile) {
  let cumulative = 0;

  for (const item of probabilities) {
    cumulative += item.probability;
    if (cumulative >= quantile) {
      return item.value;
    }
  }

  return probabilities.at(-1)?.value ?? 0;
}

function buildCentralInterval(probabilities, mass) {
  const tail = (1 - mass) / 2;

  return {
    low: weightedQuantile(probabilities, tail),
    high: weightedQuantile(probabilities, 1 - tail),
  };
}

function summarizeDistribution(probabilities) {
  const normalized = normalizeProbabilities(probabilities);
  const mean = normalized.reduce((sum, item) => sum + (item.value * item.probability), 0);
  const variance = normalized.reduce((sum, item) => (
    sum + (((item.value - mean) ** 2) * item.probability)
  ), 0);
  const mode = normalized.reduce((best, item) => (
    !best || item.probability > best.probability ? item : best
  ), null);

  return {
    mean: Number(mean.toFixed(3)),
    variance: Number(variance.toFixed(3)),
    standardDeviation: Number(Math.sqrt(variance).toFixed(3)),
    median: weightedQuantile(normalized, 0.5),
    mode: mode?.value ?? 0,
    modeProbability: Number(((mode?.probability ?? 0) * 100).toFixed(2)),
    intervals: {
      p50: buildCentralInterval(normalized, 0.5),
      p80: buildCentralInterval(normalized, 0.8),
      p95: buildCentralInterval(normalized, 0.95),
    },
    topOutcomes: [...normalized]
      .sort((left, right) => right.probability - left.probability)
      .slice(0, 7)
      .map((item) => ({
        value: item.value,
        probability: Number((item.probability * 100).toFixed(2)),
      })),
  };
}

function buildDiscreteDistribution({ mean, variance = mean, maxValue } = {}) {
  const safeMean = Math.max(0.0001, Number(mean) || 0.0001);
  const safeVariance = Math.max(safeMean, Number(variance) || safeMean);
  const family = safeVariance > safeMean * 1.08 ? 'negative-binomial' : 'poisson';
  const upperBound = inferMaxValue(safeMean, safeVariance, maxValue);
  const probabilities = [];

  for (let value = 0; value <= upperBound; value += 1) {
    probabilities.push({
      value,
      probability: family === 'negative-binomial'
        ? negativeBinomialPmf(safeMean, safeVariance, value)
        : poissonPmf(safeMean, value),
    });
  }

  const normalized = normalizeProbabilities(probabilities);

  return {
    family,
    inputs: {
      mean: Number(safeMean.toFixed(3)),
      variance: Number(safeVariance.toFixed(3)),
      maxValue: upperBound,
    },
    probabilities: normalized.map((item) => ({
      value: item.value,
      probability: Number(item.probability.toFixed(8)),
    })),
    summary: summarizeDistribution(normalized),
  };
}

function mixDiscreteDistributions(components) {
  const validComponents = (components || []).filter((component) => (
    component
    && Number.isFinite(component.weight)
    && component.weight > 0
    && Array.isArray(component.distribution?.probabilities)
  ));
  const totalWeight = validComponents.reduce((sum, component) => sum + component.weight, 0);

  if (!validComponents.length || totalWeight <= 0) {
    return null;
  }

  const maxValue = Math.max(...validComponents.map((component) => (
    component.distribution.probabilities.at(-1)?.value ?? 0
  )));
  const probabilityByValue = new Map();

  validComponents.forEach((component) => {
    const normalizedWeight = component.weight / totalWeight;
    component.distribution.probabilities.forEach((item) => {
      probabilityByValue.set(
        item.value,
        (probabilityByValue.get(item.value) || 0) + (item.probability * normalizedWeight),
      );
    });
  });

  const probabilities = [];
  for (let value = 0; value <= maxValue; value += 1) {
    probabilities.push({ value, probability: probabilityByValue.get(value) || 0 });
  }

  const normalized = normalizeProbabilities(probabilities);

  return {
    family: 'scenario-mixture',
    probabilities: normalized.map((item) => ({
      value: item.value,
      probability: Number(item.probability.toFixed(8)),
    })),
    summary: summarizeDistribution(normalized),
  };
}

export {
  buildDiscreteDistribution,
  mixDiscreteDistributions,
  negativeBinomialPmf,
  poissonPmf,
  summarizeDistribution,
};
