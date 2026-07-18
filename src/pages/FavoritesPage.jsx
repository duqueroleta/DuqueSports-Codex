import { Link } from 'react-router-dom';
import ErrorState from '../components/error/ErrorState.jsx';
import MatchCard from '../components/matches/MatchCard.jsx';
import MarketStrengthCard from '../components/markets/MarketStrengthCard.jsx';
import SkeletonGrid from '../components/loading/SkeletonGrid.jsx';
import { AFFILIATE_LINKS } from '../config/affiliateLinks.js';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useSearch } from '../context/SearchContext.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { getMarkets } from '../services/marketsService.js';
import { getMatches } from '../services/matchesService.js';
import '../styles/page-favorites.css';
import { itemMatchesSearch } from '../utils/search.js';

function getTopMatch(matches) {
  return [...matches].sort((first, second) => (second.confidence ?? 0) - (first.confidence ?? 0))[0] ?? null;
}

function getTopMarket(markets) {
  return [...markets].sort((first, second) => (second.strength ?? 0) - (first.strength ?? 0))[0] ?? null;
}

function getFavoriteDecision(topMatch, topMarket) {
  if (topMatch && topMarket) {
    return {
      href: `/jogos/${topMatch.id}`,
      label: 'Abrir análise',
      status: 'Prioridade completa',
      text: 'Jogo e mercado salvos para comparação imediata.',
      title: `${topMatch.home} x ${topMatch.away}`,
      tone: 'complete',
    };
  }

  if (topMatch) {
    return {
      href: `/jogos/${topMatch.id}`,
      label: 'Abrir análise',
      status: 'Jogo prioritário',
      text: 'Melhor jogo salvo pronto para leitura completa.',
      title: `${topMatch.home} x ${topMatch.away}`,
      tone: 'match',
    };
  }

  if (topMarket) {
    return {
      href: `/mercados/${topMarket.id}`,
      label: 'Ver mercado',
      status: 'Mercado prioritário',
      text: 'Mercado salvo com melhor força no seu radar.',
      title: topMarket.name,
      tone: 'market',
    };
  }

  return {
    href: '/jogos',
    label: 'Salvar jogos',
    status: 'Radar vazio',
    text: 'Salve jogos ou mercados para ativar recomendações pessoais.',
    title: 'Nenhum favorito salvo ainda',
    tone: 'empty',
  };
}

function FavoriteEmptyState({ hasSavedItems, label, onClearSearch, to }) {
  return (
    <div className="favorites-empty">
      <span>Radar pessoal</span>
      <strong>{hasSavedItems ? `${label} ocultos pela busca` : `Nenhum ${label.toLowerCase()} salvo ainda`}</strong>
      <p>
        {hasSavedItems
          ? 'A busca atual não encontrou itens salvos nesta seção. Limpe a busca para voltar ao seu radar completo.'
          : 'Explore as oportunidades do Duque Score e salve os itens mais importantes para acompanhar depois.'}
      </p>
      <div className="favorites-empty-actions">
        {hasSavedItems ? (
          <button onClick={onClearSearch} type="button">
            Limpar busca
          </button>
        ) : null}
        <Link to={to}>
          Explorar {label.toLowerCase()}
        </Link>
      </div>
    </div>
  );
}

