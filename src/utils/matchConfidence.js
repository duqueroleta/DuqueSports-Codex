const MIN_CONFIDENCE = 0;
const MAX_CONFIDENCE = 100;

function normalizeMatchConfidence(value) {
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

  return Math.min(MAX_CONFIDENCE, Math.max(MIN_CONFIDENCE, numericValue));
}

function formatMatchConfidence(value) {
  const confidence = normalizeMatchConfidence(value);
  return confidence === null ? '--' : `${confidence}%`;
}

function getMatchConfidenceLabel(value) {
  const confidence = normalizeMatchConfidence(value);

  if (confidence === null) {
    return 'Confiança indisponível';
  }

  return confidence >= 80 ? 'Confiança alta' : 'Confiança moderada';
}

function calculateAverageMatchConfidence(matches) {
  if (!Array.isArray(matches)) {
    return null;
  }

  const values = matches
    .map((match) => normalizeMatchConfidence(match?.confidence))
    .filter((confidence) => confidence !== null);

  if (!values.length) {
    return null;
  }

  return Math.round(values.reduce((total, confidence) => total + confidence, 0) / values.length);
}

export {
  calculateAverageMatchConfidence,
  formatMatchConfidence,
  getMatchConfidenceLabel,
  normalizeMatchConfidence,
};
