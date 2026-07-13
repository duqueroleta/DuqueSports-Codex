import assert from 'node:assert/strict';
import {
  createServerConfig,
  formatServerAddress,
  ServerConfigError,
} from '../../server/config/createServerConfig.js';

const defaults = createServerConfig();
assert.equal(defaults.host, '127.0.0.1');
assert.equal(defaults.port, 8787);
assert.equal(defaults.shutdownTimeoutMs, 10000);
assert.deepEqual(defaults.allowedOrigins, [
  'http://127.0.0.1:5173',
  'http://localhost:5173',
]);
assert.equal(Object.isFrozen(defaults), true);
assert.equal(Object.isFrozen(defaults.allowedOrigins), true);

const configured = createServerConfig({
  API_PORT: ' 9090 ',
  API_HOST: '0.0.0.0',
  API_ALLOWED_ORIGINS: 'https://duque-score.example/, https://duque-score.example, http://localhost:4173',
  API_SHUTDOWN_TIMEOUT_MS: '5000',
});
assert.equal(configured.port, 9090);
assert.equal(configured.host, '0.0.0.0');
assert.equal(configured.shutdownTimeoutMs, 5000);
assert.deepEqual(configured.allowedOrigins, [
  'https://duque-score.example',
  'http://localhost:4173',
]);

const noBrowserOrigins = createServerConfig({ API_ALLOWED_ORIGINS: '   ' });
assert.deepEqual(noBrowserOrigins.allowedOrigins, []);
assert.equal(createServerConfig({ API_HOST: 'LOCALHOST' }).host, 'localhost');
assert.equal(formatServerAddress({ host: '::1', port: 8787 }), 'http://[::1]:8787');

for (const invalidPort of ['', '0', '65536', '8787.5', 'not-a-port']) {
  assert.throws(
    () => createServerConfig({ API_PORT: invalidPort }),
    (error) => error instanceof ServerConfigError
      && error.issues.some((issue) => issue.code === 'api-port-invalid'),
  );
}

for (const invalidHost of ['', 'api.example.com', '127.0.0.1/path']) {
  assert.throws(
    () => createServerConfig({ API_HOST: invalidHost }),
    (error) => error instanceof ServerConfigError
      && error.issues.some((issue) => issue.code === 'api-host-invalid'),
  );
}

for (const invalidTimeout of ['', '99', '120001', '500.5', 'not-a-timeout']) {
  assert.throws(
    () => createServerConfig({ API_SHUTDOWN_TIMEOUT_MS: invalidTimeout }),
    (error) => error instanceof ServerConfigError
      && error.issues.some((issue) => issue.code === 'shutdown-timeout-invalid'),
  );
}

for (const invalidOrigin of [
  '*',
  'not-a-url',
  'ftp://duque-score.example',
  'https://user:password@duque-score.example',
  'https://duque-score.example/path',
  'https://duque-score.example?debug=true',
]) {
  assert.throws(
    () => createServerConfig({ API_ALLOWED_ORIGINS: invalidOrigin }),
    (error) => error instanceof ServerConfigError
      && error.issues.some((issue) => issue.code === 'cors-origin-invalid'),
  );
}

assert.throws(
  () => createServerConfig({
    API_PORT: 'invalid',
    API_HOST: 'api.example.com',
    API_ALLOWED_ORIGINS: '*',
    API_SHUTDOWN_TIMEOUT_MS: 'invalid',
  }),
  (error) => error instanceof ServerConfigError
    && error.issues.length === 4
    && !error.message.includes('api.example.com'),
);

console.log('Backend server configuration tests passed');
