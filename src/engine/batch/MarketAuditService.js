function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getStabilityTier(stabilityScore) {
  if (stabilityScore >= 82) {
    return 'Alta';
  }

  if (stabilityScore >= 68) {
    return 'Controlada';
  }

  if (stabilityScore >= 54) {
    return 'Volatil';
  }

  return 'Instavel';
}

function calculateVolatility(relatedOpportunities) {
  if (relatedOpportunities.length <= 1) {
    return 38;
  }

  const scores = relatedOpportunities.map((opportunity) => opportunity.opportunityScore);
  const averageScore = scores.reduce((total, score) => total + score, 0) / scores.length;
  const averageDeviation = scores.reduce((total, score) => total + Math.abs(score - averageScore), 0) / scores.length;

  return Math.round(clamp(averageDeviation * 3.2, 8, 52));
}

function runMarketAuditService({ market, relatedOpportunities }) {
  const sampleSize = Math.max(12, relatedOpportunities.length * 6);
  const baseStrength = market.strength ?? 70;
  const opportunitySignal = relatedOpportunities.length
    ? relatedOpportunities.reduce((total, item) => total + item.opportunityScore, 0) / relatedOpportunities.length
    : baseStrength - 10;
  const volatility = calculateVolatility(relatedOpportunities);
  const hitRate = Math.round(clamp((baseStrength * 0.46) + (opportunitySignal * 0.42) - (volatility * 0.18), 42, 88));
  const stabilityScore = Math.round(clamp(100 - volatility + (sampleSize * 0.35), 35, 94));

  return {
    model: 'market-audit-service-v1',
    sampleSize,
    hitRate,
    volatility,
    stabilityScore,
    stabilityTier: getStabilityTier(stabilityScore),
    auditLabel: `${hitRate}% acerto simulado - ${getStabilityTier(stabilityScore)} estabilidade`,
    notes: [
      'Auditoria simulada com base em forca do mercado, score das oportunidades e dispersao do batch.',
      'Resultado preparado para substituicao futura por backtesting historico real.',
    ],
  };
}

export { runMarketAuditService };
