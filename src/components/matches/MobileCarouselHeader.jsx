import { Link } from 'react-router-dom';
import { formatMatchConfidence } from '../../utils/matchConfidence.js';
import '../../styles/mobile-carousel-header.css';

function MobileCarouselHeader({ activeIndex, match, matchCount }) {
  const currentPosition = matchCount ? Math.min(activeIndex + 1, matchCount) : 0;
  const headline = match ? `${match.home} x ${match.away}` : 'Jogos em destaque';
  const summary = match
    ? `${formatMatchConfidence(match.confidence)} de confiança · ${match.signal}`
    : 'Escolha um campeonato ou mercado para analisar.';

  return (
    <header className="mobile-carousel-header">
      <div>
        <span>Radar de hoje</span>
        <h2>{headline}</h2>
        <p>{summary}</p>
        {match ? (
          <small>
            {match.league} · Hoje, {match.time}
          </small>
        ) : null}
      </div>

      <div className="mobile-carousel-header-actions">
        <strong>{currentPosition}/{matchCount}</strong>
        <span>Arraste</span>
        <Link to="/jogos">Todos</Link>
      </div>
    </header>
  );
}

export default MobileCarouselHeader;
