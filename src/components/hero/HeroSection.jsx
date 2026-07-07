import TeamCard from './TeamCard.jsx';
import ScoreRing from './ScoreRing.jsx';
import Recommendation from './Recommendation.jsx';
import MarketsBar from './MarketsBar.jsx';
import HeroButtons from './HeroButtons.jsx';
import '../../styles/hero-layout.css';

const match = {
  league: 'Champions League • Hoje, 21:00',
  leftTeam: {
    name: 'Real Madrid',
    form: 'V V E V V',
    xg: '2.14',
    pressure: 'Alta',
    badge: 'RM',
  },
  rightTeam: {
    name: 'Manchester City',
    form: 'V E V V D',
    xg: '1.86',
    pressure: 'Média',
    badge: 'MC',
  },
  score: 87,
};

function HeroSection() {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-ambient hero-ambient-one" />
      <div className="hero-ambient hero-ambient-two" />

      <div className="hero-shell">
        <div className="hero-kicker">DUQUE SPORTS AI</div>
        <div className="hero-heading-row">
          <div>
            <h1 id="hero-title">Análise preditiva de elite para futebol</h1>
            <p>
              Leitura estatística em tempo real, inteligência artificial e sinais de mercado
              em uma experiência premium.
            </p>
          </div>
          <div className="hero-live-pill">
            <span />
            Ao vivo
          </div>
        </div>

        <div className="hero-match-panel">
          <TeamCard team={match.leftTeam} align="left" />

          <div className="hero-center-stack">
            <div className="hero-league">{match.league}</div>
            <ScoreRing score={match.score} />
            <Recommendation />
          </div>

          <TeamCard team={match.rightTeam} align="right" />
        </div>

        <MarketsBar />
        <HeroButtons />
      </div>
    </section>
  );
}

export default HeroSection;
