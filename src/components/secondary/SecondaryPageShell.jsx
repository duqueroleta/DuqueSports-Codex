import SecondaryMetricCard from './SecondaryMetricCard.jsx';
import { useSearch } from '../../context/SearchContext.jsx';
import '../../styles/secondary-page.css';
import { itemMatchesSearch } from '../../utils/search.js';

function SecondaryPageShell({ eyebrow, title, description, summary, metrics, children }) {
  const { searchTerm } = useSearch();
  const filteredMetrics = metrics.filter((metric) => itemMatchesSearch(metric, searchTerm));

  return (
    <main className="secondary-page">
      <section className="secondary-hero" aria-labelledby="secondary-page-title">
        <div>
          <span>{eyebrow}</span>
          <h1 id="secondary-page-title">{title}</h1>
          <p>{description}</p>
        </div>

        <aside className="secondary-summary">
          <span>{summary.label}</span>
          <strong>{summary.value}</strong>
          <p>{summary.description}</p>
        </aside>
      </section>

      <section className="secondary-grid" aria-label={`${title} indicadores`}>
        {filteredMetrics.map((metric) => (
          <SecondaryMetricCard key={metric.label} metric={metric} />
        ))}
        {!filteredMetrics.length ? <p className="search-empty">Nenhum indicador encontrado.</p> : null}
      </section>

      {children}
    </main>
  );
}

export default SecondaryPageShell;
