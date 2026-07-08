import { ENGINE_VERSION } from '../core/contracts.js';
import { runMarketAuditDashboardService } from '../batch/MarketAuditDashboardService.js';
import { runMarketRankingService } from '../batch/MarketRankingService.js';

function createSnapshotId({ matchesCount, marketsCount, opportunitiesCount }) {
  return `duque-${ENGINE_VERSION}-${matchesCount}m-${marketsCount}mk-${opportunitiesCount}op`;
}

function runEngineSnapshotService({ matches, markets, batchAnalysis, executiveDashboard }) {
  const marketRanking = runMarketRankingService(batchAnalysis.opportunities);
  const auditDashboard = runMarketAuditDashboardService({ markets, opportunities: batchAnalysis.opportunities });

  return {
    model: 'engine-snapshot-service-v1',
    snapshotId: createSnapshotId({
      matchesCount: matches.length,
      marketsCount: markets.length,
      opportunitiesCount: batchAnalysis.opportunities.length,
    }),
    createdAt: 'mock-current-state',
    engineVersion: ENGINE_VERSION,
    scope: 'mock-state',
    totals: executiveDashboard.totals,
    quality: executiveDashboard.quality,
    topOpportunities: batchAnalysis.topOpportunities.slice(0, 3).map((opportunity) => ({
      matchId: opportunity.matchId,
      label: `${opportunity.home} x ${opportunity.away}`,
      tier: opportunity.tier,
      opportunityScore: opportunity.opportunityScore,
      market: opportunity.signal,
    })),
    topMarkets: marketRanking.rankings.slice(0, 3).map((market) => ({
      marketName: market.marketName,
      averageScore: market.averageScore,
      averageProbability: market.averageProbability,
      opportunitiesCount: market.opportunitiesCount,
    })),
    auditSummary: auditDashboard.marketAudits.slice(0, 3).map((audit) => ({
      marketName: audit.marketName,
      hitRate: audit.hitRate,
      stabilityScore: audit.stabilityScore,
      priority: audit.priority,
    })),
  };
}

export { runEngineSnapshotService };
