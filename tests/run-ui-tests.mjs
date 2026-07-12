const UI_TEST_SUITES = Object.freeze([
  'engine-projection-section-state.test.mjs',
  'detail-page-state.test.mjs',
  'match-probabilities.test.mjs',
  'match-metrics.test.mjs',
  'match-confidence.test.mjs',
  'match-odds.test.mjs',
  'match-presentation.test.mjs',
  'live-match-presentation.test.mjs',
]);

for (const suite of UI_TEST_SUITES) {
  await import(new URL(suite, import.meta.url));
}

console.log(`UI test runner completed ${UI_TEST_SUITES.length} suites`);
