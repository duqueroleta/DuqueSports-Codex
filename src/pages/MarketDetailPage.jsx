import { useParams } from 'react-router-dom';
import DetailHero from '../components/detail/DetailHero.jsx';
import DetailPageState, { resolveDetailPageState } from '../components/detail/DetailPageState.jsx';
import MarketAuditPanel from '../components/markets/detail/MarketAuditPanel.jsx';
import MarketIntelligencePanel from '../components/markets/detail/MarketIntelligencePanel.jsx';
import MarketRecommendationPanel from '../components/markets/detail/MarketRecommendationPanel.jsx';
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

  if (detailState) {
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
    <main className="detail-page">
      <DetailHero
        backHref="/mercados"
        backLabel="Voltar para Mercados"
        description={market.insight}
        eyebrow="Radar de mercado"
        scoreCaption={`Tendência ${market.trend}`}
        scoreLabel="Força IA"
        scoreValue={`${market.strength}%`}
        title={market.name}
        titleId="market-detail-title"
      />

      <MarketIntelligencePanel intelligence={marketIntelligence} />
      <MarketAuditPanel audit={marketIntelligence?.audit} />
      <MarketRecommendationPanel market={market} />
    </main>
  );
}

export default MarketDetailPage;
