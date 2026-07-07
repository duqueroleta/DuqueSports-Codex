import ErrorState from '../components/error/ErrorState.jsx';
import SkeletonGrid from '../components/loading/SkeletonGrid.jsx';
import CompetitionRail, { ALL_COMPETITIONS } from '../components/competitions/CompetitionRail.jsx';
import MatchCard from '../components/matches/MatchCard.jsx';
import { useSearch } from '../context/SearchContext.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { getMatches } from '../services/matchesService.js';
import '../styles/page-matches.css';
import { itemMatchesSearch } from '../utils/search.js';

const filters = ['Todos', 'Ao vivo', 'Pré-jogo', 'Alta confiança', 'Over', 'BTTS'];

function filterMatches(match, filter) {
  if (filter === 'Todos') {
    return true;
  }

  if (filter === 'Ao vivo' || filter === 'Pré-jogo') {
    return match.status === filter;
  }

  if (filter === 'Alta confiança') {
    return match.confidence >= 80;
  }

  if (filter === 'Over') {
    return match.signal.includes('Over');
  }

  if (filter === 'BTTS') {
    return match.metrics.some((metric) => metric.includes('BTTS')) || match.signal === 'Ambas marcam';
  }

  return true;
}

function MatchesPage() {
  const [activeFilter, setActiveFilter] = usePersistentState('duque.filters.matches', 'Todos');
  const [activeCompetition, setActiveCompetition] = usePersistentState(
    'duque.filters.matches.competition',
    ALL_COMPETITIONS,
  );
  const { searchTerm } = useSearch();
  const { data: matches, error, isLoading, retry } = useAsyncData(getMatches, []);
  const filteredMatches = matches.filter(
    (match) => {
      const matchesCompetition = activeCompetition === ALL_COMPETITIONS || match.league === activeCompetition;

      return matchesCompetition && filterMatches(match, activeFilter) && itemMatchesSearch(match, searchTerm);
    },
  );
  const averageConfidence = filteredMatches.length
    ? Math.round(filteredMatches.reduce((total, match) => total + match.confidence, 0) / filteredMatches.length)
    : 0;

  return (
    <main className="matches-page">
      <section className="matches-page-hero" aria-labelledby="matches-page-title">
        <div>
          <span>Centro de partidas</span>
          <h1 id="matches-page-title">Jogos monitorados pela IA</h1>
          <p>
            Partidas priorizadas por leitura estatística, força do sinal e confiança operacional.
          </p>
        </div>

        <aside className="matches-page-summary">
          <span>Confiança média</span>
          <strong>{averageConfidence}%</strong>
          <p>{filteredMatches.length} jogos priorizados hoje</p>
        </aside>
      </section>

      <CompetitionRail activeCompetition={activeCompetition} onSelect={setActiveCompetition} />

      <section className="matches-toolbar" aria-label="Filtros de jogos">
        {filters.map((filter) => (
          <button
            aria-pressed={activeFilter === filter}
            className={activeFilter === filter ? 'matches-filter-active' : ''}
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </section>

      <section className="matches-page-grid" aria-label="Lista de jogos">
        {isLoading ? <SkeletonGrid count={6} /> : null}
        {error ? <ErrorState onRetry={retry} /> : null}
        {!isLoading
          && !error
          ? filteredMatches.map((match) => <MatchCard key={match.id} match={match} />)
          : null}
        {!isLoading && !error && !filteredMatches.length ? <p className="search-empty">Nenhum jogo encontrado.</p> : null}
      </section>
    </main>
  );
}

export default MatchesPage;
