function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function calculateBalancePenalty(expectedHomeGoals, expectedAwayGoals) {
  const xgGap = Math.abs(expectedHomeGoals - expectedAwayGoals);

  if (xgGap < 0.18) {
    return 12;
  }

  if (xgGap < 0.35) {
    return 8;
  }

  if (xgGap < 0.55) {
    return 4;
  }

  return 0;
}

function calculateReliabilityPenalty(calibration) {
  const reliability = calibration?.reliability ?? 0.65;

  if (reliability < 0.55) {
    return 10;
  }

  if (reliability < 0.68) {
    return 6;
  }

  if (reliability < 0.78) {
    return 3;
  }

  return 0;
}

function calculateContextPenalty(matchInput) {
  let penalty = 0;

  if (matchInput.context.isKnockout) {
    penalty += 4;
  }

  if (matchInput.context.isNeutralVenue) {
    penalty += 2;
  }

  return penalty;
}

function calculateCompetitiveContextPenalty(competitiveContext) {
  return Math.min(10, Math.max(0, competitiveContext?.riskPenalty ?? 0));
}

function calculateProbabilityPenalty(probabilities) {
  const strongestOutcome = Math.max(
    probabilities?.homeWin ?? 0,
    probabilities?.draw ?? 0,
    probabilities?.awayWin ?? 0,
  );

  if (strongestOutcome < 42) {
    return 8;
  }

  if (strongestOutcome < 50) {
    return 5;
  }

  if (strongestOutcome < 58) {
    return 2;
  }

  return 0;
}

function runDuqueScoreCalibrationEngine({
  calibration,
  rawConfidence,
  expectedAwayGoals,
  expectedHomeGoals,
  matchInput,
  competitiveContext,
}) {
  const penalties = {
    balance: calculateBalancePenalty(expectedHomeGoals, expectedAwayGoals),
    context: calculateContextPenalty(matchInput),
    competitiveContext: calculateCompetitiveContextPenalty(competitiveContext),
    probability: calculateProbabilityPenalty(calibration?.probabilities),
    reliability: calculateReliabilityPenalty(calibration),
  };
  const totalPenalty = Object.values(penalties).reduce((sum, value) => sum + value, 0);
  const duqueScore = Math.round(clamp(rawConfidence - totalPenalty, 45, 94));

  return {
    duqueScore,
    model: 'duque-score-calibration-engine-v1',
    penalties,
    rawConfidence,
    totalPenalty,
  };
}

export { runDuqueScoreCalibrationEngine };
