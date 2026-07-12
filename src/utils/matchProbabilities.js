const MIN_PROBABILITY = 0;
const MAX_PROBABILITY = 100;

function normalizeProbabilityValue(value) {
  if (!['number', 'string'].includes(typeof value)) {
    return null;
  }

  if (typeof value === 'string' && !value.trim()) {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return Math.min(MAX_PROBABILITY, Math.max(MIN_PROBABILITY, numericValue));
}

function normalizeMatchProbabilities(probabilities) {
  if (!Array.isArray(probabilities)) {
    return [];
  }

  const labels = new Set();

  return probabilities.reduce((normalized, probability) => {
    const label = typeof probability?.label === 'string' ? probability.label.trim() : '';
    const value = normalizeProbabilityValue(probability?.value);

    if (!label || value === null || labels.has(label)) {
      return normalized;
    }

    labels.add(label);
    normalized.push({ label, value });
    return normalized;
  }, []);
}

export { normalizeMatchProbabilities, normalizeProbabilityValue };
