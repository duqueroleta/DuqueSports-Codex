function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getRiskPenalty(riskFlags) {
  const structuralRiskCount = riskFlags.filter((flag) => !flag.startsWith('Nenhum risco')).length;

  return structuralRiskCount * 6;
}

function getOpportunityTier(score) {
  if (score >= 82) {
    return 'Elite';
  }

  if (score >= 70) {
    return 'Forte';
  }

  if (score >= 58) {
    return 'Moderada';
  }

  return 'Observacao';
}

function runOpportunityRankingEngine({
  dataQualityScore,
  confidence,
  calibration,
  aiExplanation,
}) {
  const marketProbability = aiExplanation.recommendedMarket.probability;
  const reliabilityScore = calibration.reliability * 100;
  const riskPenalty = getRiskPenalty(aiExplanation.riskFlags);
  const rawScore = (marketProbability * 0.38)
    + (confidence * 0.28)
    + (dataQualityScore * 0.2)
    + (reliabilityScore * 0.14)
    - riskPenalty;
  const opportunityScore = Math.round(clamp(rawScore, 0, 100));

  return {
    model: 'opportunity-ranking-v1',
    opportunityScore,
    tier: getOpportunityTier(opportunityScore),
    rankSignal: `${getOpportunityTier(opportunityScore)} ${opportunityScore}/100`,
    components: {
      marketProbability,
      confidence,
      dataQualityScore,
      reliabilityScore: Math.round(reliabilityScore),
      riskPenalty,
    },
  };
}

export { runOpportunityRankingEngine };
