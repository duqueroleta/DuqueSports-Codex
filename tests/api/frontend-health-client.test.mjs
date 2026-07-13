import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createApiHandler } from '../../server/app/createApiHandler.js';
import {
  createSportsHealthClient,
  SportsHealthError,
} from '../../src/services/sportsHealthService.js';

const handler = createApiHandler({
  repository: {},
  now: () => new Date('2026-07-14T02:15:15.000Z'),
  startedAt: new Date('2026-07-14T02:15:00.000Z'),
  requestIdFactory: () => 'req_frontend_health',
});
const server = createServer(handler);

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const healthUrl = `http://127.0.0.1:${address.port}/internal/v1/health`;

try {
  const client = createSportsHealthClient({ url: healthUrl });
  const health = await client.getHealth();

  assert.equal(health.status, 'healthy');
  assert.equal(health.service.name, 'duque-score-api');
  assert.equal(health.time.uptimeSeconds, 15);
  assert.equal(health.contracts.healthRead, 'health-read.v1');

  const missingClient = createSportsHealthClient({
    url: `http://127.0.0.1:${address.port}/internal/v1/missing`,
  });
  await assert.rejects(
    () => missingClient.getHealth(),
    (error) => error instanceof SportsHealthError
      && error.code === 'resource-not-found'
      && error.status === 404,
  );

  const malformedClient = createSportsHealthClient({
    fetchImpl: async () => new Response(JSON.stringify({ data: { status: 'healthy' } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  });
  await assert.rejects(
    () => malformedClient.getHealth(),
    (error) => error instanceof SportsHealthError && error.code === 'invalid-health-envelope',
  );
} finally {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}

console.log('Frontend health client tests passed');
