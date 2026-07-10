import { Link, useParams } from 'react-router-dom';
import DetailHero from '../components/detail/DetailHero.jsx';
import ErrorState from '../components/error/ErrorState.jsx';
import SkeletonGrid from '../components/loading/SkeletonGrid.jsx';
import TeamCrest from '../components/teams/TeamCrest.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { getEngineProjectionByMatchId } from '../services/engineProjectionService.js';
import { getMatchById } from '../services/matchesService.js';
import { getMatchVisualStyle } from '../utils/matchVisuals.js';
import '../styles/page-detail.css';

const BETSLIP_URL = 'https://wlsuperbet.adsrv.eacdn.com/C.ashx?btag=a_46656b_431c_&affid=873&siteid=46656&adid=431&c=';

function getAnalysisBlocks(match) {
  return [
    {
      label: 'Projecao estatistica',
      title: `${match.confidence}% de confianca operacional`,
      text: 'Score composto por forma recente, volume ofensivo, pressao territorial e preco medio do mercado.',
    },
    {
      label: 'Cenario provavel',
      title: match.signal,
      text: match.insight,
    },
    {
      label: 'Gestao de risco',
      title: `Odd media ${match.odds}`,
      text: 'Leitura indicada para estudo previo. A entrada deve respeitar banca, limite pessoal e contexto ao vivo.',
    },
  ];
}

function MatchDetailPage() {
  const { matchId } = useParams();
  const { data: match, error, isLoading, retry } = useAsyncData(() => getMatchById(matchId), [matchId], null);
  const { data: engineProjection } = useAsyncData(
    () => getEngineProjectionByMatchId(matchId),
    [matchId],
    null,
  );

  if (isLoading) {
    return (
      <main className="detail-page">
        <section className="detail-grid detail-grid-loading" aria-label="Carregando analise do jogo">
          <SkeletonGrid count={4} />
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="detail-page">
        <section className="detail-grid detail-grid-loading" aria-label="Falha ao carregar analise do jogo">
          <ErrorState onRetry={retry} />
        </section>
      </main>
    );
  }

  if (!match) {
    return (
      <main className="detail-page">
        <section className="detail-empty">
          <h1>Jogo nao encontrado</h1>
          <Link to="/jogos">Voltar para Jogos</Link>
        </section>
      </main>
    );
  }

  const analysisBlocks = getAnalysisBlocks(match);

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

      {engineProjection && !engineProjection.blocked ? (
        <section className="engine-projection-panel" aria-label="DUQUE Score Engine v1 fase 6">
          <div>
            <span>Engine v1 - Fase 6</span>
            <strong>Ranking de oportunidade ativo</strong>
            <p>{engineProjection.explanation[7]}</p>
          </div>
          <div className="engine-projection-metrics">
            <article>
              <span>Data Quality</span>
              <strong>{engineProjection.dataQualityScore}</strong>
            </article>
            <article>
              <span>xG mandante</span>
              <strong>{engineProjection.expectedHomeGoals}</strong>
            </article>
            <article>
              <span>xG visitante</span>
              <strong>{engineProjection.expectedAwayGoals}</strong>
            </article>
            <article>
              <span>Over 2.5</span>
              <strong>{engineProjection.probabilities.over25}%</strong>
            </article>
            <article>
              <span>Casa vence</span>
              <strong>{engineProjection.probabilities.homeWin}%</strong>
            </article>
            <article>
              <span>BTTS</span>
              <strong>{engineProjection.probabilities.btts}%</strong>
            </article>
            <article>
              <span>Oportunidade</span>
              <strong>{engineProjection.opportunityRanking.opportunityScore}</strong>
            </article>
            <article>
              <span>Tier</span>
              <strong>{engineProjection.opportunityRanking.tier}</strong>
            </article>
          </div>
        </section>
      ) : null}

      {engineProjection?.aiExplanation ? (
        <section className="ai-explanation-panel" aria-label="Explicacao da IA">
          <div className="ai-explanation-main">
            <span>Explicabilidade IA</span>
            <strong>{engineProjection.aiExplanation.headline}</strong>
            <p>{engineProjection.aiExplanation.verdict}</p>
          </div>
          <div className="ai-explanation-grid">
            {engineProjection.aiExplanation.keyDrivers.slice(0, 3).map((driver) => (
              <article key={driver}>
                <span>Fator</span>
                <p>{driver}</p>
              </article>
            ))}
            <article className="ai-explanation-risk">
              <span>Risco</span>
              <p>{engineProjection.aiExplanation.riskFlags[0]}</p>
            </article>
          </div>
        </section>
      ) : null}

      <section className="detail-grid" aria-label="Analise completa do jogo">
        <article className="detail-card detail-card-highlight">
          <span>Mercado recomendado</span>
          <strong>{match.signal}</strong>
          <p>Odd atual {match.odds} com confianca operacional de {match.confidence}%.</p>
        </article>

        {analysisBlocks.map((block) => (
          <article className="detail-card" key={block.label}>
            <span>{block.label}</span>
            <strong>{block.title}</strong>
            <p>{block.text}</p>
          </article>
        ))}

        {match.metrics.map((metric) => (
          <article className="detail-card detail-card-compact" key={metric}>
            <span>Indicador avancado</span>
            <strong>{metric}</strong>
            <p>Indicador utilizado para sustentar a leitura da IA.</p>
          </article>
        ))}
      </section>

      <section className="detail-action-panel" aria-label="Acoes da analise">
        <div>
          <span>Decisao rapida</span>
          <strong>{match.signal}</strong>
          <p>Abra o bilhete somente se a leitura fizer sentido para sua estrategia.</p>
        </div>
        <a href={BETSLIP_URL} rel="noreferrer" target="_blank">
          Abrir bilhete pronto
        </a>
      </section>
    </main>
  );
}

export default MatchDetailPage;
