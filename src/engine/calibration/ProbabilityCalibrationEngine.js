const ONE_X_TWO_BASELINE = {
  homeWin: 44,
  draw: 28,
  awayWin: 28,
};

const TOTALS_BASELINE = {
  over25: 52,
  under25: 48,
};

const BTTS_BASELINE = 50;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundPercent(value) {
  return Number(clamp(value, 1, 98).toFixed(1));
}

function blendProbability(projected, baseline, reliability) {
  return (projected * reliability) + (baseline * (1 - reliability));
}

function normalizeGroup(group) {
  const total = Object.values(group).reduce((sum, value) => sum + value, 0);

  return Object.fromEntries(
    Object.entries(group).map(([key, value]) => [key, roundPercent((value / total) * 100)]),
  );
}

function calculateReliability({ dataQualityScore, confidence }) {
  const dataQualityWeight = clamp(dataQualityScore, 0, 100) * 0.45;
  const confidenceWeight = clamp(confidence, 0, 100) * 0.55;

  return Number(clamp((dataQualityWeight + confidenceWeight) / 100, 0.35, 0.92).toFixed(3));
}

function runProbabilityCalibrationEngine({ probabilities, dataQualityScore, confidence }) {
  const reliability = calculateReliability({ dataQualityScore, confidence });
  const calibratedOneXTwo = normalizeGroup({
    homeWin: blendProbability(probabilities.homeWin, ONE_X_TWO_BASELINE.homeWin, reliability),
    draw: blendProbability(probabilities.draw, ONE_X_TWO_BASELINE.draw, reliability),
    awayWin: blendProbability(probabilities.awayWin, ONE_X_TWO_BASELINE.awayWin, reliability),
  });
  const calibratedTotals = normalizeGroup({
    over25: blendProbability(probabilities.over25, TOTALS_BASELINE.over25, reliability),
    under25: blendProbability(probabilities.under25, TOTALS_BASELINE.under25, reliability),
  });

  return {
    model: 'probability-calibration-v1',
    reliability,
    probabilities: {
      ...calibratedOneXTwo,
      ...calibratedTotals,
      btts: roundPercent(blendProbability(probabilities.btts, BTTS_BASELINE, reliability)),
    },
    baselines: {
      oneXTwo: ONE_X_TWO_BASELINE,
      totals: TOTALS_BASELINE,
      btts: BTTS_BASELINE,
    },
    notes: [
      'Calibration blends model output with conservative market baselines.',
      'Higher data quality and confidence preserve more of the Poisson projection.',
    ],
  };
}

export { calculateReliability, runProbabilityCalibrationEngine };
