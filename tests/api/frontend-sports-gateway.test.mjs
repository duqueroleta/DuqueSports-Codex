import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createApiHandler } from '../../server/app/createApiHandler.js';
import { InMemorySportsRepository } from '../../server/repositories/InMemorySportsRepository.js';
import { competitions } from '../../src/data/competitions.js';
import { matches } from '../../src/data/matches.js';
import { createSportsApiClient, SportsApiError } from '../../src/services/sportsApiClient.js';
import { createSportsDataGateway } from '../../src/services/sportsDataGateway.js';

let requestSequence = 0;
const handler = createApiHandler({
  repository: new InMemorySportsRepository(),
  now: () => new Date('2026-07-14T00:30:00.000Z'),
  requestIdFactory: () => `req_frontend_${++requestSequence}`,
});
const server = createServer(handler);

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const apiClient = createSportsApiClient({ baseUrl: `http://127.0.0.1:${address.port}/api/v1` });
const gateway = createSportsDataGateway({
  apiClient,
  enabled: true,
  fallbackCompetitions: competitions,
  fallbackMatches: matches,
});

try {
  const apiCompetitions = await gateway.getCompetitions();
  assert.equal(apiCompetitions.length, 16);
  assert.deepEqual(apiCompetitions[0], competitions[0]);

  const apiMatches = await gateway.getMatches();
  assert.equal(apiMatches.length, 16);
  assert.equal(apiMatches[5].id, 6);
  assert.equal(apiMatches[5].home, 'Real Madrid');
  assert.equal(apiMatches[5].status, 'Pre-jogo');
  assert.equal(apiMatches[5].odds, matches[5].odds, 'Presentation-only mock metadata remains available');
  assert.deepEqual(apiMatches[5].colors, matches[5].colors);

  const apiMatch = await gateway.getMatchById(6);
  assert.equal(apiMatch.away, 'Manchester City');
  assert.equal(apiMatch.score, '0 - 0');

  await assert.rejects(
    () => apiClient.getMatchById('../invalid'),
    (error) => error instanceof SportsApiError && error.code === 'invalid-match-id',
  );

  const failingClient = {
    getCompetitions: async () => { throw new Error('offline'); },
    getMatchById: async () => { throw new Error('offline'); },
    getMatches: async () => { throw new Error('offline'); },
  };
  const fallbackGateway = createSportsDataGateway({
    apiClient: failingClient,
    enabled: true,
    fallbackCompetitions: competitions,
    fallbackMatches: matches,
  });

  assert.equal(await fallbackGateway.getCompetitions(), competitions);
  assert.equal(await fallbackGateway.getMatches(), matches);
  assert.equal((await fallbackGateway.getMatchById(2)).home, 'Cruzeiro');

  let apiWasCalled = false;
  const disabledGateway = createSportsDataGateway({
    apiClient: {
      getMatches: async () => {
        apiWasCalled = true;
        return [];
      },
    },
    enabled: false,
    fallbackMatches: matches,
  });

  assert.equal(await disabledGateway.getMatches(), matches);
  assert.equal(apiWasCalled, false, 'Disabled integration must not make network requests');

  const malformedClient = createSportsApiClient({
    baseUrl: 'https://invalid.example/api/v1',
    fetchImpl: async () => new Response(JSON.stringify({ unexpected: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  });
  await assert.rejects(
    () => malformedClient.getCompetitions(),
    (error) => error instanceof SportsApiError && error.code === 'invalid-envelope',
  );
} finally {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}

console.log('Frontend sports gateway tests passed');
