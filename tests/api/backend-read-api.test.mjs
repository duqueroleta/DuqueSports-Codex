import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createApiHandler } from '../../server/app/createApiHandler.js';
import { InMemorySportsRepository } from '../../server/repositories/InMemorySportsRepository.js';

let requestSequence = 0;
const handler = createApiHandler({
  repository: new InMemorySportsRepository(),
  now: () => new Date('2026-07-13T23:50:00.000Z'),
  requestIdFactory: () => `req_test_${++requestSequence}`,
  allowedOrigins: ['https://duque-score.example'],
});
const server = createServer(handler);

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;

try {
  const competitionsResponse = await fetch(`${baseUrl}/api/v1/competitions`, {
    headers: { Origin: 'https://duque-score.example' },
  });
  const competitionsBody = await competitionsResponse.json();

  assert.equal(competitionsResponse.status, 200);
  assert.equal(competitionsResponse.headers.get('access-control-allow-origin'), 'https://duque-score.example');
  assert.equal(competitionsBody.data.length, 16);
  assert.equal(competitionsBody.meta.schemaVersion, 'api-envelope.v1');
  assert.equal(competitionsBody.meta.dataSchemaVersion, 'competition-read.v1');
  assert.equal(competitionsBody.meta.generatedAt, '2026-07-13T23:50:00.000Z');

  const firstPageResponse = await fetch(`${baseUrl}/api/v1/matches?limit=2`);
  const firstPage = await firstPageResponse.json();
  const secondPageResponse = await fetch(
    `${baseUrl}/api/v1/matches?limit=2&cursor=${encodeURIComponent(firstPage.meta.nextCursor)}`,
  );
  const secondPage = await secondPageResponse.json();

  assert.equal(firstPage.data.length, 2);
  assert.ok(firstPage.meta.nextCursor);
  assert.equal(secondPage.data.length, 2);
  assert.notEqual(firstPage.data[0].id, secondPage.data[0].id);
  assert.equal(Object.hasOwn(firstPage.data[0], 'odds'), false, 'Public read model should not expose odds');
  assert.equal(firstPage.data[0].schedule.date, null, 'Mock API must not invent a match date');

  const filteredResponse = await fetch(
    `${baseUrl}/api/v1/matches?competitionId=champions-league&status=scheduled`,
  );
  const filtered = await filteredResponse.json();

  assert.equal(filtered.data.length, 1);
  assert.equal(filtered.data[0].id, 'match:internal:6');

  const liveResponse = await fetch(`${baseUrl}/api/v1/matches?status=live`);
  const live = await liveResponse.json();
  assert.equal(live.data.length, 2);

  const detailResponse = await fetch(`${baseUrl}/api/v1/matches/match:internal:6`);
  const detail = await detailResponse.json();
  assert.equal(detailResponse.status, 200);
  assert.equal(detail.data.teams.home.name, 'Real Madrid');
  assert.equal(detail.data.teams.away.name, 'Manchester City');

  const invalidLimitResponse = await fetch(`${baseUrl}/api/v1/matches?limit=500`);
  const invalidLimit = await invalidLimitResponse.json();
  assert.equal(invalidLimitResponse.status, 400);
  assert.equal(invalidLimit.error.code, 'invalid-query');

  const invalidCursorResponse = await fetch(`${baseUrl}/api/v1/matches?cursor=invalid`);
  const invalidCursor = await invalidCursorResponse.json();
  assert.equal(invalidCursorResponse.status, 400);
  assert.equal(invalidCursor.error.code, 'invalid-cursor');

  const missingResponse = await fetch(`${baseUrl}/api/v1/matches/match:internal:999`);
  const missing = await missingResponse.json();
  assert.equal(missingResponse.status, 404);
  assert.equal(missing.error.code, 'resource-not-found');
  assert.equal(Object.hasOwn(missing.error, 'stack'), false);

  const methodResponse = await fetch(`${baseUrl}/api/v1/matches`, { method: 'POST' });
  assert.equal(methodResponse.status, 405);
  assert.equal(methodResponse.headers.get('allow'), 'GET');

  const blockedOriginResponse = await fetch(`${baseUrl}/api/v1/competitions`, {
    headers: { Origin: 'https://untrusted.example' },
  });
  assert.equal(blockedOriginResponse.headers.get('access-control-allow-origin'), null);

  firstPage.data[0].teams.home.name = 'Mutated client value';
  const repeatedDetail = await fetch(`${baseUrl}/api/v1/matches/match:internal:1`).then((response) => response.json());
  assert.notEqual(repeatedDetail.data.teams.home.name, 'Mutated client value');
} finally {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}

console.log('Backend read API tests passed');
