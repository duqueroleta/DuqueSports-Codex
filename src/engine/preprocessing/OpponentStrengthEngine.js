const OPPONENT_STRENGTH_COEFFICIENTS = {
  elite: 1.18,
  strong: 1.08,
  balanced: 1,
  weak: 0.88,
};

function runOpponentStrengthEngine(recencyOutput, opponentTier) {
  const coefficient = OPPONENT_STRENGTH_COEFFICIENTS[opponentTier] || OPPONENT_STRENGTH_COEFFICIENTS.balanced;
  const adjusted = {};

  Object.entries(recencyOutput.metrics).forEach(([metric, value]) => {
    adjusted[metric] = Number((value * coefficient).toFixed(3));
  });

  return {
    teamId: recencyOutput.teamId,
    teamName: recencyOutput.teamName,
    opponentTier,
    coefficient,
    metrics: adjusted,
  };
}

export { OPPONENT_STRENGTH_COEFFICIENTS, runOpponentStrengthEngine };
