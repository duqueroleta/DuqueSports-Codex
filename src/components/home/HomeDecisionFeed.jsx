import { useMemo, useState } from 'react';
import CompetitionRail, { ALL_COMPETITIONS } from '../competitions/CompetitionRail.jsx';
import ErrorState from '../error/ErrorState.jsx';
import SkeletonGrid from '../loading/SkeletonGrid.jsx';
import MatchCard from '../matches/MatchCard.jsx';
import { useSearch } from '../../context/SearchContext.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getMatches } from '../../services/matchesService.js';
import { calculateAverageMatchConfidence, formatMatchConfidence } from '../../utils/matchConfidence.js';
import { itemMatchesSearch } from '../../utils/search.js';
import '../../styles/home-decision-feed.css';

function HomeDecisionFeed() {
  const [activeCompetition, setActiveCompetition] = useState(ALL_COMPETITIONS);
  const { searchTerm, setSearchTerm } = useSearch();
  const { data: matches, error, isLoading, retry } = useAsyncData(getMatches, []);

  const filteredMatches = useMemo(() => (
    matches
      .filter((match) => activeCompetition === ALL_COMPETITIONS || match.league === activeCompetition)
      .filter((match) => itemMatchesSearch(match, searchTerm))
      .sort((first, second) => (second.confidence ?? 0) - (first.confidence ?? 0))
  ), [activeCompetition, matches, searchTerm]);

  const averageConfidence = calculateAverageMatchConfidence(filteredMatches);
  const leadMatch = filteredMatches[0] ?? null;

  function clearFilters() {
    setActiveCompetition(ALL_COMPETITIONS);
    setSearchTerm('');
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

      {leadMatch ? (
        <div className="home-decision-lead" aria-label="Melhor oportunidade no topo">
          <span>Melhor leitura agora</span>
          <strong>{leadMatch.home} x {leadMatch.away}</strong>
          <small>{leadMatch.signal} com Duque Score {formatMatchConfidence(leadMatch.confidence)}</small>
        </div>
      ) : null}

      <div className="home-decision-list" aria-label="Lista de jogos para decisao">
        {isLoading ? <SkeletonGrid count={4} /> : null}
        {error ? <ErrorState onRetry={retry} /> : null}
        {!isLoading && !error ? filteredMatches.map((match, index) => (
          <MatchCard isActive={index === 0} key={match.id} match={match} />
        )) : null}
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
