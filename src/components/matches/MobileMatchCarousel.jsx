import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import CompetitionRail, { ALL_COMPETITIONS } from '../competitions/CompetitionRail.jsx';
import TeamCrest from '../teams/TeamCrest.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getMatches } from '../../services/matchesService.js';
import { getMatchVisualStyle } from '../../utils/matchVisuals.js';
import '../../styles/mobile-match-carousel.css';

const BETSLIP_URL = 'https://wlsuperbet.adsrv.eacdn.com/C.ashx?btag=a_46656b_431c_&affid=873&siteid=46656&adid=431&c=';

function MobileMatchCarousel() {
  const { data: matches } = useAsyncData(getMatches, []);
  const [activeCompetition, setActiveCompetition] = useState(ALL_COMPETITIONS);
  const carouselRef = useRef(null);
  const visibleMatches = activeCompetition === ALL_COMPETITIONS
    ? matches
    : matches.filter((match) => match.league === activeCompetition);

  function moveCarousel(direction) {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    carousel.scrollBy({
      behavior: 'smooth',
      left: direction * carousel.clientWidth,
    });
  }

  return (
    <section className="mobile-match-carousel" aria-labelledby="mobile-match-carousel-title">
      <div className="mobile-carousel-heading">
        <span>Duque Score</span>
        <h1 id="mobile-match-carousel-title">Jogos em destaque</h1>
      </div>

      <CompetitionRail activeCompetition={activeCompetition} onSelect={setActiveCompetition} />

      <div className="mobile-carousel-shell">
        <button
          aria-label="Jogo anterior"
          className="mobile-carousel-arrow mobile-carousel-arrow-left"
          onClick={() => moveCarousel(-1)}
          type="button"
        >
          &lt;
        </button>

        <div className="mobile-carousel-track" ref={carouselRef}>
          {visibleMatches.map((match) => (
            <article className="mobile-match-slide" key={match.id}>
              <div className="mobile-match-card" style={getMatchVisualStyle(match)}>
                <div className="mobile-match-kicker">
                  <strong>Melhor oportunidade</strong>
                  <span>{match.league}</span>
                </div>

                <div className="mobile-match-teams">
                  <div>
                    <TeamCrest teamName={match.home} />
                    <strong>{match.home}</strong>
                    <small>Mandante</small>
                  </div>

                  <div className="mobile-match-versus">
                    <span>{match.time}</span>
                    <strong>{match.score}</strong>
                    <small>Hoje</small>
                  </div>

                  <div>
                    <TeamCrest teamName={match.away} />
                    <strong>{match.away}</strong>
                    <small>Visitante</small>
                  </div>
                </div>

                <div className="mobile-score-panel">
                  <span>Duque Score</span>
                  <strong>{match.confidence}</strong>
                  <p>{match.confidence >= 80 ? 'Confianca alta' : 'Confianca moderada'}</p>
                </div>

                <div className="mobile-match-stats">
                  {match.metrics.slice(0, 3).map((metric) => (
                    <span key={metric}>{metric}</span>
                  ))}
                </div>

                <div className="mobile-match-signal">
                  <span>Mercado indicado</span>
                  <strong>{match.signal}</strong>
                  <small>Odd media {match.odds}</small>
                </div>

                <div className="mobile-probability-strip" aria-label="Probabilidades principais">
                  {match.probabilities.map((probability) => (
                    <div key={probability.label}>
                      <span>{probability.label}</span>
                      <strong>{probability.value}%</strong>
                      <small>
                        <i style={{ width: `${probability.value}%` }} />
                      </small>
                    </div>
                  ))}
                </div>

                <div className="mobile-match-actions">
                  <Link to={`/jogos/${match.id}`}>Abrir analise completa</Link>
                  <a href={BETSLIP_URL} rel="noreferrer" target="_blank">
                    Bilhete pronto
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <button
          aria-label="Proximo jogo"
          className="mobile-carousel-arrow mobile-carousel-arrow-right"
          onClick={() => moveCarousel(1)}
          type="button"
        >
          &gt;
        </button>
      </div>
    </section>
  );
}

export default MobileMatchCarousel;
