import { Link, useParams } from 'react-router-dom';
import DetailHero from '../components/detail/DetailHero.jsx';
import ErrorState from '../components/error/ErrorState.jsx';
import SkeletonGrid from '../components/loading/SkeletonGrid.jsx';
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

  if (isLoading) {
    return (
      <main className="detail-page">
        <section className="detail-grid detail-grid-loading" aria-label="Carregando análise do mercado">
          <SkeletonGrid count={4} />
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="detail-page">
        <section className="detail-grid detail-grid-loading" aria-label="Falha ao carregar análise do mercado">
          <ErrorState onRetry={retry} />
        </section>
      </main>
    );
  }

  if (!market) {
    return (
      <main className="detail-page">
        <section className="detail-empty">
          <h1>Mercado não encontrado</h1>
          <Link to="/mercados">Voltar para Mercados</Link>
        </section>
      </main>
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
