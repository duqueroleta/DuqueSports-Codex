const analysisFilters = [
  { label: 'Todos', value: 'all' },
  { label: 'Elite', value: 'elite' },
  { label: 'Alta confiança', value: 'confidence' },
  { label: 'Menor risco', value: 'risk' },
];

function AnalysisToolbar({ activeFilter, onFilterChange, onSortChange, sortBy }) {
  return (
    <section className="analyses-toolbar" aria-label="Filtros de análises">
      <div>
        {analysisFilters.map((filter) => (
          <button
            aria-pressed={activeFilter === filter.value}
            className={activeFilter === filter.value ? 'analyses-filter-active' : ''}
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </div>
      <label>
        <span>Ordenar</span>
        <select onChange={(event) => onSortChange(event.target.value)} value={sortBy}>
          <option value="score">Melhor score</option>
          <option value="probability">Maior probabilidade</option>
          <option value="confidence">Maior confiança</option>
        </select>
      </label>
    </section>
  );
}

export default AnalysisToolbar;
