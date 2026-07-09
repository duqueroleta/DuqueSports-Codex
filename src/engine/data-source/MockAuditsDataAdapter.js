import { markets } from '../../data/markets.js';
import { validateAuditsData } from './DataAdapterValidationService.js';

const MOCK_AUDITS_DATA_ADAPTER_MODEL = 'mock-audits-data-adapter-v1';

function createMockAuditsDataAdapter() {
  const audits = markets.map((market) => ({
    marketId: market.id,
    marketName: market.name,
    status: market.audit,
    risk: market.risk,
    trend: market.trend,
  }));
  const validation = validateAuditsData(audits);

  return {
    model: MOCK_AUDITS_DATA_ADAPTER_MODEL,
    source: 'mock-audits-dataset',
    freshness: 'mock-current-state',
    provider: 'duque-score-local',
    validation,
    audits,
    totals: {
      audits: audits.length,
      monitoredAudits: audits.filter((audit) => audit.status === 'Monitorar').length,
    },
  };
}

export { MOCK_AUDITS_DATA_ADAPTER_MODEL, createMockAuditsDataAdapter };
