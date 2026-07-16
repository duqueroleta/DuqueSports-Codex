import { useRef, useState } from 'react';
import CompetitionRail, { ALL_COMPETITIONS } from '../competitions/CompetitionRail.jsx';
import MobileCarouselHeader from './MobileCarouselHeader.jsx';
import MobileMarketFilters from './MobileMarketFilters.jsx';
import MobileMatchSlide from './MobileMatchSlide.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getMatches } from '../../services/matchesService.js';
import { matchMarketFilter } from '../../utils/marketFilters.js';
import '../../styles/mobile-match-carousel.css';

function MobileMatchCarousel() {
  const { data: matches } = useAsyncData(getMatches, []);
  const [activeCompetition, setActiveCompetition] = useState(ALL_COMPETITIONS);
  const [activeMarket, setActiveMarket] = useState('todos');
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);
  const competitionMatches = activeCompetition === ALL_COMPETITIONS
    ? matches
    : matches.filter((match) => match.league === activeCompetition);
  const visibleMatches = competitionMatches.filter((match) => matchMarketFilter(match, activeMarket));
  const activeMatch = visibleMatches[activeIndex] ?? visibleMatches[0] ?? null;

  function scrollToStart() {
    carouselRef.current?.scrollTo({ behavior: 'smooth', left: 0 });
    setActiveIndex(0);
  }

  function handleCompetitionSelect(competition) {
    setActiveCompetition(competition);
    scrollToStart();
  }

  function handleMarketSelect(market) {
    setActiveMarket(market);
    scrollToStart();
  }

  function handleResetFilters() {
    setActiveCompetition(ALL_COMPETITIONS);
    setActiveMarket('todos');
    scrollToStart();
  }

  function moveCarousel(direction) {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const nextIndex = Math.min(Math.max(activeIndex + direction, 0), visibleMatches.length - 1);
    setActiveIndex(nextIndex);
    carousel.scrollTo({
      behavior: 'smooth',
      left: nextIndex * carousel.clientWidth,
    });
  }

  function handleCarouselScroll() {
    const carousel = carouselRef.current;

    if (!carousel?.clientWidth) {
      return;
    }

    setActiveIndex(Math.round(carousel.scrollLeft / carousel.clientWidth));
  }

  return (
    <section className="mobile-match-carousel" aria-label="Jogos em destaque">
      <MobileCarouselHeader activeIndex={activeIndex} match={activeMatch} matchCount={visibleMatches.length} />
      <CompetitionRail activeCompetition={activeCompetition} onSelect={handleCompetitionSelect} />
      <MobileMarketFilters activeMarket={activeMarket} onSelect={handleMarketSelect} />

      <div className="mobile-carousel-shell">
        <div className="mobile-carousel-track" onScroll={handleCarouselScroll} ref={carouselRef}>
          {visibleMatches.map((match) => (
            <MobileMatchSlide key={match.id} match={match} />
          ))}
          {!visibleMatches.length ? (
            <article className="mobile-match-slide">
              <div className="mobile-match-empty">
                <span>Radar sem jogos</span>
                <strong>Nenhuma partida encontrada</strong>
                <p>Troque o campeonato ou volte para “Todos” para ver oportunidades disponíveis.</p>
                <button onClick={handleResetFilters} type="button">
                  Ver todos os jogos
                </button>
              </div>
            </article>
          ) : null}
        </div>
      </div>

      {visibleMatches.length ? (
        <div className="mobile-carousel-controls">
          <button
            aria-label="Jogo anterior"
            disabled={activeIndex === 0}
            onClick={() => moveCarousel(-1)}
            type="button"
          >
            &lsaquo;
          </button>
          <span className="mobile-carousel-progress" aria-label={`Jogo ${activeIndex + 1} de ${visibleMatches.length}`}>
            <i style={{ width: `${((activeIndex + 1) / visibleMatches.length) * 100}%` }} />
            <small>{activeIndex + 1} de {visibleMatches.length}</small>
          </span>
          <button
            aria-label="Próximo jogo"
            disabled={activeIndex >= visibleMatches.length - 1}
            onClick={() => moveCarousel(1)}
            type="button"
          >
            &rsaquo;
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default MobileMatchCarousel;
