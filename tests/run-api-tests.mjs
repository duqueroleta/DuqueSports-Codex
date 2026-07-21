const API_TEST_SUITES = Object.freeze([
  'api/backend-read-api.test.mjs',
  'api/backend-server-config.test.mjs',
  'api/backend-runtime.test.mjs',
  'api/backend-request-tracker.test.mjs',
  'api/backend-health-api.test.mjs',
  'api/backend-operational-probes.test.mjs',
  'api/admin-projection-service.test.mjs',
  'api/frontend-health-client.test.mjs',
  'api/frontend-sports-gateway.test.mjs',
  'api/sports-data-source-store.test.mjs',
]);

for (const suite of API_TEST_SUITES) {
  await import(new URL(suite, import.meta.url));
}

console.log(`API test runner completed ${API_TEST_SUITES.length} suites`);
