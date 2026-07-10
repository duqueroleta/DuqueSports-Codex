import MarketFilterButton from './MarketFilterButton.jsx';
import '../../styles/markets-filter-toolbar.css';

function MarketsFilterToolbar({ activeFilter, filters, onFilterChange }) {
  return (
    <section className="markets-toolbar" aria-label="Filtros de mercados">
      {filters.map((filter) => (
        <MarketFilterButton
          isActive={activeFilter === filter}
          key={filter}
          label={filter}
          onSelect={() => onFilterChange(filter)}
        />
      ))}
    </section>
  );
}

export default MarketsFilterToolbar;
