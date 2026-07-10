import { Link, useParams } from 'react-router-dom';
import ErrorState from '../components/error/ErrorState.jsx';
import SkeletonGrid from '../components/loading/SkeletonGrid.jsx';
import MarketIntelligencePanel from '../components/markets/detail/MarketIntelligencePanel.jsx';
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
      <section className="detail-hero" aria-labelledby="market-detail-title">
        <div>
          <Link to="/mercados">Voltar para Mercados</Link>
          <span>Radar de mercado</span>
          <h1 id="market-detail-title">{market.name}</h1>
          <p>{market.insight}</p>
        </div>

        <aside className="detail-score-panel">
          <span>Força IA</span>
          <strong>{market.strength}%</strong>
          <p>Tendência {market.trend}</p>
        </aside>
      </section>

      <MarketIntelligencePanel intelligence={marketIntelligence} />

      {marketIntelligence?.audit ? (
        <section className="market-audit-panel" aria-label="Auditoria historica simulada">
          <div>
            <span>Auditoria historica</span>
            <strong>{marketIntelligence.audit.auditLabel}</strong>
            <p>{marketIntelligence.audit.notes[0]}</p>
          </div>
          <div className="market-audit-grid">
            <article>
              <span>Amostra</span>
              <strong>{marketIntelligence.audit.sampleSize}</strong>
            </article>
            <article>
              <span>Volatilidade</span>
              <strong>{marketIntelligence.audit.volatility}</strong>
            </article>
            <article>
              <span>Estabilidade</span>
              <strong>{marketIntelligence.audit.stabilityScore}</strong>
            </article>
            <article>
              <span>Tier</span>
              <strong>{marketIntelligence.audit.stabilityTier}</strong>
            </article>
          </div>
        </section>
      ) : null}

      <section className="detail-grid" aria-label="Análise do mercado">
        <article className="detail-card detail-card-highlight">
          <span>Odd média</span>
          <strong>{market.averageOdd}</strong>
          <p>Referência de preço para avaliar valor antes da entrada.</p>
        </article>
        <article className="detail-card">
          <span>Risco</span>
          <strong>{market.risk}</strong>
          <p>Classificação operacional de exposição e variância esperada.</p>
        </article>
        <article className="detail-card">
          <span>Auditoria</span>
          <strong>{market.audit}</strong>
          <p>Selo baseado em consistência histórica e estabilidade do sinal.</p>
        </article>
        <article className="detail-card">
          <span>Tendência</span>
          <strong>{market.trend}</strong>
          <p>Movimento recente do mercado dentro do radar Duque Score.</p>
        </article>
      </section>
    </main>
  );
}

export default MarketDetailPage;
