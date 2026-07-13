import assert from 'node:assert/strict';
import { EventEmitter, once } from 'node:events';
import { createServer } from 'node:http';
import {
  BackendRuntimeError,
  createBackendRuntime,
} from '../../server/bootstrap/createBackendRuntime.js';

function createTestConfig(port = 0, shutdownTimeoutMs = 10000) {
  return Object.freeze({
    host: '127.0.0.1',
    port,
    allowedOrigins: Object.freeze([]),
    shutdownTimeoutMs,
  });
}

const signalSource = new EventEmitter();
const logs = [];
const runtime = createBackendRuntime({
  config: createTestConfig(),
  signalSource,
  logger: {
    info: (message) => logs.push({ level: 'info', message }),
    error: (message) => logs.push({ level: 'error', message }),
  },
  now: () => new Date('2026-07-14T03:00:00.000Z'),
  requestIdFactory: () => 'req_runtime_test',
});

assert.equal(runtime.getState(), 'idle');
const startup = await runtime.start();
assert.equal(runtime.getState(), 'running');
assert.match(startup.address, /^http:\/\/127\.0\.0\.1:\d+$/);
assert.equal(signalSource.listenerCount('SIGINT'), 1);
assert.equal(signalSource.listenerCount('SIGTERM'), 1);

const health = await fetch(`${startup.address}/internal/v1/health`).then((response) => response.json());
assert.equal(health.data.status, 'healthy');
assert.equal(health.meta.requestId, 'req_runtime_test');

signalSource.emit('SIGTERM');
const stopped = await runtime.whenStopped();
assert.equal(stopped.reason, 'SIGTERM');
assert.equal(stopped.forced, false);
assert.equal(runtime.getState(), 'stopped');
assert.equal(signalSource.listenerCount('SIGINT'), 0);
assert.equal(signalSource.listenerCount('SIGTERM'), 0);
assert.equal(logs.some((entry) => entry.message.includes('SIGTERM')), true);
await runtime.stop('repeated-stop');

await assert.rejects(
  () => runtime.start(),
  (error) => error instanceof BackendRuntimeError && error.code === 'api-invalid-start-state',
);

const manuallyStoppedRuntime = createBackendRuntime({
  config: createTestConfig(),
  signalSource: new EventEmitter(),
});
await manuallyStoppedRuntime.start();
await Promise.all([
  manuallyStoppedRuntime.stop('manual'),
  manuallyStoppedRuntime.stop('duplicate'),
]);
assert.equal(manuallyStoppedRuntime.getState(), 'stopped');

let releaseSlowRequest;
const slowRequestStarted = new Promise((resolve) => {
  releaseSlowRequest = resolve;
});
let scheduledShutdown;
let clearedShutdownTimer = false;
const forcedLogs = [];
const forcedRuntime = createBackendRuntime({
  config: createTestConfig(0, 500),
  signalSource: new EventEmitter(),
  logger: {
    warn: (message) => forcedLogs.push(message),
  },
  scheduleTimeout: (callback, delay) => {
    scheduledShutdown = { callback, delay };
    return 'shutdown-timer';
  },
  clearScheduledTimeout: (timer) => {
    if (timer === 'shutdown-timer') clearedShutdownTimer = true;
  },
  serverFactory: (handler) => createServer((request, response) => {
    if (request.url === '/slow') {
      releaseSlowRequest();
      return;
    }

    handler(request, response);
  }),
});
const forcedStartup = await forcedRuntime.start();
const slowFetch = fetch(`${forcedStartup.address}/slow`).catch((error) => error);
await slowRequestStarted;
const forcedStopPromise = forcedRuntime.stop('timeout-test');
assert.equal(forcedRuntime.getState(), 'stopping');
assert.equal(scheduledShutdown.delay, 500);
scheduledShutdown.callback();
await forcedStopPromise;
await slowFetch;
const forcedStop = await forcedRuntime.whenStopped();
assert.equal(forcedStop.reason, 'timeout-test');
assert.equal(forcedStop.forced, true);
assert.equal(clearedShutdownTimer, true);
assert.equal(forcedLogs.length, 1);

const occupiedServer = createServer((_request, response) => response.end('occupied'));
await new Promise((resolve) => occupiedServer.listen(0, '127.0.0.1', resolve));
const occupiedAddress = occupiedServer.address();
const conflictingRuntime = createBackendRuntime({
  config: createTestConfig(occupiedAddress.port),
  signalSource: new EventEmitter(),
});

try {
  await assert.rejects(
    () => conflictingRuntime.start(),
    (error) => error instanceof BackendRuntimeError && error.code === 'api-address-in-use',
  );
  assert.equal(conflictingRuntime.getState(), 'failed');
  assert.equal((await conflictingRuntime.whenStopped()).reason, 'startup-failed');
} finally {
  occupiedServer.close();
  await once(occupiedServer, 'close');
}

console.log('Backend runtime tests passed');
