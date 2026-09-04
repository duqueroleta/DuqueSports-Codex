import { runForecastEnsemble } from './ForecastEnsembleEngine.js';
import { runForecastScenarioEngine } from './ForecastScenarioEngine.js';
import { runMonteCarloForecast } from './MonteCarloForecastEngine.js';

const FOCUS_METRICS = Object.freeze(['shots', 'shotsOnTarget', 'corners']);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function finiteValues(matches, field) {
  return Array.isArray(matches)
    ? matches.map((match) => Number(match?.[field])).filter(Number.isFinite)
    : [];
}

function average(values, fallback = 0) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;
}

function sampleVariance(values, fallback) {
  if (values.length < 2) {
    return fallback;
  }

  const mean = average(values);
  return values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / (values.length - 1);
}

function deriveCornerFallback(shots) {
  return 3 + (shots / 5);
}

function getAdjustedMetric(teamAdjusted, metric) {
  if (Number.isFinite(teamAdjusted?.metrics?.[metric])) {
    return teamAdjusted.metrics[metric];
  }

  if (metric === 'corners') {
    return deriveCornerFallback(teamAdjusted?.metrics?.shots || 10);
  }

  return 0;
}

function buildForecastSignals({ expectedGoals, metric, teamAdjusted, matches, competitiveModifier }) {
  const adjustedMean = getAdjustedMetric(teamAdjusted, metric);
  const rawValues = finiteValues(matches, metric);
  const rawMean = average(rawValues, adjustedMean);
  const xg = Math.max(0.1, teamAdjusted?.metrics?.xg || expectedGoals || 1);
  const goalCreationRatio = clamp((expectedGoals || xg) / xg, 0.82, 1.18);
  const contextFactor = clamp(1 + ((competitiveModifier - 1) * 0.6), 0.9, 1.1);
  let linkedMean = adjustedMean * goalCreationRatio;

  if (metric === 'shotsOnTarget') {
    const shots = Math.max(1, teamAdjusted?.metrics?.shots || 10);
    const onTargetRate = clamp((teamAdjusted?.metrics?.shotsOnTarget || 1) / shots, 0.18, 0.62);
    const xgotRatio = teamAdjusted?.metrics?.xg > 0
      ? clamp(teamAdjusted.metrics.xgot / teamAdjusted.metrics.xg, 0.78, 1.24)
      : 1;
    linkedMean = Math.max(1, shots * onTargetRate * goalCreationRatio * xgotRatio);
  }

  if (metric === 'corners') {
    const shots = Math.max(1, teamAdjusted?.metrics?.shots || 10);
    linkedMean = deriveCornerFallback(shots * goalCreationRatio);
  }

  const empiricalVariance = sampleVariance(
    rawValues,
    Math.max(adjustedMean, metric === 'corners' ? adjustedMean * 1.45 : adjustedMean * 1.2),
  );
  const limitedCoverage = rawValues.length < 3;
  const reliability = limitedCoverage ? 0.55 : clamp(0.68 + (rawValues.length * 0.05), 0.68, 0.95);

  return {
    forecasts: [
      {
        id: 'opponent-strength-recency',
        mean: adjustedMean,
        variance: Math.max(adjustedMean, empiricalVariance),
        weight: 0.36,
        reliability: 0.9,
      },
      {
        id: 'raw-recent-sample',
        mean: rawMean,
        variance: Math.max(rawMean, empiricalVariance),
        weight: 0.24,
        reliability,
      },
      {
        id: 'creation-linked',
        mean: linkedMean,
        variance: Math.max(linkedMean, empiricalVariance * 1.08),
        weight: 0.25,
        reliability: metric === 'corners' && limitedCoverage ? 0.58 : 0.78,
      },
      {
        id: 'competitive-context',
        mean: adjustedMean * contextFactor,
        variance: Math.max(adjustedMean, empiricalVariance * 1.12),
        weight: 0.15,
        reliability: 0.72,
      },
    ],
    evidence: {
      observedValues: rawValues.length,
      requestedMetric: metric,
      coverage: Number((rawValues.length / Math.max(matches?.length || 5, 1)).toFixed(2)),
      limitations: limitedCoverage
        ? [`Insufficient direct ${metric} history; uncertainty was widened and fallback signals were down-weighted.`]
        : [],
    },
  };
}

function buildTeamMetricForecast({
  competitiveContext,
  expectedGoals,
  matchId,
  matchInput,
  metric,
  probabilities,
  side,
  teamAdjusted,
}) {
  const team = side === 'home' ? matchInput.homeTeam : matchInput.awayTeam;
  const competitiveModifier = side === 'home'
    ? competitiveContext.homeModifier
    : competitiveContext.awayModifier;
  const signals = buildForecastSignals({
    expectedGoals,
    metric,
    teamAdjusted,
    matches: team.recentMatches,
    competitiveModifier,
  });
  const ensemble = runForecastEnsemble({ forecasts: signals.forecasts });
  const scenario = runForecastScenarioEngine({
    baseMean: ensemble.mean,
    baseVariance: Math.max(ensemble.mean, ensemble.variance),
    competitiveContext,
    metric,
    probabilities,
    side,
  });
  const monteCarlo = runMonteCarloForecast({
    distribution: scenario.distribution,
    iterations: 10000,
    seed: `${matchId}:${side}:${metric}`,
  });

  return {
    metric,
    side,
    teamId: team.id,
    teamName: team.name,
    ensemble,
    distribution: scenario.distribution,
    scenarios: scenario.scenarios,
    monteCarlo,
    evidence: signals.evidence,
    exactCountGuidance: {
      expectedValue: scenario.distribution.summary.mean,
      median: scenario.distribution.summary.median,
      mode: scenario.distribution.summary.mode,
      modeProbability: scenario.distribution.summary.modeProbability,
      rule: 'Use the discrete distribution for exact-count interpretation; do not round the expected value and call it the most likely count.',
    },
  };
}

function runForecastIntelligenceLayer({
  awayAdjusted,
  competitiveContext,
  expectedAwayGoals,
  expectedHomeGoals,
  homeAdjusted,
  matchInput,
  probabilities,
} = {}) {
  const markets = {};

  FOCUS_METRICS.forEach((metric) => {
    markets[metric] = {
      home: buildTeamMetricForecast({
        competitiveContext,
        expectedGoals: expectedHomeGoals,
        matchId: matchInput.id,
        matchInput,
        metric,
        probabilities,
        side: 'home',
        teamAdjusted: homeAdjusted,
      }),
      away: buildTeamMetricForecast({
        competitiveContext,
        expectedGoals: expectedAwayGoals,
        matchId: matchInput.id,
        matchInput,
        metric,
        probabilities,
        side: 'away',
        teamAdjusted: awayAdjusted,
      }),
    };
  });

  return {
    model: 'forecast-intelligence-layer-v1',
    additive: true,
    replacesLegacyProjection: false,
    focusMetrics: [...FOCUS_METRICS],
    principles: {
      consensusIndex: 'agreement-between-component-forecasts-not-hit-probability',
      exactCounts: 'mode-from-distribution-not-rounded-mean',
      uncertainty: 'explicit-distribution-and-intervals',
      missingEvidence: 'down-weight-and-widen-uncertainty',
    },
    markets,
  };
}

export { FOCUS_METRICS, runForecastIntelligenceLayer };
