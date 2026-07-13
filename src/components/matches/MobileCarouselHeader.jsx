import { Link } from 'react-router-dom';
import '../../styles/mobile-carousel-header.css';

function MobileCarouselHeader({ activeIndex, matchCount }) {
  const currentPosition = matchCount ? activeIndex + 1 : 0;

  return (
    <header className="mobile-carousel-header">
      <div>
        <span>Radar de hoje</span>
        <h2>Jogos em destaque</h2>
      </div>

      <div className="mobile-carousel-header-actions">
        <strong>{currentPosition}/{matchCount}</strong>
        <Link to="/lista-vip">Lista VIP</Link>
      </div>
    </header>
  );
}

export default MobileCarouselHeader;
