const RECENCY_WEIGHTS = [1, 0.85, 0.7, 0.55, 0.4];

function weightedAverage(values) {
  const totalWeight = values.reduce((total, item) => total + item.weight, 0);
  const weightedSum = values.reduce((total, item) => total + (item.value * item.weight), 0);

  return Number((weightedSum / totalWeight).toFixed(3));
}

function runRecencyEngine(team) {
  const sample = team.recentMatches.slice(0, RECENCY_WEIGHTS.length);
  const fields = ['xg', 'xgot', 'shots', 'shotsOnTarget', 'goals'];
  const metrics = {};

  fields.forEach((field) => {
    metrics[field] = weightedAverage(sample.map((match, index) => ({
      value: match[field],
      weight: RECENCY_WEIGHTS[index],
    })));
  });

  return {
    teamId: team.id,
    teamName: team.name,
    sampleSize: sample.length,
    weights: RECENCY_WEIGHTS.slice(0, sample.length),
    metrics,
  };
}

export { RECENCY_WEIGHTS, runRecencyEngine };
