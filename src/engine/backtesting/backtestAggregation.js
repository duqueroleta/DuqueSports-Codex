function roundMetric(value) {
  return Number(value.toFixed(6));
}

function mean(values) {
  const finiteValues = values.filter(Number.isFinite);

  if (finiteValues.length === 0) {
    return null;
  }

  return roundMetric(finiteValues.reduce((total, value) => total + value, 0) / finiteValues.length);
}

function summarizeBacktestCases(cases) {
  const normalizedCases = Array.isArray(cases) ? cases : [];
  const auditedCases = normalizedCases.filter((item) => item.status === 'audited');
  const outcomes = auditedCases.flatMap((item) => item.audit?.outcomes ?? []);
  const settledOutcomes = outcomes.filter((outcome) => outcome?.settlement?.status === 'settled');

  return {
    totalCases: normalizedCases.length,
    auditedCases: auditedCases.length,
    blockedCases: normalizedCases.filter((item) => item.status === 'blocked').length,
    rejectedCases: normalizedCases.filter((item) => item.status === 'rejected').length,
    auditedMarkets: outcomes.length,
    settledMarkets: settledOutcomes.length,
    hits: settledOutcomes.filter((outcome) => outcome.classification === 'hit').length,
    misses: settledOutcomes.filter((outcome) => outcome.classification === 'miss').length,
    excludedMarkets: outcomes.length - settledOutcomes.length,
    meanBrierScore: mean(settledOutcomes.map((outcome) => outcome.metrics?.brierScore)),
    meanLogLoss: mean(settledOutcomes.map((outcome) => outcome.metrics?.logLoss)),
  };
}

function buildBacktestSummary(cases, partitionKeys) {
  const partitions = Object.fromEntries(partitionKeys.map((partition) => [
    partition,
    summarizeBacktestCases(cases.filter((item) => item.partition === partition)),
  ]));

  return {
    overall: summarizeBacktestCases(cases),
    partitions,
  };
}

export { buildBacktestSummary, summarizeBacktestCases };
