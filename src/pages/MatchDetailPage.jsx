import { useParams } from 'react-router-dom';
import DetailHero from '../components/detail/DetailHero.jsx';
import DetailPageState, { resolveDetailPageState } from '../components/detail/DetailPageState.jsx';
import AiExplanationPanel from '../components/matches/detail/AiExplanationPanel.jsx';
import EngineProjectionPanel from '../components/matches/detail/EngineProjectionPanel.jsx';
import MatchActionPanel from '../components/matches/detail/MatchActionPanel.jsx';
import MatchAnalysisGrid from '../components/matches/detail/MatchAnalysisGrid.jsx';
import MatchProbabilitiesPanel from '../components/matches/detail/MatchProbabilitiesPanel.jsx';
import MatchTeamsStrip from '../components/matches/detail/MatchTeamsStrip.jsx';
import { useMatchDetailData } from '../hooks/useMatchDetailData.js';
import { getMatchVisualStyle } from '../utils/matchVisuals.js';
import '../styles/page-detail.css';

function MatchDetailPage() {
  const { matchId } = useParams();
  const { engineProjection, error, isLoading, match, retry } = useMatchDetailData(matchId);
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
        <MatchTeamsStrip awayTeam={match.away} homeTeam={match.home} />
      </DetailHero>

      <MatchProbabilitiesPanel probabilities={match.probabilities} />
      <EngineProjectionPanel projection={engineProjection} />
      <AiExplanationPanel explanation={engineProjection?.aiExplanation} />
      <MatchAnalysisGrid match={match} />
      <MatchActionPanel signal={match.signal} />
    </main>
  );
}

export default MatchDetailPage;