function FavoritesPage() {
  const { favoriteMatches, favoriteMarkets } = useFavorites();
  const { searchTerm, setSearchTerm } = useSearch();
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

  const allSavedMatches = matches.filter((match) => favoriteMatches.includes(match.id));
  const allSavedMarkets = markets.filter((market) => favoriteMarkets.includes(market.id));
  const savedMatches = allSavedMatches.filter((match) => itemMatchesSearch(match, searchTerm));
  const savedMarkets = allSavedMarkets.filter((market) => itemMatchesSearch(market, searchTerm));
  const totalFavorites = favoriteMatches.length + favoriteMarkets.length;
  const topMatch = getTopMatch(allSavedMatches);
  const topMarket = getTopMarket(allSavedMarkets);
  const hasFavorites = totalFavorites > 0;
  const favoriteDecision = getFavoriteDecision(topMatch, topMarket);
  const favoriteMetrics = [
    {
      label: 'Jogos salvos',
      value: favoriteMatches.length,
      description: topMatch ? `${topMatch.home} x ${topMatch.away}` : 'nenhum jogo salvo',
    },
    {
      label: 'Mercados salvos',
      value: favoriteMarkets.length,
      description: topMarket ? topMarket.name : 'nenhum mercado salvo',
    },
    {
      label: 'Maior score',
      value: topMatch ? `${topMatch.confidence}%` : '--',
      description: topMatch ? topMatch.signal : 'salve jogos para comparar',
    },
    {
      label: 'Força mercado',
      value: topMarket ? `${topMarket.strength}%` : '--',
      description: topMarket ? topMarket.risk : 'salve mercados para monitorar',
    },
  ];

  return (
    <main className="favorites-page">
      <section className="favorites-hero" aria-labelledby="favorites-title">
        <div className="favorites-hero-copy">
          <span>Radar pessoal</span>
          <h1 id="favorites-title">Seus jogos e mercados em um só lugar</h1>
          <p>
            Acompanhe o que foi salvo, compare prioridades e volte rapidamente para a análise ou
            para o bilhete quando a oportunidade estiver madura.
          </p>
        </div>

        <aside className="favorites-summary" aria-label="Resumo de favoritos">
          <span>Itens ativos</span>
          <strong>{totalFavorites}</strong>
          <p>{hasFavorites ? 'favoritos em observação' : 'salve jogos e mercados no radar'}</p>
          <small>{savedMatches.length + savedMarkets.length} visíveis no filtro atual</small>
        </aside>
      </section>

      <section className="favorites-metrics" aria-label="Indicadores de favoritos">
        {favoriteMetrics.map((metric) => (
          <article key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <p>{metric.description}</p>
          </article>
        ))}
      </section>

      <section className={`favorites-command favorites-command-${favoriteDecision.tone}`} aria-label="Ação rápida dos favoritos">
        <div>
          <span>{favoriteDecision.status}</span>
          <strong>{favoriteDecision.title}</strong>
          <p>
            {topMatch
              ? `${topMatch.signal} com ${topMatch.confidence}% de score e odd ${topMatch.odds}.`
              : favoriteDecision.text}
          </p>
        </div>

        <aside>
          <span>Mercado em foco</span>
          <strong>{topMarket?.name ?? 'Sem mercado salvo'}</strong>
          <p>{topMarket ? `${topMarket.strength}% de força | risco ${topMarket.risk}` : 'Salve mercados fortes para comparar depois.'}</p>
        </aside>

        <div className="favorites-command-actions">
          <Link to={favoriteDecision.href}>
            {favoriteDecision.label}
          </Link>
          <a href={AFFILIATE_LINKS.readyBetslip} rel="noreferrer" target="_blank">
            Bilhete pronto
          </a>
        </div>
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
          {!isLoadingMatches && !matchesError && !savedMatches.length ? (
            <FavoriteEmptyState
              hasSavedItems={allSavedMatches.length > 0}
              label="Jogos"
              onClearSearch={() => setSearchTerm('')}
              to="/jogos"
            />
          ) : null}
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
          {!isLoadingMarkets && !marketsError && savedMarkets.map((market, index) => (
            <MarketStrengthCard key={market.id} market={market} rank={index + 1} />
          ))}
          {!isLoadingMarkets && !marketsError && !savedMarkets.length ? (
            <FavoriteEmptyState
              hasSavedItems={allSavedMarkets.length > 0}
              label="Mercados"
              onClearSearch={() => setSearchTerm('')}
              to="/mercados"
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default FavoritesPage;
