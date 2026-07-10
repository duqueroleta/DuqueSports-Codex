import MarketsGrid from '../components/markets/MarketsGrid.jsx';
import MarketsHero from '../components/markets/MarketsHero.jsx';
import MarketRankingPanel from '../components/markets/MarketRankingPanel.jsx';
import MarketsFilterToolbar from '../components/markets/MarketsFilterToolbar.jsx';
import { useSearch } from '../context/SearchContext.jsx';
import { ALL_MARKET_COMPETITIONS, filterMarketRankings, runMarketRankingService } from '../engine/batch/MarketRankingService.js';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { usePersistentState } from '../hooks/usePersistentState.js';
import { getBatchAnalysis } from '../services/batchAnalysisService.js';
import { getMarkets } from '../services/marketsService.js';
import '../styles/page-markets.css';
import { MARKET_LIST_FILTERS, matchMarketListFilter } from '../utils/marketFilters.js';
import { getStrongestMarket } from '../utils/marketStats.js';
import { itemMatchesSearch } from '../utils/search.js';

function MarketsPage() {
  const [activeFilter, setActiveFilter] = usePersistentState('duque.filters.markets', 'Todos');
  const [activeCompetition, setActiveCompetition] = usePersistentState(
    'duque.filters.markets.competition',
    ALL_MARKET_COMPETITIONS,
  );
  const { searchTerm } = useSearch();
  const { data: markets, error, isLoading, retry } = useAsyncData(getMarkets, []);
  const { data: batchAnalysis } = useAsyncData(getBatchAnalysis, [], null);
  const bestMarket = getStrongestMarket(markets);
  const marketRanking = runMarketRankingService(batchAnalysis?.opportunities ?? []);
  const rankedMarkets = filterMarketRankings(marketRanking.rankings, activeCompetition);
  const filteredMarkets = markets.filter(
    (market) => matchMarketListFilter(market, activeFilter) && itemMatchesSearch(market, searchTerm),
  );

  return (
    <main className="markets-page">
      <MarketsHero
        bestMarket={bestMarket}
        hasError={Boolean(error)}
        isLoading={isLoading}
      />

      <MarketRankingPanel
        activeCompetition={activeCompetition}
        filterOptions={marketRanking.filterOptions}
        rankings={rankedMarkets}
        onCompetitionChange={setActiveCompetition}
      />

      <MarketsFilterToolbar
        activeFilter={activeFilter}
        filters={MARKET_LIST_FILTERS}
        onFilterChange={setActiveFilter}
      />

      <MarketsGrid
        error={error}
        isLoading={isLoading}
        markets={filteredMarkets}
        onRetry={retry}
      />
    </main>
  );
}

export default MarketsPage;
