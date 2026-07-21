import { useEffect, useMemo, useRef, useState } from 'react';
import CompetitionRail, { ALL_COMPETITIONS } from '../competitions/CompetitionRail.jsx';
import ErrorState from '../error/ErrorState.jsx';
import HomeMatchDecisionCard from './HomeMatchDecisionCard.jsx';
import SkeletonGrid from '../loading/SkeletonGrid.jsx';
import { useSearch } from '../../context/SearchContext.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getMatches } from '../../services/matchesService.js';
import { calculateAverageMatchConfidence, formatMatchConfidence } from '../../utils/matchConfidence.js';
import { itemMatchesSearch } from '../../utils/search.js';
import '../../styles/home-decision-feed.css';

function HomeDecisionFeed() {
  const [activeCompetition, setActiveCompetition] = useState(ALL_COMPETITIONS);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);
  const { searchTerm, setSearchTerm } = useSearch();
  const { data: matches, error, isLoading, retry } = useAsyncData(getMatches, []);

  const filteredMatches = useMemo(() => (
    matches
      .filter((match) => activeCompetition === ALL_COMPETITIONS || match.league === activeCompetition)
      .filter((match) => itemMatchesSearch(match, searchTerm))
      .sort((first, second) => (second.confidence ?? 0) - (first.confidence ?? 0))
  ), [activeCompetition, matches, searchTerm]);

  const averageConfidence = calculateAverageMatchConfidence(filteredMatches);
  const hasPreviousMatch = activeIndex > 0;
  const hasNextMatch = activeIndex < filteredMatches.length - 1;

  useEffect(() => {
    setActiveIndex(0);
    carouselRef.current?.scrollTo({ left: 0 });
  }, [activeCompetition, searchTerm]);

  function clearFilters() {
    setActiveCompetition(ALL_COMPETITIONS);
    setSearchTerm('');
  }

  function moveCarousel(direction) {
    goToMatch(activeIndex + direction);
  }

  function goToMatch(index) {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    const nextIndex = Math.min(Math.max(index, 0), filteredMatches.length - 1);
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
    <section className="home-decision-feed" aria-labelledby="home-decision-title">
      <header className="home-decision-header">
        <div>
          <span>Duque Score</span>
          <h1 id="home-decision-title">Escolha o jogo. Veja a decisao da IA.</h1>
          <p>Menos estatistica na tela. Mais clareza para decidir em segundos.</p>
        </div>

        <div className="home-decision-status" aria-label="Resumo da lista de jogos">
          <span>{filteredMatches.length} jogos</span>
          <strong>{formatMatchConfidence(averageConfidence)}</strong>
          <small>confianca media</small>
        </div>
      </header>

      <label className="home-decision-search">
        <span>Buscar</span>
        <input
          aria-label="Buscar times, mercados ou auditorias"
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar times, mercados ou auditorias"
          type="search"
          value={searchTerm}
        />
      </label>

      <CompetitionRail activeCompetition={activeCompetition} onSelect={setActiveCompetition} />

      <div className="home-decision-carousel-shell">
        {filteredMatches.length > 1 ? (
          <div className="home-decision-carousel-hint" aria-hidden="true">
            Arraste para trocar de jogo
          </div>
        ) : null}
        <div
          className="home-decision-list"
          aria-label="Carrossel de jogos para decisao"
          onScroll={handleCarouselScroll}
          ref={carouselRef}
        >
          {isLoading ? <SkeletonGrid count={4} /> : null}
          {error ? <ErrorState onRetry={retry} /> : null}
          {!isLoading && !error ? filteredMatches.map((match, index) => (
            <HomeMatchDecisionCard isLead={index === activeIndex} key={match.id} match={match} />
          )) : null}
        </div>

        {filteredMatches.length > 1 ? (
          <div className="home-decision-carousel-controls" aria-label="Navegacao entre jogos">
            <button
              aria-label="Jogo anterior"
              disabled={!hasPreviousMatch}
              onClick={() => moveCarousel(-1)}
              type="button"
            >
              &lsaquo;
            </button>
            <span aria-label={`Jogo ${activeIndex + 1} de ${filteredMatches.length}`}>
              <i style={{ width: `${((activeIndex + 1) / filteredMatches.length) * 100}%` }} />
              <small>{activeIndex + 1} de {filteredMatches.length}</small>
            </span>
            <button
              aria-label="Proximo jogo"
              disabled={!hasNextMatch}
              onClick={() => moveCarousel(1)}
              type="button"
            >
              &rsaquo;
            </button>
          </div>
        ) : null}

        {filteredMatches.length > 1 ? (
          <div className="home-decision-carousel-dots" aria-label="Selecionar jogo no carrossel">
            {filteredMatches.map((match, index) => (
              <button
                aria-current={activeIndex === index ? 'true' : undefined}
                aria-label={`Abrir ${match.home} contra ${match.away}`}
                className={activeIndex === index ? 'home-decision-dot-active' : ''}
                key={match.id}
                onClick={() => goToMatch(index)}
                type="button"
              />
            ))}
          </div>
        ) : null}
      </div>

      {!isLoading && !error && !filteredMatches.length ? (
        <div className="home-decision-empty">
          <span>Nenhum jogo encontrado</span>
          <strong>Troque a busca ou o campeonato</strong>
          <button onClick={clearFilters} type="button">Ver todos os jogos</button>
        </div>
      ) : null}
    </section>
  );
}

export default HomeDecisionFeed;
