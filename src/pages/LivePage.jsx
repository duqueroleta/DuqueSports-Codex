import LiveMatchCard from '../components/live/LiveMatchCard.jsx';
import ErrorState from '../components/error/ErrorState.jsx';
import SkeletonGrid from '../components/loading/SkeletonGrid.jsx';
import { useSearch } from '../context/SearchContext.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { getLiveMatches } from '../services/liveService.js';
import '../styles/page-live.css';
import { calculateAverageLivePressure, formatLivePressure } from '../utils/liveMatchPresentation.js';
import { itemMatchesSearch } from '../utils/search.js';

const filters = ['Todos', 'Pressao alta', 'Gols', 'Escanteios', 'Reta final'];

function filterLiveMatches(match, filter) {
  if (filter === 'Todos') {
    return true;
  }

  if (filter === 'Pressao alta') {
    return match.pressure >= 78;
  }

  if (filter === 'Gols') {
    return match.signal.toLowerCase().includes('gol') || match.signal.includes('Over');
  }

  if (filter === 'Escanteios') {
    return match.signal.includes('Escanteios');
  }

  if (filter === 'Reta final') {
    return match.minute >= 70;
  }

  return true;
}

function getLeadMatch(matches) {
  return [...matches].sort((first, second) => (second.pressure ?? 0) - (first.pressure ?? 0))[0];
}

function LivePage() {
  const [activeFilter, setActiveFilter] = usePersistentState('duque.filters.live', 'Todos');
  const { searchTerm } = useSearch();
  const { data: liveMatches, error, isLoading, retry } = useAsyncData(getLiveMatches, []);
  const filteredMatches = liveMatches.filter(
    (match) => filterLiveMatches(match, activeFilter) && itemMatchesSearch(match, searchTerm),
  );
  const highPressureCount = liveMatches.filter((match) => match.pressure >= 78).length;
  const averagePressure = calculateAverageLivePressure(liveMatches);
  const leadMatch = getLeadMatch(filteredMatches.length ? filteredMatches : liveMatches);

  return (
    <main className="live-page">
      <section className="live-page-hero" aria-labelledby="live-page-title">
        <div className="live-page-hero-copy">
          <span>Central ao vivo</span>
          <h1 id="live-page-title">Sinais ao vivo em segundos</h1>
          <p>Placar, minuto, pressao e mercado recomendado em uma leitura rapida.</p>
        </div>

        <aside className="live-page-summary" aria-label="Resumo do monitor ao vivo">
          <div>
            <span>Alertas</span>
            <strong>{highPressureCount}</strong>
            <small>zona quente</small>
          </div>
          <div>
            <span>Pressao media</span>
            <strong>{formatLivePressure(averagePressure)}</strong>
            <small>{liveMatches.length} jogos live</small>
          </div>
          <div>
            <span>Destaque</span>
            <strong>{leadMatch?.pressure ?? '--'}%</strong>
            <small>{leadMatch ? `${leadMatch.home} x ${leadMatch.away}` : 'sem jogo'}</small>
          </div>
        </aside>
      </section>

      <section className="live-toolbar" aria-label="Filtros ao vivo">
        {filters.map((filter) => (
          <button
            aria-pressed={activeFilter === filter}
            className={activeFilter === filter ? 'live-filter-active' : ''}
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
        <span>{filteredMatches.length} partidas</span>
      </section>

      <section className="live-grid" aria-label="Carrossel de partidas ao vivo">
        {isLoading ? <SkeletonGrid count={3} /> : null}
        {error ? <ErrorState onRetry={retry} /> : null}
        {!isLoading
          && !error
          ? filteredMatches.map((match) => <LiveMatchCard key={match.id} match={match} />)
          : null}
        {!isLoading && !error && !filteredMatches.length ? (
          <p className="search-empty">Nenhuma partida ao vivo encontrada.</p>
        ) : null}
      </section>
    </main>
  );
}

export default LivePage;
