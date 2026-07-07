import { createContext, useContext, useMemo } from 'react';
import { usePersistentState } from '../hooks/usePersistentState.js';

const SearchContext = createContext(null);

function SearchProvider({ children }) {
  const [searchTerm, setSearchTerm] = usePersistentState('duque.searchTerm', '');

  const value = useMemo(
    () => ({
      searchTerm,
      setSearchTerm,
    }),
    [searchTerm],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

function useSearch() {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error('useSearch must be used inside SearchProvider');
  }

  return context;
}

export { SearchProvider, useSearch };
