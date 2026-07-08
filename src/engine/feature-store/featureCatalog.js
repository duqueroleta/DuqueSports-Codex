const FEATURE_CATALOG = [
  {
    id: 'adjusted_xg',
    name: 'Adjusted Expected Goals',
    description: 'xG recente após ponderação por recência e correção pela força do adversário.',
    formula: 'recency_weighted_xg * opponent_strength_coefficient',
    version: '1.0.0',
    ownerEngine: 'OpponentStrengthEngine',
    dependencies: ['recency.xg', 'opponentStrength.coefficient'],
    valueType: 'number',
    validRange: [0, 6],
  },
  {
    id: 'adjusted_xgot',
    name: 'Adjusted Expected Goals On Target',
    description: 'xGOT recente ajustado pela força do adversário.',
    formula: 'recency_weighted_xgot * opponent_strength_coefficient',
    version: '1.0.0',
    ownerEngine: 'OpponentStrengthEngine',
    dependencies: ['recency.xgot', 'opponentStrength.coefficient'],
    valueType: 'number',
    validRange: [0, 6],
  },
  {
    id: 'adjusted_shots',
    name: 'Adjusted Shots',
    description: 'Volume recente de finalizações ajustado pela força do adversário.',
    formula: 'recency_weighted_shots * opponent_strength_coefficient',
    version: '1.0.0',
    ownerEngine: 'OpponentStrengthEngine',
    dependencies: ['recency.shots', 'opponentStrength.coefficient'],
    valueType: 'number',
    validRange: [0, 40],
  },
  {
    id: 'adjusted_shots_on_target',
    name: 'Adjusted Shots On Target',
    description: 'Finalizações no alvo ajustadas pela força do adversário.',
    formula: 'recency_weighted_shots_on_target * opponent_strength_coefficient',
    version: '1.0.0',
    ownerEngine: 'OpponentStrengthEngine',
    dependencies: ['recency.shotsOnTarget', 'opponentStrength.coefficient'],
    valueType: 'number',
    validRange: [0, 20],
  },
  {
    id: 'xg_differential',
    name: 'xG Differential',
    description: 'Diferença entre xG ajustado do mandante e visitante.',
    formula: 'home.adjusted_xg - away.adjusted_xg',
    version: '1.0.0',
    ownerEngine: 'ProjectionPipeline',
    dependencies: ['home.adjusted_xg', 'away.adjusted_xg'],
    valueType: 'number',
    validRange: [-6, 6],
  },
  {
    id: 'offensive_volume_index',
    name: 'Offensive Volume Index',
    description: 'Índice simples de volume ofensivo combinando finalizações e finalizações no alvo.',
    formula: '(adjusted_shots * 0.55) + (adjusted_shots_on_target * 1.35)',
    version: '1.0.0',
    ownerEngine: 'FeatureStore',
    dependencies: ['adjusted_shots', 'adjusted_shots_on_target'],
    valueType: 'number',
    validRange: [0, 50],
  },
];

function getFeatureDefinition(featureId) {
  return FEATURE_CATALOG.find((feature) => feature.id === featureId);
}

export { FEATURE_CATALOG, getFeatureDefinition };
