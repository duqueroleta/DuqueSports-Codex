import assert from 'node:assert/strict';
import { markets } from '../../src/data/markets.js';
import { matches } from '../../src/data/matches.js';
import { runBatchAnalysis } from '../../src/engine/batch/BatchAnalysisService.js';
import { ALL_MARKETS, ALL_TIERS, filterBatchOpportunities, getBatchFilterOptions } from '../../src/engine/batch/BatchFilters.js';
import { runExecutiveDashboardService } from '../../src/engine/batch/ExecutiveDashboardService.js';
import { runMarketAuditDashboardService } from '../../src/engine/batch/MarketAuditDashboardService.js';
import { runMarketAuditService } from '../../src/engine/batch/MarketAuditService.js';
import { runMarketDetailIntelligence } from '../../src/engine/batch/MarketDetailIntelligenceService.js';
import { ALL_MARKET_COMPETITIONS, filterMarketRankings, runMarketRankingService } from '../../src/engine/batch/MarketRankingService.js';
import { MARKET_LIST_FILTERS, matchMarketListFilter } from '../../src/utils/marketFilters.js';
import { getStrongestMarket } from '../../src/utils/marketStats.js';

assert.equal(MARKET_LIST_FILTERS.length, 6, 'Market list should expose six filters');
assert.equal(
  markets.filter((market) => matchMarketListFilter(market, 'Todos')).length,
  8,
  'All filter should preserve every market',
);
assert.equal(
  markets.filter((market) => matchMarketListFilter(market, 'Gols')).length,
  3,
  'Goals filter should select goals markets',
);
assert.equal(
  markets.filter((market) => matchMarketListFilter(market, 'Resultado')).length,
  2,
  'Result filter should select result markets',
);
assert.equal(
  markets.filter((market) => matchMarketListFilter(market, 'Escanteios')).length,
  1,
  'Corners filter should select corners markets',
);
assert.equal(
  markets.filter((market) => matchMarketListFilter(market, 'Baixo risco')).length,
  4,
  'Low-risk filter should include controlled markets',
);
assert.equal(
  markets.filter((market) => matchMarketListFilter(market, 'Alta for\u00e7a')).length,
  2,
  'High-strength filter should enforce the threshold',
);
assert.equal(getStrongestMarket(markets)?.id, 1, 'Market summary should select the strongest market');
assert.equal(getStrongestMarket([]), null, 'Market summary should support an empty collection');

const batchAnalysis = runBatchAnalysis(matches);

assert.equal(batchAnalysis.model, 'batch-analysis-service-v1', 'Batch Analysis Service should expose its model');
assert.equal(batchAnalysis.analyzedMatches, matches.length, 'Batch Analysis Service should process every mock match');
assert.equal(batchAnalysis.topOpportunities.length, 5, 'Batch Analysis Service should expose top five opportunities');
assert.ok(
  batchAnalysis.topOpportunities[0].opportunityScore >= batchAnalysis.topOpportunities[1].opportunityScore,
  'Batch Analysis Service should sort opportunities by score',
);

const batchFilterOptions = getBatchFilterOptions(batchAnalysis.opportunities);
const eliteOpportunities = filterBatchOpportunities(batchAnalysis.opportunities, { tier: 'Elite', market: ALL_MARKETS });

assert.ok(batchFilterOptions.tiers.includes(ALL_TIERS), 'Batch filters should expose all tiers option');
assert.ok(batchFilterOptions.markets.includes(ALL_MARKETS), 'Batch filters should expose all markets option');
assert.ok(eliteOpportunities.every((opportunity) => opportunity.tier === 'Elite'), 'Batch tier filter should narrow opportunities');

const marketRanking = runMarketRankingService(batchAnalysis.opportunities);
const filteredMarketRanking = filterMarketRankings(marketRanking.rankings, ALL_MARKET_COMPETITIONS);

assert.equal(marketRanking.model, 'market-ranking-service-v1', 'Market Ranking Service should expose its model');
assert.ok(marketRanking.rankings.length > 0, 'Market Ranking Service should expose market rankings');
assert.equal(filteredMarketRanking.length, marketRanking.rankings.length, 'All competitions filter should preserve market rankings');

const marketDetailIntelligence = runMarketDetailIntelligence({
  market: markets[0],
  opportunities: batchAnalysis.opportunities,
});

assert.equal(
  marketDetailIntelligence.model,
  'market-detail-intelligence-v1',
  'Market Detail Intelligence should expose its model',
);
assert.ok(
  marketDetailIntelligence.summary.relatedGames >= 0,
  'Market Detail Intelligence should expose related games count',
);
assert.equal(
  marketDetailIntelligence.audit.model,
  'market-audit-service-v1',
  'Market Detail Intelligence should expose simulated audit',
);

const marketAudit = runMarketAuditService({
  market: markets[0],
  relatedOpportunities: marketDetailIntelligence.relatedOpportunities,
});

assert.ok(marketAudit.hitRate >= 42 && marketAudit.hitRate <= 88, 'Market audit hit rate should stay calibrated');
assert.ok(marketAudit.stabilityScore >= 35 && marketAudit.stabilityScore <= 94, 'Market audit stability should stay bounded');

const auditDashboard = runMarketAuditDashboardService({ markets, opportunities: batchAnalysis.opportunities });

assert.equal(auditDashboard.model, 'market-audit-dashboard-v1', 'Market audit dashboard should expose its model');
assert.equal(auditDashboard.marketAudits.length, markets.length, 'Market audit dashboard should audit every market');
assert.ok(auditDashboard.averageHitRate >= 42, 'Market audit dashboard should expose average hit rate');

const executiveDashboard = runExecutiveDashboardService({ matches, markets, batchAnalysis });

assert.equal(executiveDashboard.model, 'executive-dashboard-service-v1', 'Executive dashboard should expose its model');
assert.equal(executiveDashboard.totals.matches, matches.length, 'Executive dashboard should count matches');
assert.equal(executiveDashboard.totals.auditedMarkets, markets.length, 'Executive dashboard should count audited markets');

console.log('Engine market domain tests passed');
