import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createApiHandler } from '../../server/app/createApiHandler.js';

let runtimeReady = true;
let requestSequence = 0;
const handler = createApiHandler({
  repository: {
    listCompetitions() { throw new Error('Probes must not read competitions'); },
    listMatches() { throw new Error('Probes must not read matches'); },
    findMatchById() { throw new Error('Probes must not read match details'); },
  },
  now: () => new Date('2026-07-14T04:00:20.000Z'),
  startedAt: new Date('2026-07-14T04:00:00.000Z'),
  requestIdFactory: () => `req_probe_${++requestSequence}`,
  getReadinessChecks: () => [
    { name: 'http-runtime', required: true, status: runtimeReady ? 'ready' : 'not-ready' },
    { name: 'database', required: false, status: 'not-configured' },
  ],
});
const server = createServer(handler);

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}/internal/v1/health`;

try {
  const livenessResponse = await fetch(`${baseUrl}/live`);
  const liveness = await livenessResponse.json();
  assert.equal(livenessResponse.status, 200);
  assert.equal(liveness.meta.dataSchemaVersion, 'liveness-read.v1');
  assert.equal(liveness.data.status, 'alive');
  assert.equal(liveness.data.time.uptimeSeconds, 20);

  const readyResponse = await fetch(`${baseUrl}/ready`);
  const ready = await readyResponse.json();
  assert.equal(readyResponse.status, 200);
  assert.equal(ready.meta.dataSchemaVersion, 'readiness-read.v1');
  assert.equal(ready.data.status, 'ready');
  assert.equal(ready.data.checks[1].status, 'not-configured');

  runtimeReady = false;
  const unavailableResponse = await fetch(`${baseUrl}/ready`);
  const unavailable = await unavailableResponse.json();
  assert.equal(unavailableResponse.status, 503);
  assert.equal(unavailable.data.status, 'not-ready');
  assert.equal(unavailable.meta.dataSchemaVersion, 'readiness-read.v1');

  const livenessAfterFailure = await fetch(`${baseUrl}/live`).then((response) => response.json());
  assert.equal(livenessAfterFailure.data.status, 'alive', 'Liveness must not depend on readiness');

  const legacyResponse = await fetch(baseUrl);
  const legacy = await legacyResponse.json();
  assert.equal(legacyResponse.status, 200);
  assert.equal(legacy.meta.dataSchemaVersion, 'health-read.v1');

  const serializedProbes = JSON.stringify({ liveness, ready, unavailable }).toLowerCase();
  assert.equal(serializedProbes.includes('password'), false);
  assert.equal(serializedProbes.includes('token'), false);
  assert.equal(serializedProbes.includes('database_url'), false);
} finally {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}

console.log('Backend operational probe tests passed');
