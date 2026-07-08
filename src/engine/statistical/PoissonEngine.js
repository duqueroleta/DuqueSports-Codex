const DEFAULT_MAX_GOALS = 7;

function clampLambda(value) {
  if (!Number.isFinite(value)) {
    return 0.01;
  }

  return Math.min(5, Math.max(0.01, value));
}

function factorial(value) {
  if (value <= 1) {
    return 1;
  }

  let result = 1;

  for (let index = 2; index <= value; index += 1) {
    result *= index;
  }

  return result;
}

function poissonProbability(lambda, goals) {
  const safeLambda = clampLambda(lambda);

  return (Math.exp(-safeLambda) * (safeLambda ** goals)) / factorial(goals);
}

function roundPercent(value) {
  return Number((value * 100).toFixed(1));
}

function buildScoreMatrix(homeLambda, awayLambda, maxGoals = DEFAULT_MAX_GOALS) {
  const matrix = [];
  let totalMass = 0;

  for (let homeGoals = 0; homeGoals <= maxGoals; homeGoals += 1) {
    for (let awayGoals = 0; awayGoals <= maxGoals; awayGoals += 1) {
      const probability = poissonProbability(homeLambda, homeGoals) * poissonProbability(awayLambda, awayGoals);

      totalMass += probability;
      matrix.push({
        homeGoals,
        awayGoals,
        probability,
      });
    }
  }

  return matrix.map((scoreline) => ({
    ...scoreline,
    probability: scoreline.probability / totalMass,
  }));
}

function findMostLikelyScore(matrix) {
  return matrix.reduce((bestScore, scoreline) => (
    scoreline.probability > bestScore.probability ? scoreline : bestScore
  ), matrix[0]);
}

function runPoissonEngine({ homeLambda, awayLambda, maxGoals = DEFAULT_MAX_GOALS }) {
  const matrix = buildScoreMatrix(homeLambda, awayLambda, maxGoals);
  const totals = matrix.reduce((accumulator, scoreline) => {
    const totalGoals = scoreline.homeGoals + scoreline.awayGoals;

    if (scoreline.homeGoals > scoreline.awayGoals) {
      accumulator.homeWin += scoreline.probability;
    } else if (scoreline.homeGoals === scoreline.awayGoals) {
      accumulator.draw += scoreline.probability;
    } else {
      accumulator.awayWin += scoreline.probability;
    }

    if (totalGoals > 2.5) {
      accumulator.over25 += scoreline.probability;
    } else {
      accumulator.under25 += scoreline.probability;
    }

    if (scoreline.homeGoals > 0 && scoreline.awayGoals > 0) {
      accumulator.btts += scoreline.probability;
    }

    return accumulator;
  }, {
    homeWin: 0,
    draw: 0,
    awayWin: 0,
    over25: 0,
    under25: 0,
    btts: 0,
  });
  const correctScore = findMostLikelyScore(matrix);

  return {
    model: 'poisson-goals-v1',
    inputs: {
      homeLambda: clampLambda(homeLambda),
      awayLambda: clampLambda(awayLambda),
      maxGoals,
    },
    probabilities: {
      homeWin: roundPercent(totals.homeWin),
      draw: roundPercent(totals.draw),
      awayWin: roundPercent(totals.awayWin),
      over25: roundPercent(totals.over25),
      under25: roundPercent(totals.under25),
      btts: roundPercent(totals.btts),
    },
    correctScore: {
      homeGoals: correctScore.homeGoals,
      awayGoals: correctScore.awayGoals,
      probability: roundPercent(correctScore.probability),
    },
    matrix: matrix.map((scoreline) => ({
      ...scoreline,
      probability: Number(scoreline.probability.toFixed(6)),
    })),
  };
}

export { buildScoreMatrix, poissonProbability, runPoissonEngine };
