import { Link, useParams } from 'react-router-dom';
import ErrorState from '../components/error/ErrorState.jsx';
import SkeletonGrid from '../components/loading/SkeletonGrid.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { getMatchById } from '../services/matchesService.js';
import '../styles/page-detail.css';

function MatchDetailPage() {
  const { matchId } = useParams();
  const { data: match, error, isLoading, retry } = useAsyncData(() => getMatchById(matchId), [matchId], null);

  if (isLoading) {
    return (
      <main className="detail-page">
        <section className="detail-grid detail-grid-loading" aria-label="Carregando análise do jogo">
          <SkeletonGrid count={4} />
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="detail-page">
        <section className="detail-grid detail-grid-loading" aria-label="Falha ao carregar análise do jogo">
          <ErrorState onRetry={retry} />
        </section>
      </main>
    );
  }

  if (!match) {
    return (
      <main className="detail-page">
        <section className="detail-empty">
          <h1>Jogo não encontrado</h1>
          <Link to="/jogos">Voltar para Jogos</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="detail-page">
      <section className="detail-hero" aria-labelledby="match-detail-title">
        <div>
          <Link to="/jogos">Voltar para Jogos</Link>
          <span>{match.league}</span>
          <h1 id="match-detail-title">
            {match.home} x {match.away}
          </h1>
          <p>{match.insight}</p>
        </div>

        <aside className="detail-score-panel">
          <span>{match.status}</span>
          <strong>{match.score}</strong>
          <p>{match.time}</p>
        </aside>
      </section>

      <section className="detail-grid" aria-label="Análise do jogo">
        <article className="detail-card detail-card-highlight">
          <span>Sinal principal</span>
          <strong>{match.signal}</strong>
          <p>Odd atual {match.odds} com confiança operacional de {match.confidence}%.</p>
        </article>
        <article className="detail-card">
          <span>Confiança IA</span>
          <strong>{match.confidence}%</strong>
          <p>Score composto por forma, volume ofensivo, preço de mercado e contexto recente.</p>
        </article>
        {match.metrics.map((metric) => (
          <article className="detail-card" key={metric}>
            <span>Métrica</span>
            <strong>{metric}</strong>
            <p>Indicador utilizado para sustentar a leitura do sinal atual.</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default MatchDetailPage;
