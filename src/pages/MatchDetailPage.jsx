import { useParams } from 'react-router-dom';
import DetailHero from '../components/detail/DetailHero.jsx';
import DetailPageState, { resolveDetailPageState } from '../components/detail/DetailPageState.jsx';
import AiExplanationPanel from '../components/matches/detail/AiExplanationPanel.jsx';
import EngineProjectionPanel from '../components/matches/detail/EngineProjectionPanel.jsx';
import MatchActionPanel from '../components/matches/detail/MatchActionPanel.jsx';
import MatchAnalysisGrid from '../components/matches/detail/MatchAnalysisGrid.jsx';
import TeamCrest from '../components/teams/TeamCrest.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { getEngineProjectionByMatchId } from '../services/engineProjectionService.js';
import { getMatchById } from '../services/matchesService.js';
import { getMatchVisualStyle } from '../utils/matchVisuals.js';
import '../styles/page-detail.css';

function MatchDetailPage() {
  const { matchId } = useParams();
  const { data: match, error, isLoading, retry } = useAsyncData(() => getMatchById(matchId), [matchId], null);
  const { data: engineProjection } = useAsyncData(
    () => getEngineProjectionByMatchId(matchId),
    [matchId],
    null,
  );
  const detailState = resolveDetailPageState({ data: match, error, isLoading });

  if (detailState) {
    return (
      <DetailPageState
        backHref="/jogos"
        backLabel="Voltar para Jogos"
        onRetry={retry}
        resource="jogo"
        state={detailState}
      />
    );
  }

  return (
    <main className="detail-page">
      <DetailHero
        backHref="/"
        backLabel="Voltar aos jogos"
        description={match.insight}
        eyebrow={`${match.league} • Hoje, ${match.time}`}
        scoreCaption="Duque Score"
        scoreLabel={match.status}
        scoreValue={match.confidence}
        style={getMatchVisualStyle(match)}
        title={`${match.home} x ${match.away}`}
        titleId="match-detail-title"
      >
        <div className="detail-teams-strip" aria-label="Times da partida">
          <span>
            <TeamCrest size="large" teamName={match.home} />
            <strong>{match.home}</strong>
          </span>
          <i>x</i>
          <span>
            <TeamCrest size="large" teamName={match.away} />
            <strong>{match.away}</strong>
          </span>
        </div>
      </DetailHero>

      <section className="detail-probabilities" aria-label="Probabilidades principais">
        {match.probabilities.map((probability) => (
          <article key={probability.label}>
            <span>{probability.label}</span>
            <strong>{probability.value}%</strong>
            <div>
              <i style={{ width: `${probability.value}%` }} />
            </div>
          </article>
        ))}
      </section>

      <EngineProjectionPanel projection={engineProjection} />
      <AiExplanationPanel explanation={engineProjection?.aiExplanation} />
      <MatchAnalysisGrid match={match} />
      <MatchActionPanel signal={match.signal} />
    </main>
  );
}

export default MatchDetailPage;
