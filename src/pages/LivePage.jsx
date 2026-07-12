import ErrorState from '../components/error/ErrorState.jsx';
import SkeletonGrid from '../components/loading/SkeletonGrid.jsx';
import LiveMatchCard from '../components/live/LiveMatchCard.jsx';
import { useSearch } from '../context/SearchContext.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { getLiveMatches } from '../services/liveService.js';
import '../styles/page-live.css';
import { calculateAverageLivePressure, formatLivePressure } from '../utils/liveMatchPresentation.js';
import { itemMatchesSearch } from '../utils/search.js';

const filters = ['Todos', 'Pressao alta', 'Gols', 'Escanteios', 'Segundo tempo'];

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

  if (filter === 'Segundo tempo') {
    return match.minute >= 46;
  }

  return true;
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

  return (
    <main className="live-page">
      <section className="live-page-hero" aria-labelledby="live-page-title">
        <div>
          <span>Monitor live</span>
          <h1 id="live-page-title">Sinais ao vivo com leitura de pressao</h1>
          <p>
            Monitoramento de jogos em andamento com minuto, placar, intensidade ofensiva e
            alertas estatisticos em tempo real.
          </p>

          <div className="live-page-metrics" aria-label="Resumo do monitor ao vivo">
            <strong>{liveMatches.length} jogos live</strong>
            <strong>{formatLivePressure(averagePressure)} pressao media</strong>
            <strong>{filteredMatches.length} no filtro atual</strong>
          </div>
        </div>

        <aside className="live-page-summary">
          <span>Alertas ativos</span>
          <strong>{highPressureCount}</strong>
          <p>jogos em zona de oportunidade</p>
          <small>Atualizacao simulada em tempo real</small>
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
      </section>

      <section className="live-grid" aria-label="Partidas ao vivo">
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
