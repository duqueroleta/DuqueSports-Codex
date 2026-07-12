import { useParams } from 'react-router-dom';
import DetailPageState from '../components/detail/DetailPageState.jsx';
import { DETAIL_PAGE_STATES, resolveDetailPageState } from '../components/detail/detailPageState.js';
import EngineProjectionSection from '../components/matches/detail/EngineProjectionSection.jsx';
import MatchActionPanel from '../components/matches/detail/MatchActionPanel.jsx';
import MatchAnalysisGrid from '../components/matches/detail/MatchAnalysisGrid.jsx';
import MatchDetailHero from '../components/matches/detail/MatchDetailHero.jsx';
import MatchProbabilitiesPanel from '../components/matches/detail/MatchProbabilitiesPanel.jsx';
import { useMatchDetailData } from '../hooks/useMatchDetailData.js';
import '../styles/page-detail.css';

function MatchDetailPage() {
  const { matchId } = useParams();
  const {
    engineProjection,
    error,
    isLoading,
    isProjectionLoading,
    match,
    projectionError,
    retry,
    retryProjection,
  } = useMatchDetailData(matchId);
  const detailState = resolveDetailPageState({ data: match, error, isLoading });

  if (detailState !== DETAIL_PAGE_STATES.READY) {
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
      <MatchDetailHero match={match} />
      <MatchProbabilitiesPanel probabilities={match.probabilities} />
      <EngineProjectionSection
        error={projectionError}
        isLoading={isProjectionLoading}
        onRetry={retryProjection}
        projection={engineProjection}
      />
      <MatchAnalysisGrid match={match} />
      <MatchActionPanel signal={match.signal} />
    </main>
  );
}

export default MatchDetailPage;
