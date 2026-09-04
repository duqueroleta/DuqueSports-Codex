import { validateCanonicalMatchStatistics } from '../contracts/CanonicalMatchStatisticsContract.js';

const FORECAST_DISTRIBUTION_AUDIT_MODEL = 'forecast-distribution-audit-v1';

function round(value, decimals = 3) {
  return Number(value.toFixed(decimals));
}

function getExactProbability(distribution, actualCount) {
  const outcome = distribution?.probabilities?.find((item) => item.value === actualCount);
  return outcome?.probability ?? 0;
}

function intervalContains(interval, actualCount) {
  return Boolean(
    interval
    && Number.isFinite(interval.low)
    && Number.isFinite(interval.high)
    && actualCount >= interval.low
    && actualCount <= interval.high
  );
}

function evaluateForecast(forecast, actualCount) {
  const summary = forecast?.distribution?.summary;
  const exactProbability = getExactProbability(forecast?.distribution, actualCount);
  const safeProbability = Math.max(exactProbability, 1e-12);

  return {
    actualCount,
    expectedValue: summary.mean,
    mode: summary.mode,
    exactProbability: round(exactProbability * 100, 4),
    expectedAbsoluteError: round(Math.abs(actualCount - summary.mean)),
    modeAbsoluteError: Math.abs(actualCount - summary.mode),
    negativeLogLikelihood: round(-Math.log(safeProbability), 4),
    intervalHits: {
      p50: intervalContains(summary.intervals.p50, actualCount),
      p80: intervalContains(summary.intervals.p80, actualCount),
      p95: intervalContains(summary.intervals.p95, actualCount),
    },
    consensusIndex: forecast?.ensemble?.consensusIndex ?? null,
    evidenceCoverage: forecast?.evidence?.coverage ?? null,
    operationalStatus: forecast?.operationalStatus ?? null,
  };
}

function average(rows, selector) {
  if (!rows.length) {
    return null;
  }

  return round(rows.reduce((sum, row) => sum + selector(row), 0) / rows.length);
}

function buildAuditSummary(rows) {
  return {
    evaluatedForecasts: rows.length,
    meanAbsoluteErrorExpectedValue: average(rows, (row) => row.evaluation.expectedAbsoluteError),
    meanAbsoluteErrorMode: average(rows, (row) => row.evaluation.modeAbsoluteError),
    meanNegativeLogLikelihood: average(rows, (row) => row.evaluation.negativeLogLikelihood),
    intervalCoverage: {
      p50: average(rows, (row) => (row.evaluation.intervalHits.p50 ? 1 : 0)),
      p80: average(rows, (row) => (row.evaluation.intervalHits.p80 ? 1 : 0)),
      p95: average(rows, (row) => (row.evaluation.intervalHits.p95 ? 1 : 0)),
    },
  };
}

function runForecastDistributionAudit({ forecastIntelligence, statistics } = {}) {
  const statisticsValidation = validateCanonicalMatchStatistics(statistics);
  const issues = [...statisticsValidation.errors];

  if (statistics?.period !== 'full-match') {
    issues.push({
      path: 'statistics.period',
      code: 'full-match-required',
      message: 'forecast distribution audit requires finalized full-match statistics',
    });
  }

  if (statistics?.matchId !== forecastIntelligence?.matchId && forecastIntelligence?.matchId != null) {
    issues.push({
      path: 'statistics.matchId',
      code: 'match-mismatch',
      message: 'statistics and forecast intelligence must belong to the same match',
    });
  }

  if (!forecastIntelligence || forecastIntelligence.model !== 'forecast-intelligence-layer-v1') {
    issues.push({
      path: 'forecastIntelligence',
      code: 'unsupported-forecast',
      message: 'forecast-intelligence-layer-v1 output is required',
    });
  }

  if (issues.length) {
    return {
      model: FORECAST_DISTRIBUTION_AUDIT_MODEL,
      blocked: true,
      issues,
      rows: [],
      summary: buildAuditSummary([]),
    };
  }

  const rows = [];

  forecastIntelligence.focusMetrics.forEach((metric) => {
    ['home', 'away'].forEach((side) => {
      const actualCount = statistics.teams?.[side]?.[metric];
      const forecast = forecastIntelligence.markets?.[metric]?.[side];

      if (!Number.isInteger(actualCount) || actualCount < 0 || !forecast?.distribution?.summary) {
        return;
      }

      rows.push({
        metric,
        side,
        teamId: forecast.teamId,
        teamName: forecast.teamName,
        evaluation: evaluateForecast(forecast, actualCount),
      });
    });
  });

  return {
    model: FORECAST_DISTRIBUTION_AUDIT_MODEL,
    blocked: false,
    issues: [],
    rows,
    summary: buildAuditSummary(rows),
  };
}

export {
  FORECAST_DISTRIBUTION_AUDIT_MODEL,
  runForecastDistributionAudit,
};
