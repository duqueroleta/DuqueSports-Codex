import { runMarketDetailIntelligence } from './MarketDetailIntelligenceService.js';

function getAuditPriority(audit) {
  if (audit.stabilityScore >= 82 && audit.hitRate >= 72) {
    return 'Consistente';
  }

  if (audit.volatility >= 34) {
    return 'Volatil';
  }

  if (audit.hitRate < 58) {
    return 'Revisar';
  }

  return 'Monitorar';
}

function runMarketAuditDashboardService({ markets, opportunities }) {
  const marketAudits = markets
    .map((market) => {
      const intelligence = runMarketDetailIntelligence({ market, opportunities });

      return {
        marketId: market.id,
        marketName: market.name,
        relatedGames: intelligence.summary.relatedGames,
        averageScore: intelligence.summary.averageScore,
        hitRate: intelligence.audit.hitRate,
        volatility: intelligence.audit.volatility,
        stabilityScore: intelligence.audit.stabilityScore,
        stabilityTier: intelligence.audit.stabilityTier,
        priority: getAuditPriority(intelligence.audit),
        topOpportunity: intelligence.summary.topOpportunity,
      };
    })
    .sort((left, right) => right.stabilityScore - left.stabilityScore);
  const averageHitRate = marketAudits.length
    ? Math.round(marketAudits.reduce((total, audit) => total + audit.hitRate, 0) / marketAudits.length)
    : 0;
  const averageStability = marketAudits.length
    ? Math.round(marketAudits.reduce((total, audit) => total + audit.stabilityScore, 0) / marketAudits.length)
    : 0;

  return {
    model: 'market-audit-dashboard-v1',
    averageHitRate,
    averageStability,
    consistentMarkets: marketAudits.filter((audit) => audit.priority === 'Consistente').length,
    marketAudits,
  };
}

export { runMarketAuditDashboardService };
