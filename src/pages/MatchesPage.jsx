import { useState } from 'react';
import CompetitionRail, { ALL_COMPETITIONS } from '../components/competitions/CompetitionRail.jsx';
import ErrorState from '../components/error/ErrorState.jsx';
import SkeletonGrid from '../components/loading/SkeletonGrid.jsx';
import MatchCard from '../components/matches/MatchCard.jsx';
import MatchesAdvancedFilters from '../components/matches/MatchesAdvancedFilters.jsx';
import MatchesDateRail from '../components/matches/MatchesDateRail.jsx';
import { useSearch } from '../context/SearchContext.jsx';
import { ALL_MARKETS, ALL_TIERS, filterBatchOpportunities, getBatchFilterOptions } from '../engine/batch/BatchFilters.js';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { getBatchAnalysis } from '../services/batchAnalysisService.js';
import { getMatches } from '../services/matchesService.js';
import {
  calculateAverageMatchConfidence,
  formatMatchConfidence,
  normalizeMatchConfidence,
} from '../utils/matchConfidence.js';
import { normalizeMatchMetrics } from '../utils/matchMetrics.js';
import { itemMatchesSearch } from '../utils/search.js';
import '../styles/page-matches.css';

const filters = [
  { label: 'Todos', value: 'Todos' },
  { label: 'Ao vivo', value: 'Ao vivo' },
  { label: 'Pre-jogo', value: 'Pre-jogo' },
  { label: 'Alta confianca', value: 'Alta confianca' },
  { label: 'Over', value: 'Over' },
  { label: 'BTTS', value: 'BTTS' },
];

function filterMatches(match, filter) {
  if (filter === 'Todos') {
    return true;
  }

  if (filter === 'Ao vivo' || filter === 'Pre-jogo') {
    return match.status === filter;
  }

  if (filter === 'Alta confianca') {
    return (normalizeMatchConfidence(match.confidence) ?? -1) >= 80;
  }

  if (filter === 'Over') {
    return match.signal.includes('Over');
  }

  if (filter === 'BTTS') {
    return normalizeMatchMetrics(match.metrics).some((metric) => metric.includes('BTTS'))
      || match.signal === 'Ambas marcam';
  }

  return true;
}

function MatchesPage() {
  const [activeDay, setActiveDay] = useState(0);
  const [visibleCount, setVisibleCount] = useState(6);
  const [activeFilter, setActiveFilter] = usePersistentState('duque.filters.matches', 'Todos');
  const [activeCompetition, setActiveCompetition] = usePersistentState(
    'duque.filters.matches.competition',
    ALL_COMPETITIONS,
  );
  const [activeTier, setActiveTier] = usePersistentState('duque.filters.matches.tier', ALL_TIERS);
  const [activeMarket, setActiveMarket] = usePersistentState('duque.filters.matches.market', ALL_MARKETS);
  const { searchTerm } = useSearch();
  const { data: matches, error, isLoading, retry } = useAsyncData(getMatches, []);
  const { data: batchAnalysis } = useAsyncData(getBatchAnalysis, [], null);
  const opportunities = batchAnalysis?.opportunities ?? [];
  const batchOptions = getBatchFilterOptions(opportunities);
  const filteredOpportunityIds = new Set(
    filterBatchOpportunities(opportunities, { tier: activeTier, market: activeMarket })
      .map((opportunity) => opportunity.matchId),
  );
  const filteredMatches = matches.filter((match) => {
    const matchesCompetition = activeCompetition === ALL_COMPETITIONS || match.league === activeCompetition;
    const matchesRanking = opportunities.length === 0 || filteredOpportunityIds.has(match.id);

    return activeDay === 0
      && matchesCompetition
      && matchesRanking
      && filterMatches(match, activeFilter)
      && itemMatchesSearch(match, searchTerm);
  });
  const averageConfidence = calculateAverageMatchConfidence(filteredMatches);
  const visibleMatches = filteredMatches.slice(0, visibleCount);

  function resetAdvancedFilters() {
    setActiveTier(ALL_TIERS);
    setActiveMarket(ALL_MARKETS);
  }

  return (
    <main className="matches-page">
      <header className="matches-page-header">
        <div>
          <span>Central de jogos</span>
          <h1>Escolha um jogo em segundos</h1>
        </div>
        <div className="matches-page-summary">
          <span>Confianca media</span>
          <strong>{formatMatchConfidence(averageConfidence)}</strong>
          <small>{filteredMatches.length} partidas</small>
        </div>
      </header>

      <MatchesDateRail activeDay={activeDay} onSelect={setActiveDay} />
      <CompetitionRail activeCompetition={activeCompetition} onSelect={setActiveCompetition} />

      <section className="matches-toolbar" aria-label="Filtros rapidos de jogos">
        {filters.map((filter) => (
          <button
            aria-pressed={activeFilter === filter.value}
            className={activeFilter === filter.value ? 'matches-filter-active' : ''}
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </section>

      <MatchesAdvancedFilters
        activeMarket={activeMarket}
        activeTier={activeTier}
        markets={batchOptions.markets}
        onMarketChange={setActiveMarket}
        onReset={resetAdvancedFilters}
        onTierChange={setActiveTier}
        tiers={batchOptions.tiers}
      />

      <div className="matches-results-heading">
        <div>
          <span>Ranking Duque Score</span>
          <strong>{activeDay === 0 ? 'Jogos de hoje' : 'Agenda selecionada'}</strong>
        </div>
        <small>{filteredMatches.length} resultados</small>
      </div>

      <section className="matches-page-grid" aria-label="Carrossel de jogos">
        {isLoading ? <SkeletonGrid count={6} /> : null}
        {error ? <ErrorState onRetry={retry} /> : null}
        {!isLoading && !error
          ? visibleMatches.map((match) => <MatchCard key={match.id} match={match} />)
          : null}
        {!isLoading && !error && !filteredMatches.length ? (
          <div className="matches-empty-state">
            <strong>Nenhum jogo nesta selecao</strong>
            <p>Escolha Hoje ou ajuste os filtros para visualizar as partidas mockadas.</p>
          </div>
        ) : null}
      </section>

      {visibleCount < filteredMatches.length ? (
        <button
          className="matches-load-more"
          onClick={() => setVisibleCount((count) => count + 6)}
          type="button"
        >
          Mostrar mais jogos
        </button>
      ) : null}
    </main>
  );
}

export default MatchesPage;
