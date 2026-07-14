import { useState } from 'react';
import { useFavorites } from '../../context/FavoritesContext.jsx';
import { useSearch } from '../../context/SearchContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import '../../styles/reset-preferences.css';

const preferenceKeys = [
  'duque.filters.matches',
  'duque.filters.matches.competition',
  'duque.filters.matches.market',
  'duque.filters.matches.tier',
  'duque.filters.markets',
  'duque.filters.markets.competition',
  'duque.filters.audits',
  'duque.filters.analyses',
  'duque.filters.live',
  'duque.sort.analyses',
  'duque.profile.competitions',
  'duque.profile.experience',
  'duque.profile.markets',
  'duque.profile.userType',
  'duque.searchTerm',
];

function ResetPreferencesPanel() {
  const [confirming, setConfirming] = useState(false);
  const { clearFavorites } = useFavorites();
  const { setSearchTerm } = useSearch();
  const { showToast } = useToast();

  function resetPreferences() {
    preferenceKeys.forEach((key) => window.localStorage.removeItem(key));
    clearFavorites();
    setSearchTerm('');
    setConfirming(false);
    showToast('Preferencias limpas com sucesso.');
  }

  return (
    <section className="reset-preferences" aria-labelledby="reset-preferences-title">
      <div>
        <span>Preferencias</span>
        <h2 id="reset-preferences-title">Limpar dados salvos</h2>
        <p>Remove busca, filtros persistidos, favoritos e preferencias salvas neste navegador.</p>
      </div>

      <div className="reset-preferences-actions">
        {confirming ? (
          <>
            <button className="reset-button reset-button-danger" onClick={resetPreferences} type="button">
              Confirmar limpeza
            </button>
            <button className="reset-button reset-button-secondary" onClick={() => setConfirming(false)} type="button">
              Cancelar
            </button>
          </>
        ) : (
          <button className="reset-button reset-button-primary" onClick={() => setConfirming(true)} type="button">
            Limpar preferencias
          </button>
        )}
      </div>
    </section>
  );
}

export default ResetPreferencesPanel;
