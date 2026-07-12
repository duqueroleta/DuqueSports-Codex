import assert from 'node:assert/strict';
import {
  CANONICAL_MATCH_STATISTICS_SCHEMA_VERSION,
  CANONICAL_STATISTICS_PERIODS,
  validateCanonicalMatchStatistics,
} from '../../src/engine/contracts/CanonicalMatchStatisticsContract.js';
import { CANONICAL_MATCH_STATISTICS_V1_EXAMPLE } from '../../src/engine/contracts/examples/canonicalMatchStatistics.v1.js';

const validResult = validateCanonicalMatchStatistics(CANONICAL_MATCH_STATISTICS_V1_EXAMPLE);

assert.equal(validResult.valid, true, 'A complete statistics snapshot should be valid');
assert.equal(validResult.errors.length, 0, 'Valid statistics should not expose errors');
assert.equal(
  validResult.schemaVersion,
  CANONICAL_MATCH_STATISTICS_SCHEMA_VERSION,
  'Statistics validation should expose schema version',
);
assert.ok(CANONICAL_STATISTICS_PERIODS.includes('live'), 'Statistics periods should include live snapshots');

const invalidResult = validateCanonicalMatchStatistics({
  ...CANONICAL_MATCH_STATISTICS_V1_EXAMPLE,
  period: 'live',
  minute: null,
  teams: {
    home: {
      ...CANONICAL_MATCH_STATISTICS_V1_EXAMPLE.teams.home,
      possession: 80,
      shots: 4,
      shotsOnTarget: 8,
      xg: -1,
    },
    away: {
      ...CANONICAL_MATCH_STATISTICS_V1_EXAMPLE.teams.away,
      possession: 40,
      redCards: 1.5,
    },
  },
  dataQuality: { freshnessHours: -1, completeness: 120 },
});
const invalidPaths = new Set(invalidResult.errors.map((error) => error.path));
const invalidCodes = new Set(invalidResult.errors.map((error) => error.code));

assert.equal(invalidResult.valid, false, 'Invalid statistics should fail validation');
assert.ok(invalidPaths.has('minute'), 'A live snapshot should require its minute');
assert.ok(invalidPaths.has('teams.home.xg'), 'Expected goals should not be negative');
assert.ok(invalidPaths.has('teams.away.redCards'), 'Card counts should be integers');
assert.ok(invalidCodes.has('inconsistent-shots'), 'Shots on target should not exceed total shots');
assert.ok(invalidCodes.has('inconsistent-possession'), 'Combined possession should stay near one hundred');
assert.ok(invalidPaths.has('dataQuality.freshnessHours'), 'Freshness should not be negative');
assert.ok(invalidPaths.has('dataQuality.completeness'), 'Completeness should stay within bounds');

const missingResult = validateCanonicalMatchStatistics(null);

assert.equal(missingResult.valid, false, 'A missing statistics snapshot should be invalid');
assert.equal(missingResult.errors[0].path, 'statistics', 'A missing snapshot should expose its root path');

console.log('Canonical match statistics contract tests passed');
