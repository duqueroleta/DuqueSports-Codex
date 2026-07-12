import DetailHero from '../../detail/DetailHero.jsx';
import { normalizeMatchConfidence } from '../../../utils/matchConfidence.js';
import { getMatchVisualStyle } from '../../../utils/matchVisuals.js';
import MatchTeamsStrip from './MatchTeamsStrip.jsx';

function MatchDetailHero({ match }) {
  if (!match) {
    return null;
  }

  return (
    <DetailHero
      backHref="/"
      backLabel="Voltar aos jogos"
      description={match.insight}
      eyebrow={`${match.league} • Hoje, ${match.time}`}
      scoreCaption="Duque Score"
      scoreLabel={match.status}
      scoreValue={normalizeMatchConfidence(match.confidence) ?? '--'}
      style={getMatchVisualStyle(match)}
      title={`${match.home} x ${match.away}`}
      titleId="match-detail-title"
    >
      <MatchTeamsStrip awayTeam={match.away} homeTeam={match.home} />
    </DetailHero>
  );
}

export default MatchDetailHero;
