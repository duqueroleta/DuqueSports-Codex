import assert from 'node:assert/strict';
import {
  CANONICAL_MATCH_SCHEMA_VERSION,
  CANONICAL_MATCH_STATUSES,
  validateCanonicalMatch,
} from '../../src/engine/contracts/CanonicalMatchContract.js';
import { CANONICAL_MATCH_V1_EXAMPLE } from '../../src/engine/contracts/examples/canonicalMatch.v1.js';

const validMatch = CANONICAL_MATCH_V1_EXAMPLE;

const validResult = validateCanonicalMatch(validMatch);

assert.equal(validResult.valid, true, 'A complete canonical match should be valid');
assert.equal(validResult.errors.length, 0, 'A valid canonical match should not expose errors');
assert.equal(validResult.schemaVersion, CANONICAL_MATCH_SCHEMA_VERSION, 'Validation should expose schema version');
assert.ok(CANONICAL_MATCH_STATUSES.includes('live'), 'Canonical statuses should include live matches');

const invalidResult = validateCanonicalMatch({
  ...validMatch,
  schemaVersion: 'canonical-match.v0',
  kickoffAt: '2026-07-12 21:00',
  status: 'unknown',
  teams: {
    home: validMatch.teams.home,
    away: { ...validMatch.teams.home },
  },
  score: { home: -1, away: 1.5 },
  context: { neutralVenue: 'yes' },
  dataQuality: { freshnessHours: -2, completeness: 140 },
});
const invalidPaths = new Set(invalidResult.errors.map((error) => error.path));

assert.equal(invalidResult.valid, false, 'Invalid canonical values should fail validation');
assert.ok(invalidPaths.has('schemaVersion'), 'Validation should reject unsupported schema versions');
assert.ok(invalidPaths.has('kickoffAt'), 'Validation should require UTC kickoff dates');
assert.ok(invalidPaths.has('status'), 'Validation should reject unsupported statuses');
assert.ok(invalidPaths.has('teams'), 'Validation should reject duplicate teams');
assert.ok(invalidPaths.has('score.home'), 'Validation should reject negative scores');
assert.ok(invalidPaths.has('score.away'), 'Validation should reject fractional scores');
assert.ok(invalidPaths.has('context.neutralVenue'), 'Validation should require a boolean venue flag');
assert.ok(invalidPaths.has('dataQuality.freshnessHours'), 'Validation should reject negative freshness');
assert.ok(invalidPaths.has('dataQuality.completeness'), 'Validation should bound completeness');

const missingResult = validateCanonicalMatch(null);

assert.equal(missingResult.valid, false, 'A missing canonical match should be invalid');
assert.equal(missingResult.errors[0].path, 'match', 'A missing match should expose its root path');

console.log('Canonical match contract tests passed');
