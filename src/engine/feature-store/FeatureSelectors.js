function getFeatureValue(featureStore, scope, featureId) {
  return featureStore.features[scope]?.find((feature) => feature.featureId === featureId)?.value;
}

function getTeamFeatureValue(featureStore, side, featureId) {
  return getFeatureValue(featureStore, side, featureId);
}

function getMatchFeatureValue(featureStore, featureId) {
  return getFeatureValue(featureStore, 'match', featureId);
}

export { getMatchFeatureValue, getTeamFeatureValue };
