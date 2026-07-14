import { Link } from 'react-router-dom';
import '../../../styles/market-detail-hero.css';

function MarketDetailHero({ market }) {
  if (!market) {
    return null;
  }

  return (
    <section className="market-detail-hero-v2" aria-labelledby="market-detail-title">
      <header>
        <Link to="/mercados" aria-label="Voltar para mercados">
          <span aria-hidden="true">&lsaquo;</span>
          Mercados
        </Link>
        <span>Radar de mercado</span>
        <small>{market.trend}</small>
      </header>

      <div className="market-detail-main">
        <div>
          <span>Leitura estatistica</span>
          <h1 id="market-detail-title">{market.name}</h1>
          <p>{market.insight}</p>
        </div>
        <div
          aria-label={`Forca da IA ${market.strength}%`}
          className="market-detail-score"
          style={{ '--market-score-progress': `${market.strength}%` }}
        >
          <div>
            <span>Forca IA</span>
            <strong>{market.strength}%</strong>
            <small>{market.audit}</small>
          </div>
        </div>
      </div>

      <div className="market-detail-metrics" aria-label="Indicadores do mercado">
        <div><span>Risco</span><strong>{market.risk}</strong></div>
        <div><span>Odd media</span><strong>{market.averageOdd}</strong></div>
        <div><span>Auditoria</span><strong>{market.audit}</strong></div>
        <div><span>Tendencia</span><strong>{market.trend}</strong></div>
      </div>
    </section>
  );
}

export default MarketDetailHero;
