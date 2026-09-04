import { buildDiscreteDistribution, mixDiscreteDistributions } from './DiscreteDistributionEngine.js';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeResultProbabilities(probabilities = {}) {
  const homeWin = clamp((Number(probabilities.homeWin) || 0) / 100, 0, 1);
  const draw = clamp((Number(probabilities.draw) || 0) / 100, 0, 1);
  const awayWin = clamp((Number(probabilities.awayWin) || 0) / 100, 0, 1);
  const total = homeWin + draw + awayWin;

  if (total <= 0) {
    return { homeWin: 0.34, draw: 0.32, awayWin: 0.34 };
  }

  return {
    homeWin: homeWin / total,
    draw: draw / total,
    awayWin: awayWin / total,
  };
}

function buildScenarioWeights({ competitiveContext, probabilities }) {
  const normalized = normalizeResultProbabilities(probabilities);
  const neutralBase = competitiveContext?.family?.includes('cup') || competitiveContext?.riskPenalty >= 4
    ? 0.58
    : 0.52;
  const activeMass = 1 - neutralBase;
  const directionalTotal = normalized.homeWin + normalized.awayWin || 1;

  return {
    neutral: neutralBase,
    homePressure: activeMass * (normalized.awayWin / directionalTotal),
    awayPressure: activeMass * (normalized.homeWin / directionalTotal),
  };
}

function getMetricFactors(metric) {
  const profiles = {
    shots: { attacking: 1.13, defending: 0.93 },
    shotsOnTarget: { attacking: 1.11, defending: 0.94 },
    corners: { attacking: 1.16, defending: 0.91 },
  };

  return profiles[metric] || { attacking: 1.08, defending: 0.95 };
}

function runForecastScenarioEngine({
  baseMean,
  baseVariance,
  competitiveContext,
  metric,
  probabilities,
  side,
} = {}) {
  const weights = buildScenarioWeights({ competitiveContext, probabilities });
  const factors = getMetricFactors(metric);
  const scenarioDefinitions = side === 'home'
    ? [
      { id: 'neutral', weight: weights.neutral, factor: 1 },
      { id: 'home-pressure', weight: weights.homePressure, factor: factors.attacking },
      { id: 'away-pressure', weight: weights.awayPressure, factor: factors.defending },
    ]
    : [
      { id: 'neutral', weight: weights.neutral, factor: 1 },
      { id: 'home-pressure', weight: weights.homePressure, factor: factors.defending },
      { id: 'away-pressure', weight: weights.awayPressure, factor: factors.attacking },
    ];

  const scenarios = scenarioDefinitions.map((scenario) => {
    const mean = Math.max(0.05, baseMean * scenario.factor);
    const varianceInflation = scenario.id === 'neutral' ? 1 : 1.08;
    const variance = Math.max(mean, baseVariance * varianceInflation);
    const distribution = buildDiscreteDistribution({ mean, variance });

    return {
      id: scenario.id,
      weight: Number(scenario.weight.toFixed(4)),
      factor: scenario.factor,
      mean: Number(mean.toFixed(3)),
      distribution,
    };
  });

  return {
    model: 'forecast-scenario-v1',
    scenarios: scenarios.map(({ distribution, ...scenario }) => ({
      ...scenario,
      distributionFamily: distribution.family,
    })),
    distribution: mixDiscreteDistributions(scenarios.map((scenario) => ({
      weight: scenario.weight,
      distribution: scenario.distribution,
    }))),
  };
}

export { buildScenarioWeights, runForecastScenarioEngine };
