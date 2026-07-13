function roundMetric(value) {
  return Number(value.toFixed(6));
}

function compareMetric(baseline, candidate, direction) {
  const comparable = Number.isFinite(baseline) && Number.isFinite(candidate);

  return {
    baseline: Number.isFinite(baseline) ? baseline : null,
    candidate: Number.isFinite(candidate) ? candidate : null,
    delta: comparable ? roundMetric(candidate - baseline) : null,
    direction,
  };
}

function calculateHitRate(summary) {
  return Number.isFinite(summary?.hits)
    && Number.isFinite(summary?.settledMarkets)
    && summary.settledMarkets > 0
    ? roundMetric(summary.hits / summary.settledMarkets * 100)
    : null;
}

function compareBacktestSummary(baseline, candidate) {
  return {
    coverage: {
      auditedCases: compareMetric(baseline?.auditedCases, candidate?.auditedCases, 'higher-is-more-coverage'),
      blockedCases: compareMetric(baseline?.blockedCases, candidate?.blockedCases, 'lower-is-better'),
      rejectedCases: compareMetric(baseline?.rejectedCases, candidate?.rejectedCases, 'lower-is-better'),
      settledMarkets: compareMetric(baseline?.settledMarkets, candidate?.settledMarkets, 'higher-is-more-coverage'),
    },
    quality: {
      hitRate: compareMetric(calculateHitRate(baseline), calculateHitRate(candidate), 'descriptive-only'),
      meanBrierScore: compareMetric(baseline?.meanBrierScore, candidate?.meanBrierScore, 'lower-is-better'),
      meanLogLoss: compareMetric(baseline?.meanLogLoss, candidate?.meanLogLoss, 'lower-is-better'),
    },
  };
}

function compareCalibrationSummary(baseline, candidate) {
  return {
    samples: compareMetric(baseline?.samples, candidate?.samples, 'higher-is-more-coverage'),
    expectedCalibrationError: compareMetric(
      baseline?.expectedCalibrationError,
      candidate?.expectedCalibrationError,
      'lower-is-better',
    ),
    maximumCalibrationError: compareMetric(
      baseline?.maximumCalibrationError,
      candidate?.maximumCalibrationError,
      'lower-is-better',
    ),
    brierScore: compareMetric(baseline?.brierScore, candidate?.brierScore, 'lower-is-better'),
  };
}

export {
  compareBacktestSummary,
  compareCalibrationSummary,
  compareMetric,
};
