function hashSeed(value) {
  const text = String(value ?? 'duque');
  let hash = 2166136261;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createSeededRandom(seedValue) {
  let state = hashSeed(seedValue) || 1;

  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function quantile(sortedValues, probability) {
  if (!sortedValues.length) {
    return 0;
  }

  const index = Math.min(sortedValues.length - 1, Math.floor(probability * sortedValues.length));
  return sortedValues[index];
}

function sampleDistribution(probabilities, random) {
  const draw = random();
  let cumulative = 0;

  for (const item of probabilities) {
    cumulative += item.probability;
    if (draw <= cumulative) {
      return item.value;
    }
  }

  return probabilities.at(-1)?.value ?? 0;
}

function runMonteCarloForecast({ distribution, iterations = 10000, seed = 'duque' } = {}) {
  const probabilities = distribution?.probabilities;

  if (!Array.isArray(probabilities) || !probabilities.length) {
    return null;
  }

  const safeIterations = Math.max(1000, Math.min(50000, Math.floor(iterations)));
  const random = createSeededRandom(seed);
  const samples = [];
  const frequencies = new Map();
  let sum = 0;

  for (let index = 0; index < safeIterations; index += 1) {
    const value = sampleDistribution(probabilities, random);
    samples.push(value);
    sum += value;
    frequencies.set(value, (frequencies.get(value) || 0) + 1);
  }

  samples.sort((left, right) => left - right);
  const mode = [...frequencies.entries()].reduce((best, entry) => (
    !best || entry[1] > best[1] ? entry : best
  ), null);

  return {
    model: 'monte-carlo-forecast-v1',
    iterations: safeIterations,
    seed: String(seed),
    mean: Number((sum / safeIterations).toFixed(3)),
    median: quantile(samples, 0.5),
    mode: mode?.[0] ?? 0,
    interval80: {
      low: quantile(samples, 0.1),
      high: quantile(samples, 0.9),
    },
    modeFrequency: Number((((mode?.[1] ?? 0) / safeIterations) * 100).toFixed(2)),
  };
}

export { runMonteCarloForecast };
