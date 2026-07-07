import ErrorState from '../components/error/ErrorState.jsx';
import SkeletonGrid from '../components/loading/SkeletonGrid.jsx';
import MarketStrengthCard from '../components/markets/MarketStrengthCard.jsx';
import { useSearch } from '../context/SearchContext.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { getMarkets } from '../services/marketsService.js';
import '../styles/page-markets.css';
import { itemMatchesSearch } from '../utils/search.js';

const filters = ['Todos', 'Gols', 'Resultado', 'Escanteios', 'Baixo risco', 'Alta força'];

function filterMarkets(market, filter) {
  if (filter === 'Todos') {
    return true;
  }

  if (filter === 'Gols') {
    return market.name.includes('gols') || market.name.includes('Over') || market.name.includes('Under');
  }

  if (filter === 'Resultado') {
    return market.name.includes('vence') || market.name.includes('Empate');
  }

  if (filter === 'Escanteios') {
    return market.name.includes('Escanteios');
  }

  if (filter === 'Baixo risco') {
    return market.risk === 'Baixo' || market.risk === 'Controlado';
  }

  if (filter === 'Alta força') {
    return market.strength >= 85;
  }

  return true;
}

function MarketsPage() {
  const [activeFilter, setActiveFilter] = usePersistentState('duque.filters.markets', 'Todos');
  const { searchTerm } = useSearch();
  const { data: markets, error, isLoading, retry } = useAsyncData(getMarkets, []);
  const filteredMarkets = markets.filter(
    (market) => filterMarkets(market, activeFilter) && itemMatchesSearch(market, searchTerm),
  );

  return (
    <main className="markets-page">
      <section className="markets-page-hero" aria-labelledby="markets-page-title">
        <div>
          <span>Radar de mercados</span>
          <h1 id="markets-page-title">Ranking completo de oportunidades</h1>
          <p>
            Mercados classificados por força estatística, risco operacional, preço médio e
            consistência de auditoria.
          </p>
        </div>

        <aside className="markets-page-summary">
          <span>Melhor mercado</span>
          <strong>91%</strong>
          <p>Over 2.5 gols lidera o radar atual</p>
        </aside>
      </section>

      <section className="markets-toolbar" aria-label="Filtros de mercados">
        {filters.map((filter) => (
          <button
            aria-pressed={activeFilter === filter}
            className={activeFilter === filter ? 'markets-filter-active' : ''}
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </section>

      <section className="markets-page-grid" aria-label="Lista de mercados">
        {isLoading ? <SkeletonGrid count={8} /> : null}
        {error ? <ErrorState onRetry={retry} /> : null}
        {!isLoading
          && !error
          ? filteredMarkets.map((market) => <MarketStrengthCard key={market.id} market={market} />)
          : null}
        {!isLoading && !error && !filteredMarkets.length ? <p className="search-empty">Nenhum mercado encontrado.</p> : null}
      </section>
    </main>
  );
}

export default MarketsPage;
