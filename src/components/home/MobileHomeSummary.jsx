import { Link } from 'react-router-dom';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getMatches } from '../../services/matchesService.js';
import { calculateAverageMatchConfidence, formatMatchConfidence } from '../../utils/matchConfidence.js';
import TeamCrest from '../teams/TeamCrest.jsx';
import '../../styles/mobile-home-summary.css';

function getTopMatch(matches) {
  return [...matches].sort((first, second) => second.confidence - first.confidence)[0] ?? null;
}

function MobileHomeSummary() {
  const { data: matches } = useAsyncData(getMatches, []);
  const topMatch = getTopMatch(matches);
  const liveMatches = matches.filter((match) => match.status === 'Ao vivo').length;
  const averageConfidence = calculateAverageMatchConfidence(matches);

  return (
    <section className="mobile-home-summary" aria-label="Resumo rápido do dia">
      <div className="mobile-home-summary-heading">
        <div>
          <span>Duque Score</span>
          <h1>Jogos e sinais em segundos</h1>
        </div>
        <strong>{formatMatchConfidence(averageConfidence)}</strong>
      </div>

      {topMatch ? (
        <Link className="mobile-home-feature" to={`/jogos/${topMatch.id}`}>
          <span>Melhor oportunidade</span>
          <div>
            <TeamCrest size="small" teamName={topMatch.home} />
            <strong>{topMatch.home} x {topMatch.away}</strong>
            <TeamCrest size="small" teamName={topMatch.away} />
          </div>
          <small>{formatMatchConfidence(topMatch.confidence)} de confiança • {topMatch.signal}</small>
        </Link>
      ) : null}

      <div className="mobile-home-stats">
        <span>
          <small>Partidas</small>
          <strong>{matches.length}</strong>
        </span>
        <span>
          <small>Ao vivo</small>
          <strong>{liveMatches}</strong>
        </span>
        <span>
          <small>Alta confiança</small>
          <strong>{matches.filter((match) => match.confidence >= 80).length}</strong>
        </span>
      </div>

      <nav className="mobile-home-shortcuts" aria-label="Acesso rápido">
        <Link to="/jogos">
          <small>Jogos</small>
          <strong>Carrossel</strong>
        </Link>
        <Link to="/analises">
          <small>Análises</small>
          <strong>IA completa</strong>
        </Link>
        <Link to="/mercados">
          <small>Mercados</small>
          <strong>Força</strong>
        </Link>
        <Link to="/ao-vivo">
          <small>Ao vivo</small>
          <strong>Sinais</strong>
        </Link>
      </nav>

      <div className="mobile-home-actions">
        <Link to="/jogos">Abrir jogos de hoje</Link>
        <Link to="/lista-vip">Lista VIP grátis</Link>
      </div>
    </section>
  );
}

export default MobileHomeSummary;
