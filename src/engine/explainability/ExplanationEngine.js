function formatPercent(value) {
  return `${Number(value).toFixed(1)}%`;
}

function formatGoals(value) {
  return Number(value).toFixed(2);
}

function selectRecommendedMarket({ probabilities, homeTeamName, awayTeamName }) {
  const candidates = [
    { market: `${homeTeamName} vence`, probability: probabilities.homeWin },
    { market: 'Empate', probability: probabilities.draw },
    { market: `${awayTeamName} vence`, probability: probabilities.awayWin },
    { market: 'Over 2.5 gols', probability: probabilities.over25 },
    { market: 'Ambas marcam', probability: probabilities.btts },
  ];

  return candidates.reduce((bestMarket, candidate) => (
    candidate.probability > bestMarket.probability ? candidate : bestMarket
  ), candidates[0]);
}

function buildRiskFlags({ calibration, matchInput, expectedHomeGoals, expectedAwayGoals }) {
  const flags = [];
  const goalGap = Math.abs(expectedHomeGoals - expectedAwayGoals);

  if (calibration.reliability < 0.7) {
    flags.push('Confiabilidade moderada: modelo reduziu agressividade da projecao final.');
  }

  if (goalGap < 0.35) {
    flags.push('Equilibrio alto entre os xGs reduz vantagem clara em 1X2.');
  }

  if (matchInput.context.isKnockout) {
    flags.push('Contexto eliminatorio reduz expectativa de gols e aumenta cautela.');
  }

  return flags.length > 0 ? flags : ['Nenhum risco estrutural critico detectado no input atual.'];
}

function runExplanationEngine({
  matchInput,
  expectedHomeGoals,
  expectedAwayGoals,
  probabilities,
  dataQuality,
  featureStore,
  poisson,
  calibration,
}) {
  const recommendedMarket = selectRecommendedMarket({
    probabilities,
    homeTeamName: matchInput.homeTeam.name,
    awayTeamName: matchInput.awayTeam.name,
  });
  const xgDifferential = featureStore.features.match.find((feature) => feature.featureId === 'xg_differential')?.value ?? 0;

  return {
    model: 'explanation-engine-v1',
    headline: `${recommendedMarket.market} com ${formatPercent(recommendedMarket.probability)} de leitura calibrada`,
    verdict: `A IA prioriza ${recommendedMarket.market} porque o pipeline combina xG ajustado, forma recente, matriz de placares e calibracao de confiabilidade.`,
    recommendedMarket,
    keyDrivers: [
      `${matchInput.homeTeam.name}: ${formatGoals(expectedHomeGoals)} xG esperado apos ajustes de contexto.`,
      `${matchInput.awayTeam.name}: ${formatGoals(expectedAwayGoals)} xG esperado apos ajustes de contexto.`,
      `Diferencial de xG registrado no Feature Store: ${formatGoals(xgDifferential)}.`,
      `Placar modal do Poisson: ${poisson.correctScore.homeGoals}-${poisson.correctScore.awayGoals}.`,
      `Data Quality aprovado com score ${dataQuality.score}.`,
    ],
    riskFlags: buildRiskFlags({
      calibration,
      matchInput,
      expectedHomeGoals,
      expectedAwayGoals,
    }),
    confidenceNarrative: `Reliability da calibracao em ${Math.round(calibration.reliability * 100)}%, mantendo a projecao estatistica dentro de uma faixa conservadora.`,
  };
}

export { runExplanationEngine };
