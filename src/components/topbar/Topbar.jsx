import { useSearch } from '../../context/SearchContext.jsx';
import '../../styles/topbar.css';

function Topbar() {
  const { searchTerm, setSearchTerm } = useSearch();

  return (
    <header className="topbar">
      <div className="topbar-mobile-status" aria-hidden="true">
        <span>Duque Score</span>
        <strong>AI ativa</strong>
      </div>
      <div className="topbar-search">
        <span aria-hidden="true">/</span>
        <input
          aria-label="Buscar partidas, times ou mercados"
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar times, mercados ou auditorias"
          value={searchTerm}
        />
        {searchTerm ? (
          <button aria-label="Limpar busca" onClick={() => setSearchTerm('')} type="button">
            X
          </button>
        ) : null}
      </div>

      <div className="topbar-actions">
        <button className="topbar-icon-button" type="button" aria-label="Abrir alertas">
          AL
        </button>
        <button className="topbar-profile" type="button">
          <span>DS</span>
          <strong>Analista</strong>
        </button>
      </div>
    </header>
  );
}

export default Topbar;
