import { Link } from 'react-router-dom';
import '../../styles/hero-buttons.css';

function HeroButtons() {
  return (
    <div className="hero-actions">
      <Link className="hero-button hero-button-primary" to="/lista-vip">
        Entrar na lista VIP
      </Link>
      <Link className="hero-button hero-button-secondary" to="/jogos">
        Ver análises gratuitas
      </Link>
    </div>
  );
}

export default HeroButtons;
