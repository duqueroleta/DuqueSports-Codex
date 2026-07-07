import '../../styles/hero-buttons.css';

function HeroButtons() {
  return (
    <div className="hero-actions">
      <button className="hero-button hero-button-primary" type="button">
        Ver análise completa
      </button>
      <button className="hero-button hero-button-secondary" type="button">
        Favoritar jogo
      </button>
    </div>
  );
}

export default HeroButtons;
