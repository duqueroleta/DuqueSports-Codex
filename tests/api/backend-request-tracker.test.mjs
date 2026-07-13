import assert from 'node:assert/strict';
import { EventEmitter, once } from 'node:events';
import { createServer } from 'node:http';
import { createRequestTracker } from '../../server/observability/createRequestTracker.js';

const tracker = createRequestTracker();
const pendingResponses = [];
let resolveRequestsStarted;
const requestsStarted = new Promise((resolve) => {
  resolveRequestsStarted = resolve;
});
const handler = tracker.track((_request, response) => {
  pendingResponses.push(response);

  if (pendingResponses.length === 2) {
    resolveRequestsStarted();
  }
});
const server = createServer(handler);

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;

try {
  const firstRequest = fetch(`${baseUrl}/first`);
  const secondRequest = fetch(`${baseUrl}/second`).catch((error) => error);
  await requestsStarted;

  const concurrentSnapshot = tracker.getSnapshot();
  assert.deepEqual(concurrentSnapshot, { active: 2, totalStarted: 2 });
  assert.equal(Object.isFrozen(concurrentSnapshot), true);
  assert.deepEqual(Object.keys(concurrentSnapshot), ['active', 'totalStarted']);

  pendingResponses[0].end('completed');
  const firstResponse = await firstRequest;
  assert.equal(await firstResponse.text(), 'completed');
  assert.deepEqual(tracker.getSnapshot(), { active: 1, totalStarted: 2 });

  const secondResponseClosed = once(pendingResponses[1], 'close');
  pendingResponses[1].destroy();
  await Promise.all([secondRequest, secondResponseClosed]);
  assert.deepEqual(tracker.getSnapshot(), { active: 0, totalStarted: 2 });
} finally {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}

const throwingTracker = createRequestTracker();
const throwingHandler = throwingTracker.track(() => {
  throw new Error('synchronous-handler-failure');
});
assert.throws(
  () => throwingHandler({}, new EventEmitter()),
  /synchronous-handler-failure/,
);
assert.deepEqual(throwingTracker.getSnapshot(), { active: 0, totalStarted: 1 });

console.log('Backend request tracker tests passed');
