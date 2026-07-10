function MarketsFilterToolbar({ activeFilter, filters, onFilterChange }) {
  return (
    <section className="markets-toolbar" aria-label="Filtros de mercados">
      {filters.map((filter) => (
        <button
          aria-pressed={activeFilter === filter}
          className={activeFilter === filter ? 'markets-filter-active' : ''}
          key={filter}
          onClick={() => onFilterChange(filter)}
          type="button"
        >
          {filter}
        </button>
      ))}
    </section>
  );
}

export default MarketsFilterToolbar;
