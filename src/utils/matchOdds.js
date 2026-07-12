const MIN_DECIMAL_ODDS = 1;

function normalizeMatchOdds(value) {
  if (!['number', 'string'].includes(typeof value)) {
    return null;
  }

  if (typeof value === 'string' && !value.trim()) {
    return null;
  }

  const normalizedValue = typeof value === 'string' ? value.trim().replace(',', '.') : value;
  const numericValue = Number(normalizedValue);

  if (!Number.isFinite(numericValue) || numericValue <= MIN_DECIMAL_ODDS) {
    return null;
  }

  return numericValue;
}

function formatMatchOdds(value) {
  const odds = normalizeMatchOdds(value);
  return odds === null ? '--' : odds.toFixed(2);
}

export { formatMatchOdds, normalizeMatchOdds };
