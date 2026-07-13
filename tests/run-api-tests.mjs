const API_TEST_SUITES = Object.freeze([
  'api/backend-read-api.test.mjs',
  'api/frontend-sports-gateway.test.mjs',
  'api/sports-data-source-store.test.mjs',
]);

for (const suite of API_TEST_SUITES) {
  await import(new URL(suite, import.meta.url));
}

console.log(`API test runner completed ${API_TEST_SUITES.length} suites`);
