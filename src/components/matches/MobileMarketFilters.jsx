import '../../styles/mobile-market-filters.css';
import { MARKET_FILTERS } from '../../utils/marketFilters.js';

function MobileMarketFilters({ activeMarket, onSelect }) {
  return (
    <div className="mobile-market-filters" aria-label="Filtros rápidos por mercado">
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
  );
}

export default MobileMarketFilters;
