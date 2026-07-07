import MarketStrengthCard from './MarketStrengthCard.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getMarkets } from '../../services/marketsService.js';
import '../../styles/markets-strong.css';

function StrongMarkets() {
  const { data: markets } = useAsyncData(getMarkets, []);

  return (
    <section className="strong-markets" aria-labelledby="strong-markets-title">
      <div className="section-heading strong-markets-heading">
        <span>Radar de valor</span>
        <div>
          <h2 id="strong-markets-title">Mercados Fortes</h2>
          <p>Ranking dos mercados com melhor combinação entre força estatística, odd e controle de risco.</p>
        </div>
      </div>

      <div className="strong-markets-grid">
        {markets.slice(0, 4).map((market) => (
          <MarketStrengthCard key={market.id} market={market} />
        ))}
      </div>
    </section>
  );
}

export default StrongMarkets;
