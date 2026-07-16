import { useParams } from 'react-router-dom';
import DetailPageState from '../components/detail/DetailPageState.jsx';
import { DETAIL_PAGE_STATES, resolveDetailPageState } from '../components/detail/detailPageState.js';
import MarketAuditPanel from '../components/markets/detail/MarketAuditPanel.jsx';
import MarketDecisionPanel from '../components/markets/detail/MarketDecisionPanel.jsx';
import MarketDetailHero from '../components/markets/detail/MarketDetailHero.jsx';
import MarketDetailNav from '../components/markets/detail/MarketDetailNav.jsx';
import MarketIntelligencePanel from '../components/markets/detail/MarketIntelligencePanel.jsx';
import MarketRecommendationPanel from '../components/markets/detail/MarketRecommendationPanel.jsx';
import MarketRelatedOpportunities from '../components/markets/detail/MarketRelatedOpportunities.jsx';
import { runMarketDetailIntelligence } from '../engine/batch/MarketDetailIntelligenceService.js';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { getBatchAnalysis } from '../services/batchAnalysisService.js';
import { getMarketById } from '../services/marketsService.js';
import '../styles/page-detail.css';

function MarketDetailPage() {
  const { marketId } = useParams();
  const { data: market, error, isLoading, retry } = useAsyncData(() => getMarketById(marketId), [marketId], null);
  const { data: batchAnalysis } = useAsyncData(getBatchAnalysis, [], null);
  const detailState = resolveDetailPageState({ data: market, error, isLoading });

  if (detailState !== DETAIL_PAGE_STATES.READY) {
    return (
      <DetailPageState
        backHref="/mercados"
        backLabel="Voltar para Mercados"
        onRetry={retry}
        resource="mercado"
        state={detailState}
      />
    );
  }

  const marketIntelligence = batchAnalysis
    ? runMarketDetailIntelligence({ market, opportunities: batchAnalysis.opportunities })
    : null;

  return (
    <main className="detail-page market-detail-page-v2">
      <MarketDetailHero market={market} />
      <MarketDecisionPanel market={market} />
      <MarketDetailNav />
      <MarketRelatedOpportunities intelligence={marketIntelligence} />
      <div id="inteligencia-mercado">
        <MarketIntelligencePanel intelligence={marketIntelligence} />
      </div>
      <div id="auditoria-mercado">
        <MarketAuditPanel audit={marketIntelligence?.audit} />
      </div>
      <MarketRecommendationPanel market={market} />
    </main>
  );
}

export default MarketDetailPage;
