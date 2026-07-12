function normalizeMatchMetrics(metrics) {
  if (!Array.isArray(metrics)) {
    return [];
  }

  const normalizedKeys = new Set();

  return metrics.reduce((normalized, metric) => {
    const value = typeof metric === 'string' ? metric.trim() : '';
    const key = value.toLocaleLowerCase('pt-BR');

    if (!value || normalizedKeys.has(key)) {
      return normalized;
    }

    normalizedKeys.add(key);
    normalized.push(value);
    return normalized;
  }, []);
}

export { normalizeMatchMetrics };
