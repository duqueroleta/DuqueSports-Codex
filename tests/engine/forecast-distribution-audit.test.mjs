import assert from 'node:assert/strict';
import { matches } from '../../src/data/matches.js';
import { adaptMatchToEngineInput } from '../../src/engine/adapters/mockMatchAdapter.js';
import { runForecastDistributionAudit } from '../../src/engine/forecasting/ForecastDistributionAuditEngine.js';
import { runProjectionPipeline } from '../../src/engine/projection/ProjectionPipeline.js';

const engineInput = {
  ...adaptMatchToEngineInput(matches[0]),
  id: 'forecast-audit-match',
};
const projection = runProjectionPipeline(engineInput);
const statistics = {
  schemaVersion: 'canonical-match-statistics.v1',
  matchId: 'forecast-audit-match',
  source: {
    provider: 'test-provider',
    externalMatchId: 'forecast-audit-match',
    fetchedAt: '2026-09-04T18:00:00.000Z',
  },
  period: 'full-match',
  minute: null,
  teams: {
    home: {
      goals: 2,
      shots: 16,
      shotsOnTarget: 6,
      corners: 5,
      fouls: 11,
      yellowCards: 2,
      redCards: 0,
      xg: 1.74,
      xgot: 1.92,
      possession: 56,
    },
    away: {
      goals: 1,
      shots: 10,
      shotsOnTarget: 3,
      corners: 4,
      fouls: 13,
      yellowCards: 3,
      redCards: 0,
      xg: 0.91,
      xgot: 0.82,
      possession: 44,
    },
  },
  dataQuality: {
    freshnessHours: 0,
    completeness: 100,
  },
};

const audit = runForecastDistributionAudit({
  forecastIntelligence: projection.forecastIntelligence,
  statistics,
});

assert.equal(audit.blocked, false, 'Valid finalized statistics should be auditable');
assert.equal(audit.rows.length, 6, 'Audit should evaluate three focus metrics for both teams');
assert.ok(audit.summary.meanAbsoluteErrorExpectedValue >= 0);
assert.ok(audit.summary.meanAbsoluteErrorMode >= 0);
assert.ok(audit.summary.meanNegativeLogLikelihood >= 0);
assert.ok(audit.summary.intervalCoverage.p80 >= 0 && audit.summary.intervalCoverage.p80 <= 1);
assert.ok(
  audit.rows.every((row) => row.evaluation.exactProbability >= 0),
  'Every realized count should receive an exact distribution probability',
);
assert.ok(
  audit.rows.some((row) => row.metric === 'corners' && row.evaluation.operationalStatus === 'research-only'),
  'Low-evidence corner forecasts should remain research-only during audit',
);

const liveStatistics = {
  ...statistics,
  period: 'live',
  minute: 62,
};
const blockedAudit = runForecastDistributionAudit({
  forecastIntelligence: projection.forecastIntelligence,
  statistics: liveStatistics,
});

assert.equal(blockedAudit.blocked, true, 'Distribution audit must not score unfinished live statistics');

console.log('Forecast Distribution Audit tests passed');
