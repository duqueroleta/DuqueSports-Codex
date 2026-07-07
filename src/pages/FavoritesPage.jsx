import ErrorState from '../components/error/ErrorState.jsx';
import MatchCard from '../components/matches/MatchCard.jsx';
import MarketStrengthCard from '../components/markets/MarketStrengthCard.jsx';
import SkeletonGrid from '../components/loading/SkeletonGrid.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useSearch } from '../context/SearchContext.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { getMarkets } from '../services/marketsService.js';
import { getMatches } from '../services/matchesService.js';
import '../styles/page-favorites.css';
import { itemMatchesSearch } from '../utils/search.js';

function FavoritesPage() {
  const { favoriteMatches, favoriteMarkets } = useFavorites();
  const { searchTerm } = useSearch();
  const {
    data: matches,
    error: matchesError,
    isLoading: isLoadingMatches,
    retry: retryMatches,
  } = useAsyncData(getMatches, []);
  const {
    data: markets,
    error: marketsError,
    isLoading: isLoadingMarkets,
    retry: retryMarkets,
  } = useAsyncData(getMarkets, []);

  const savedMatches = matches.filter(
    (match) => favoriteMatches.includes(match.id) && itemMatchesSearch(match, searchTerm),
  );
  const savedMarkets = markets.filter(
    (market) => favoriteMarkets.includes(market.id) && itemMatchesSearch(market, searchTerm),
  );
  const totalFavorites = favoriteMatches.length + favoriteMarkets.length;

  return (
    <main className="favorites-page">
      <section className="favorites-hero" aria-labelledby="favorites-title">
        <div>
          <span>Radar pessoal</span>
          <h1 id="favorites-title">Favoritos monitorados</h1>
          <p>Jogos e mercados salvos para acompanhamento rápido durante a rotina de análise.</p>
        </div>

        <aside className="favorites-summary">
          <span>Itens ativos</span>
          <strong>{totalFavorites}</strong>
          <p>favoritos em observação</p>
        </aside>
      </section>

      <section className="favorites-section" aria-labelledby="favorite-matches-title">
        <div className="favorites-section-heading">
          <h2 id="favorite-matches-title">Jogos favoritos</h2>
          <span>{favoriteMatches.length} salvos</span>
        </div>
        <div className="favorites-grid">
          {isLoadingMatches ? <SkeletonGrid count={3} /> : null}
          {matchesError ? <ErrorState onRetry={retryMatches} /> : null}
          {!isLoadingMatches && !matchesError && savedMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
          {!isLoadingMatches && !matchesError && !savedMatches.length ? <p className="search-empty">Nenhum jogo favorito encontrado.</p> : null}
        </div>
      </section>

      <section className="favorites-section" aria-labelledby="favorite-markets-title">
        <div className="favorites-section-heading">
          <h2 id="favorite-markets-title">Mercados favoritos</h2>
          <span>{favoriteMarkets.length} salvos</span>
        </div>
        <div className="favorites-grid favorites-market-grid">
          {isLoadingMarkets ? <SkeletonGrid count={4} /> : null}
          {marketsError ? <ErrorState onRetry={retryMarkets} /> : null}
          {!isLoadingMarkets && !marketsError && savedMarkets.map((market) => (
            <MarketStrengthCard key={market.id} market={market} />
          ))}
          {!isLoadingMarkets && !marketsError && !savedMarkets.length ? <p className="search-empty">Nenhum mercado favorito encontrado.</p> : null}
        </div>
      </section>
    </main>
  );
}

export default FavoritesPage;
