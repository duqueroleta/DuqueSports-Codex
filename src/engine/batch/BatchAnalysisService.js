import { adaptMatchToEngineInput } from '../adapters/mockMatchAdapter.js';
import { runProjectionPipeline } from '../projection/ProjectionPipeline.js';

function buildBatchItem(match) {
  const projection = runProjectionPipeline(adaptMatchToEngineInput(match));

  return {
    matchId: match.id,
    home: match.home,
    away: match.away,
    league: match.league,
    time: match.time,
    status: match.status,
    signal: projection.aiExplanation.recommendedMarket.market,
    opportunityScore: projection.opportunityRanking.opportunityScore,
    tier: projection.opportunityRanking.tier,
    probability: projection.aiExplanation.recommendedMarket.probability,
    confidence: projection.confidence,
    dataQualityScore: projection.dataQualityScore,
    risk: projection.aiExplanation.riskFlags[0],
    projection,
  };
}

function runBatchAnalysis(matches) {
  const opportunities = matches
    .map(buildBatchItem)
    .sort((left, right) => right.opportunityScore - left.opportunityScore);
  const topOpportunities = opportunities.slice(0, 5);
  const averageOpportunityScore = topOpportunities.length
    ? Math.round(topOpportunities.reduce((total, item) => total + item.opportunityScore, 0) / topOpportunities.length)
    : 0;

  return {
    model: 'batch-analysis-service-v1',
    analyzedMatches: opportunities.length,
    averageOpportunityScore,
    topOpportunities,
    opportunities,
  };
}

export { runBatchAnalysis };
