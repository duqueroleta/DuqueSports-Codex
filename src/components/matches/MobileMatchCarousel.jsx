import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import CompetitionRail, { ALL_COMPETITIONS } from '../competitions/CompetitionRail.jsx';
import MobileMarketFilters from './MobileMarketFilters.jsx';
import MobileOpportunityBar from './MobileOpportunityBar.jsx';
import TeamCrest from '../teams/TeamCrest.jsx';
import { AFFILIATE_LINKS } from '../../config/affiliateLinks.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getMatches } from '../../services/matchesService.js';
import { matchMarketFilter } from '../../utils/marketFilters.js';
import { normalizeMatchMetrics } from '../../utils/matchMetrics.js';
import { normalizeMatchProbabilities } from '../../utils/matchProbabilities.js';
import { getMatchVisualStyle } from '../../utils/matchVisuals.js';
import '../../styles/mobile-match-carousel.css';

function MobileMatchCarousel() {
  const { data: matches } = useAsyncData(getMatches, []);
  const [activeCompetition, setActiveCompetition] = useState(ALL_COMPETITIONS);
  const [activeMarket, setActiveMarket] = useState('todos');
  const carouselRef = useRef(null);
  const competitionMatches = activeCompetition === ALL_COMPETITIONS
    ? matches
    : matches.filter((match) => match.league === activeCompetition);
  const visibleMatches = competitionMatches.filter((match) => matchMarketFilter(match, activeMarket));
  const bestMatch = [...visibleMatches].sort((first, second) => second.confidence - first.confidence)[0];

  function scrollToStart() {
    carouselRef.current?.scrollTo({ behavior: 'smooth', left: 0 });
  }

  function handleCompetitionSelect(competition) {
    setActiveCompetition(competition);
    scrollToStart();
  }

  function handleMarketSelect(market) {
    setActiveMarket(market);
    scrollToStart();
  }

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
    <section className="mobile-match-carousel" aria-label="Jogos em destaque">
      <MobileOpportunityBar match={bestMatch} />
      <MobileMarketFilters activeMarket={activeMarket} onSelect={handleMarketSelect} />
      <CompetitionRail activeCompetition={activeCompetition} onSelect={handleCompetitionSelect} />

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
                  {normalizeMatchMetrics(match.metrics).slice(0, 3).map((metric) => (
                    <span key={metric}>{metric}</span>
                  ))}
                </div>

                <div className="mobile-match-signal">
                  <span>Mercado indicado</span>
                  <strong>{match.signal}</strong>
                  <small>Odd media {match.odds}</small>
                </div>

                <div className="mobile-probability-strip" aria-label="Probabilidades principais">
                  {normalizeMatchProbabilities(match.probabilities).map((probability) => (
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
                  <a href={AFFILIATE_LINKS.readyBetslip} rel="noreferrer" target="_blank">
                    Bilhete pronto
                  </a>
                </div>
              </div>
            </article>
          ))}
          {!visibleMatches.length ? (
            <article className="mobile-match-slide">
              <div className="mobile-match-empty">
                <span>Nenhum jogo encontrado</span>
                <strong>Troque o mercado ou campeonato</strong>
              </div>
            </article>
          ) : null}
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
