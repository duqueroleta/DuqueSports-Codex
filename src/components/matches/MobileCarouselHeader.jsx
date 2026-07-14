import { Link } from 'react-router-dom';
import { formatMatchConfidence } from '../../utils/matchConfidence.js';
import '../../styles/mobile-carousel-header.css';

function MobileCarouselHeader({ activeIndex, match, matchCount }) {
  const currentPosition = matchCount ? Math.min(activeIndex + 1, matchCount) : 0;

  return (
    <header className="mobile-carousel-header">
      <div>
        <span>Radar de hoje</span>
        <h2>{match ? `${match.home} x ${match.away}` : 'Jogos em destaque'}</h2>
        <p>
          {match
            ? `${formatMatchConfidence(match.confidence)} de confianca - ${match.signal}`
            : 'Escolha um campeonato ou mercado para analisar.'}
        </p>
      </div>

      <div className="mobile-carousel-header-actions">
        <strong>{currentPosition}/{matchCount}</strong>
        <Link to="/lista-vip">Lista VIP</Link>
      </div>
    </header>
  );
}

export default MobileCarouselHeader;
