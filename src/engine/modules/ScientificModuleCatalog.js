const IMPLEMENTED_MODULES = Object.freeze([
  {
    id: 'DSM-001',
    name: 'Data Quality Engine',
    status: 'implemented',
    layer: 'governance',
  },
  {
    id: 'DSM-002',
    name: 'Recency Engine',
    status: 'implemented',
    layer: 'preprocessing',
  },
  {
    id: 'DSM-003',
    name: 'Opponent Strength Engine',
    status: 'implemented',
    layer: 'preprocessing',
  },
  {
    id: 'DSM-004',
    name: 'Feature Store',
    status: 'implemented',
    layer: 'feature-store',
  },
  {
    id: 'DSM-005',
    name: 'Poisson Goals Engine',
    status: 'implemented',
    layer: 'statistical',
  },
  {
    id: 'DSM-006',
    name: 'Probability Calibration Engine',
    status: 'implemented',
    layer: 'calibration',
  },
  {
    id: 'DSM-007',
    name: 'Explanation Engine',
    status: 'implemented',
    layer: 'ai-layer',
  },
  {
    id: 'DSM-008',
    name: 'Opportunity Ranking Engine',
    status: 'implemented',
    layer: 'ranking',
  },
  {
    id: 'DSM-009',
    name: 'Probable Statistics Engine',
    status: 'implemented',
    layer: 'statistical',
  },
  {
    id: 'DSM-010',
    name: 'Duque Score Calibration Engine',
    status: 'implemented',
    layer: 'calibration',
  },
  {
    id: 'DSM-011',
    name: 'Competitive Context Engine',
    status: 'implemented',
    layer: 'context',
  },
  {
    id: 'DSM-012',
    name: 'Discrete Distribution Engine',
    status: 'implemented',
    layer: 'forecasting',
  },
  {
    id: 'DSM-013',
    name: 'Forecast Ensemble Engine',
    status: 'implemented',
    layer: 'forecasting',
  },
  {
    id: 'DSM-014',
    name: 'Game State Forecast Scenario Engine',
    status: 'implemented',
    layer: 'forecasting',
  },
  {
    id: 'DSM-015',
    name: 'Monte Carlo Forecast Engine',
    status: 'implemented',
    layer: 'forecasting',
  },
  {
    id: 'DSM-016',
    name: 'Forecast Intelligence Layer',
    status: 'implemented',
    layer: 'forecasting',
  },
  {
    id: 'DSM-017',
    name: 'Forecast Distribution Audit Engine',
    status: 'implemented',
    layer: 'audit',
  },
]);

function buildPendingModule(index) {
  return {
    id: `DSM-${String(index).padStart(3, '0')}`,
    name: `Scientific module ${index}`,
    status: 'planned',
    layer: 'scientific-roadmap',
  };
}

const SCIENTIFIC_MODULE_CATALOG = Object.freeze([
  ...IMPLEMENTED_MODULES,
  ...Array.from({ length: 160 - IMPLEMENTED_MODULES.length }, (_, index) => (
    buildPendingModule(index + IMPLEMENTED_MODULES.length + 1)
  )),
]);

function getScientificModuleCatalogSnapshot() {
  const implemented = SCIENTIFIC_MODULE_CATALOG.filter((module) => module.status === 'implemented');

  return {
    implementedCount: implemented.length,
    implementedModules: implemented.map((module) => module.id),
    plannedCount: SCIENTIFIC_MODULE_CATALOG.length - implemented.length,
    totalModules: SCIENTIFIC_MODULE_CATALOG.length,
    version: 'scientific-module-catalog-v1',
  };
}

export { SCIENTIFIC_MODULE_CATALOG, getScientificModuleCatalogSnapshot };
