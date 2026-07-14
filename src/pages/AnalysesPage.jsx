import { useState } from 'react';
import AnalysesHero from '../components/analyses/AnalysesHero.jsx';
import AnalysisCard from '../components/analyses/AnalysisCard.jsx';
import AnalysisToolbar from '../components/analyses/AnalysisToolbar.jsx';
import ErrorState from '../components/error/ErrorState.jsx';
import SkeletonGrid from '../components/loading/SkeletonGrid.jsx';
import { useSearch } from '../context/SearchContext.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { getBatchAnalysis } from '../services/batchAnalysisService.js';
import { itemMatchesSearch } from '../utils/search.js';
import '../styles/page-analyses.css';

function matchesAnalysisFilter(opportunity, filter) {
  if (filter === 'elite') {
    return opportunity.tier === 'Elite';
  }

  if (filter === 'confidence') {
    return opportunity.confidence >= 85;
  }

  if (filter === 'risk') {
    return opportunity.risk.startsWith('Nenhum risco');
  }

  return true;
}

function sortOpportunities(opportunities, sortBy) {
  const selectors = {
    confidence: (item) => item.confidence,
    probability: (item) => item.probability,
    score: (item) => item.opportunityScore,
  };
  const selector = selectors[sortBy] ?? selectors.score;

  return [...opportunities].sort((left, right) => selector(right) - selector(left));
}

function AnalysesPage() {
  const [activeFilter, setActiveFilter] = usePersistentState('duque.filters.analyses', 'all');
  const [sortBy, setSortBy] = usePersistentState('duque.sort.analyses', 'score');
  const [visibleCount, setVisibleCount] = useState(6);
  const { searchTerm } = useSearch();
  const { data: analysis, error, isLoading, retry } = useAsyncData(getBatchAnalysis, [], null);
  const opportunities = analysis?.opportunities ?? [];
  const filteredOpportunities = sortOpportunities(
    opportunities.filter(
      (opportunity) => matchesAnalysisFilter(opportunity, activeFilter)
        && itemMatchesSearch(opportunity, searchTerm),
    ),
    sortBy,
  );
  const visibleOpportunities = filteredOpportunities.slice(0, visibleCount);

  return (
    <main className="analyses-page">
      <AnalysesHero analysis={analysis} />
      <AnalysisToolbar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onSortChange={setSortBy}
        sortBy={sortBy}
      />

      <div className="analyses-results-heading">
        <div>
          <span>Ranking da IA</span>
          <strong>Relatórios disponíveis</strong>
        </div>
        <small>{filteredOpportunities.length} análises</small>
      </div>

      <section className="analyses-grid" aria-label="Biblioteca de análises">
        {isLoading ? <SkeletonGrid count={6} /> : null}
        {error ? <ErrorState onRetry={retry} /> : null}
        {!isLoading && !error
          ? visibleOpportunities.map((opportunity, index) => (
            <AnalysisCard key={opportunity.matchId} opportunity={opportunity} rank={index + 1} />
          ))
          : null}
        {!isLoading && !error && !visibleOpportunities.length ? (
          <div className="analyses-empty">
            <strong>Nenhuma análise encontrada</strong>
            <p>Ajuste os filtros ou a busca para consultar outros relatórios.</p>
          </div>
        ) : null}
      </section>

      {visibleCount < filteredOpportunities.length ? (
        <button
          className="analyses-load-more"
          onClick={() => setVisibleCount((count) => count + 6)}
          type="button"
        >
          Mostrar mais análises
        </button>
      ) : null}
    </main>
  );
}

export default AnalysesPage;
