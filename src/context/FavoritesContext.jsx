import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useToast } from './ToastContext.jsx';

const FavoritesContext = createContext(null);
const FAVORITE_MATCHES_KEY = 'duque.favoriteMatches';
const FAVORITE_MARKETS_KEY = 'duque.favoriteMarkets';

function readStoredFavorites(key) {
  try {
    const storedValue = window.localStorage.getItem(key);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];

    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function FavoritesProvider({ children }) {
  const [favoriteMatches, setFavoriteMatches] = useState(() => readStoredFavorites(FAVORITE_MATCHES_KEY));
  const [favoriteMarkets, setFavoriteMarkets] = useState(() => readStoredFavorites(FAVORITE_MARKETS_KEY));
  const { showToast } = useToast();

  useEffect(() => {
    window.localStorage.setItem(FAVORITE_MATCHES_KEY, JSON.stringify(favoriteMatches));
  }, [favoriteMatches]);

  useEffect(() => {
    window.localStorage.setItem(FAVORITE_MARKETS_KEY, JSON.stringify(favoriteMarkets));
  }, [favoriteMarkets]);

  function toggleFavorite(type, id) {
    const currentItems = type === 'match' ? favoriteMatches : favoriteMarkets;
    const alreadySaved = currentItems.includes(id);
    const nextItems = alreadySaved ? currentItems.filter((item) => item !== id) : [...currentItems, id];

    if (type === 'match') {
      setFavoriteMatches(nextItems);
    } else {
      setFavoriteMarkets(nextItems);
    }

    showToast(alreadySaved ? 'Favorito removido.' : 'Favorito salvo.');
  }

  function isFavorite(type, id) {
    return type === 'match' ? favoriteMatches.includes(id) : favoriteMarkets.includes(id);
  }

  function clearFavorites() {
    setFavoriteMatches([]);
    setFavoriteMarkets([]);
  }

  const value = useMemo(
    () => ({
      clearFavorites,
      favoriteMatches,
      favoriteMarkets,
      isFavorite,
      toggleFavorite,
    }),
    [favoriteMatches, favoriteMarkets],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error('useFavorites must be used inside FavoritesProvider');
  }

  return context;
}

export { FavoritesProvider, useFavorites };
