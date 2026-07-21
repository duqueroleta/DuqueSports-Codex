import assert from 'node:assert/strict';
import { buildAdminEngineInput, buildAdminEngineProjection } from '../../src/services/adminProjectionService.js';
import { createPublishedProjectionRecord } from '../../src/services/publishedProjectionService.js';

const homeRecentMatches = [
  { goals: 2, shots: 16, shotsOnTarget: 6, xg: 2.1, xgot: 1.8 },
  { goals: 1, shots: 14, shotsOnTarget: 5, xg: 1.72, xgot: 1.44 },
  { goals: 2, shots: 15, shotsOnTarget: 5, xg: 2.04, xgot: 1.7 },
];
const awayRecentMatches = [
  { goals: 1, shots: 12, shotsOnTarget: 4, xg: 1.18, xgot: 0.98 },
  { goals: 0, shots: 10, shotsOnTarget: 3, xg: 0.92, xgot: 0.76 },
  { goals: 1, shots: 11, shotsOnTarget: 4, xg: 1.04, xgot: 0.86 },
];
const form = {
  awayName: 'Gana',
  awayRecentMatches,
  awayShots: 11,
  awayShotsOnTarget: 4,
  awayXg: 1.05,
  competition: 'Copa do Mundo',
  date: '2026-07-21',
  homeName: 'Colombia',
  homeRecentMatches,
  homeShots: 15,
  homeShotsOnTarget: 5,
  homeXg: 1.96,
  time: '18:30',
};

const engineInput = buildAdminEngineInput(form);
assert.deepEqual(engineInput.homeTeam.recentMatches, homeRecentMatches, 'Admin engine input should use pasted home history');
assert.deepEqual(engineInput.awayTeam.recentMatches, awayRecentMatches, 'Admin engine input should use pasted away history');

const projection = buildAdminEngineProjection(form);
assert.equal(projection.blocked, undefined, 'Pasted recent histories should pass Data Quality');
assert.ok(projection.expectedHomeGoals > projection.expectedAwayGoals, 'Projection should reflect stronger home history');
assert.ok(projection.confidence >= 0 && projection.confidence <= 100, 'Admin projection confidence should be bounded');

const publishedRecord = createPublishedProjectionRecord(form, projection, () => new Date('2026-07-21T21:30:00.000Z'));
assert.equal(publishedRecord.match.id, 'admin-1784669400000');
assert.equal(publishedRecord.match.home, 'Colombia');
assert.equal(publishedRecord.match.away, 'Gana');
assert.equal(publishedRecord.match.status, 'Pre-jogo');
assert.equal(publishedRecord.match.confidence, projection.confidence);
assert.ok(publishedRecord.match.metrics.some((metric) => metric.startsWith('xG ')));
assert.equal(publishedRecord.projection, projection, 'Published record should preserve the engine projection for detail pages');

console.log('Admin projection service tests passed');
