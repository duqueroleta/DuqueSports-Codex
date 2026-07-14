import MarketStrengthCard from './MarketStrengthCard.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getMarkets } from '../../services/marketsService.js';
import '../../styles/markets-strong.css';

function StrongMarkets() {
  const { data: markets } = useAsyncData(getMarkets, []);
  const featuredMarkets = markets.slice(0, 4);
  const topMarket = featuredMarkets[0];
  const averageStrength = featuredMarkets.length
    ? Math.round(featuredMarkets.reduce((total, market) => total + market.strength, 0) / featuredMarkets.length)
    : 0;
  const lowRiskCount = featuredMarkets.filter((market) => ['Baixo', 'Controlado'].includes(market.risk)).length;

  return (
    <section className="strong-markets" aria-labelledby="strong-markets-title">
      <div className="strong-markets-header">
        <div className="section-heading strong-markets-heading">
          <span>Radar de valor</span>
          <h2 id="strong-markets-title">Mercados Fortes</h2>
          <p>Ranking dos mercados com melhor combinação entre força estatística, odd e controle de risco.</p>
        </div>

        <aside className="strong-markets-summary" aria-label="Resumo dos mercados fortes">
          <span>Melhor sinal agora</span>
          <strong>{topMarket?.name ?? 'Aguardando leitura'}</strong>
          <div>
            <p>{averageStrength}% força média</p>
            <p>{lowRiskCount} mercados com risco controlado</p>
          </div>
        </aside>
      </div>

      <div className="strong-markets-grid">
        {featuredMarkets.map((market, index) => (
          <MarketStrengthCard key={market.id} market={market} rank={index + 1} />
        ))}
      </div>
    </section>
  );
}

export default StrongMarkets;
