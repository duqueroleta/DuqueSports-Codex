import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createApiHandler } from '../../server/app/createApiHandler.js';

const handler = createApiHandler({
  repository: {
    listCompetitions() { throw new Error('Health must not read competitions'); },
    listMatches() { throw new Error('Health must not read matches'); },
    findMatchById() { throw new Error('Health must not read match details'); },
  },
  now: () => new Date('2026-07-14T01:45:42.900Z'),
  startedAt: new Date('2026-07-14T01:44:00.000Z'),
  serviceVersion: 'test-version',
  requestIdFactory: () => 'req_health_test',
  allowedOrigins: ['http://127.0.0.1:5173'],
});
const server = createServer(handler);

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const healthUrl = `http://127.0.0.1:${address.port}/internal/v1/health`;

try {
  const response = await fetch(healthUrl, {
    headers: { Origin: 'http://127.0.0.1:5173' },
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://127.0.0.1:5173');
  assert.equal(body.meta.schemaVersion, 'api-envelope.v1');
  assert.equal(body.meta.dataSchemaVersion, 'health-read.v1');
  assert.equal(body.meta.requestId, 'req_health_test');
  assert.equal(body.data.schemaVersion, 'health-read.v1');
  assert.equal(body.data.status, 'healthy');
  assert.equal(body.data.service.name, 'duque-score-api');
  assert.equal(body.data.service.version, 'test-version');
  assert.equal(body.data.time.startedAt, '2026-07-14T01:44:00.000Z');
  assert.equal(body.data.time.checkedAt, '2026-07-14T01:45:42.900Z');
  assert.equal(body.data.time.uptimeSeconds, 102);
  assert.equal(body.data.contracts.matchRead, 'match-read.v1');

  const serializedBody = JSON.stringify(body).toLowerCase();
  assert.equal(serializedBody.includes('password'), false);
  assert.equal(serializedBody.includes('token'), false);
  assert.equal(serializedBody.includes('process.env'), false);
  assert.equal(serializedBody.includes('memoryusage'), false);

  const methodResponse = await fetch(healthUrl, { method: 'POST' });
  const methodBody = await methodResponse.json();
  assert.equal(methodResponse.status, 405);
  assert.equal(methodResponse.headers.get('allow'), 'GET');
  assert.equal(methodBody.error.code, 'method-not-allowed');
} finally {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}

console.log('Backend health API tests passed');
