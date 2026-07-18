import { useEffect, useRef, useState } from 'react';
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
  { label: 'Alta confiança', value: 'Alta confianca' },
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
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const carouselRef = useRef(null);
  const [activeFilter, setActiveFilter] = usePersistentState('duque.filters.matches', 'Todos');
  const [activeCompetition, setActiveCompetition] = usePersistentState(
    'duque.filters.matches.competition',
    ALL_COMPETITIONS,
  );
  const [activeTier, setActiveTier] = usePersistentState('duque.filters.matches.tier', ALL_TIERS);
  const [activeMarket, setActiveMarket] = usePersistentState('duque.filters.matches.market', ALL_MARKETS);
  const { searchTerm, setSearchTerm } = useSearch();
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

  function resetMatchesView() {
    setActiveDay(0);
    setActiveCompetition(ALL_COMPETITIONS);
    setActiveFilter('Todos');
    setVisibleCount(6);
    setSearchTerm('');
    resetAdvancedFilters();
  }

  useEffect(() => {
    setActiveMatchIndex(0);
    carouselRef.current?.scrollTo({ left: 0 });
  }, [activeDay, activeCompetition, activeFilter, activeMarket, activeTier, searchTerm]);

  function updateActiveMatchIndex() {
    if (!carouselRef.current) {
      return;
    }

    const cards = Array.from(carouselRef.current.querySelectorAll('.match-card'));
    if (!cards.length) {
      setActiveMatchIndex(0);
      return;
    }

    const carouselBox = carouselRef.current.getBoundingClientRect();
    const carouselCenter = carouselBox.left + carouselBox.width / 2;
    const closestIndex = cards.reduce((bestIndex, card, index) => {
      const cardBox = card.getBoundingClientRect();
      const cardCenter = cardBox.left + cardBox.width / 2;
      const bestBox = cards[bestIndex].getBoundingClientRect();
      const bestCenter = bestBox.left + bestBox.width / 2;

      return Math.abs(cardCenter - carouselCenter) < Math.abs(bestCenter - carouselCenter)
        ? index
        : bestIndex;
    }, 0);

    setActiveMatchIndex(closestIndex);
  }

  function scrollMatchCarousel(direction) {
    if (!carouselRef.current) {
      return;
    }

    const firstCard = carouselRef.current.querySelector('.match-card');
    const scrollAmount = firstCard?.getBoundingClientRect().width
      ? firstCard.getBoundingClientRect().width + 10
      : carouselRef.current.clientWidth * 0.9;

    carouselRef.current.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth',
    });
  }

  return (
    <main className="matches-page">
      <header className="matches-page-header">
        <div>
          <span>Central de jogos</span>
          <h1>Escolha um jogo em segundos</h1>
        </div>
        <div className="matches-page-summary">
          <span>Confiança média</span>
          <strong>{formatMatchConfidence(averageConfidence)}</strong>
          <small>{filteredMatches.length} partidas</small>
        </div>
      </header>

      <MatchesDateRail activeDay={activeDay} onSelect={setActiveDay} />
      <CompetitionRail activeCompetition={activeCompetition} onSelect={setActiveCompetition} />

      <section className="matches-toolbar" aria-label="Filtros rápidos de jogos">
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
        <div className="matches-carousel-controls" aria-label="Navegação do carrossel de jogos">
          <small>{filteredMatches.length} resultados</small>
          <button
            aria-label="Ver jogo anterior"
            disabled={visibleMatches.length <= 1}
            onClick={() => scrollMatchCarousel(-1)}
            type="button"
          >
            ‹
          </button>
          <button
            aria-label="Ver próximo jogo"
            disabled={visibleMatches.length <= 1}
            onClick={() => scrollMatchCarousel(1)}
            type="button"
          >
            ›
          </button>
        </div>
      </div>

      {visibleMatches.length > 1 ? (
        <div className="matches-carousel-position" aria-label="Posição no carrossel">
          {visibleMatches.map((match, index) => (
            <span
              aria-current={activeMatchIndex === index ? 'true' : undefined}
              aria-label={`Jogo ${index + 1} de ${visibleMatches.length}: ${match.home} contra ${match.away}`}
              className={activeMatchIndex === index ? 'matches-carousel-dot-active' : ''}
              key={match.id}
            />
          ))}
        </div>
      ) : null}

      <section
        className="matches-page-grid"
        ref={carouselRef}
        aria-label="Carrossel de jogos"
        onScroll={updateActiveMatchIndex}
      >
        {isLoading ? <SkeletonGrid count={6} /> : null}
        {error ? <ErrorState onRetry={retry} /> : null}
        {!isLoading && !error
          ? visibleMatches.map((match, index) => (
              <MatchCard isActive={activeMatchIndex === index} key={match.id} match={match} />
            ))
          : null}
        {!isLoading && !error && !filteredMatches.length ? (
          <div className="matches-empty-state">
            <span>Sem partidas na seleção</span>
            <strong>Nenhum jogo encontrado agora</strong>
            <p>Os filtros ativos não retornaram partidas mockadas. Volte para a visão principal para continuar navegando pelo carrossel.</p>
            <div className="matches-empty-reasons" aria-label="Possíveis motivos">
              <small>Data</small>
              <small>Campeonato</small>
              <small>Mercado</small>
            </div>
            <button onClick={resetMatchesView} type="button">
              Ver todos os jogos
            </button>
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
