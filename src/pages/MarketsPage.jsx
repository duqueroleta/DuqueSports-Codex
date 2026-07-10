import ErrorState from '../components/error/ErrorState.jsx';
import SkeletonGrid from '../components/loading/SkeletonGrid.jsx';
import MarketRankingPanel from '../components/markets/MarketRankingPanel.jsx';
import MarketStrengthCard from '../components/markets/MarketStrengthCard.jsx';
import MarketsFilterToolbar from '../components/markets/MarketsFilterToolbar.jsx';
import { useSearch } from '../context/SearchContext.jsx';
import { ALL_MARKET_COMPETITIONS, filterMarketRankings, runMarketRankingService } from '../engine/batch/MarketRankingService.js';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { getBatchAnalysis } from '../services/batchAnalysisService.js';
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
  const [activeCompetition, setActiveCompetition] = usePersistentState(
    'duque.filters.markets.competition',
    ALL_MARKET_COMPETITIONS,
  );
  const { searchTerm } = useSearch();
  const { data: markets, error, isLoading, retry } = useAsyncData(getMarkets, []);
  const { data: batchAnalysis } = useAsyncData(getBatchAnalysis, [], null);
  const marketRanking = runMarketRankingService(batchAnalysis?.opportunities ?? []);
  const rankedMarkets = filterMarketRankings(marketRanking.rankings, activeCompetition);
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

      <MarketRankingPanel
        activeCompetition={activeCompetition}
        filterOptions={marketRanking.filterOptions}
        rankings={rankedMarkets}
        onCompetitionChange={setActiveCompetition}
      />

      <MarketsFilterToolbar
        activeFilter={activeFilter}
        filters={filters}
        onFilterChange={setActiveFilter}
      />

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
