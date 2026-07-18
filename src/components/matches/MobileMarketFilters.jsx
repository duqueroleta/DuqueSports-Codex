import '../../styles/mobile-market-filters.css';
import { MARKET_FILTERS } from '../../utils/marketFilters.js';

function MobileMarketFilters({ activeMarket, onSelect }) {
  return (
    <section className="mobile-market-filter-group" aria-label="Filtros rápidos por mercado">
      <div className="mobile-market-filter-label" aria-hidden="true">
        <span>Mercados</span>
        <small>toque para filtrar</small>
      </div>
      <div className="mobile-market-filters">
        {MARKET_FILTERS.map((filter) => (
          <button
            aria-pressed={activeMarket === filter.id}
            className={activeMarket === filter.id ? 'mobile-market-filter-active' : ''}
            key={filter.id}
            onClick={() => onSelect(filter.id)}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default MobileMarketFilters;
