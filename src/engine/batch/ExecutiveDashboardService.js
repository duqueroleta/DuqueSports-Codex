import { runMarketAuditDashboardService } from './MarketAuditDashboardService.js';
import { runMarketRankingService } from './MarketRankingService.js';

function countLiveMatches(matches) {
  return matches.filter((match) => match.status === 'Ao vivo').length;
}

function runExecutiveDashboardService({ matches, markets, batchAnalysis }) {
  const marketRanking = runMarketRankingService(batchAnalysis.opportunities);
  const auditDashboard = runMarketAuditDashboardService({ markets, opportunities: batchAnalysis.opportunities });
  const eliteOpportunities = batchAnalysis.opportunities.filter((opportunity) => opportunity.tier === 'Elite');
  const topMarket = marketRanking.rankings[0] ?? null;

  return {
    model: 'executive-dashboard-service-v1',
    engineVersion: 'phase-13',
    totals: {
      matches: matches.length,
      liveMatches: countLiveMatches(matches),
      opportunities: batchAnalysis.opportunities.length,
      eliteOpportunities: eliteOpportunities.length,
      rankedMarkets: marketRanking.rankings.length,
      auditedMarkets: auditDashboard.marketAudits.length,
    },
    quality: {
      averageOpportunityScore: batchAnalysis.averageOpportunityScore,
      averageAuditHitRate: auditDashboard.averageHitRate,
      averageStability: auditDashboard.averageStability,
      consistentMarkets: auditDashboard.consistentMarkets,
    },
    highlights: {
      topOpportunity: batchAnalysis.topOpportunities[0] ?? null,
      topMarket,
      topAudit: auditDashboard.marketAudits[0] ?? null,
    },
  };
}

export { runExecutiveDashboardService };
