import { useParams } from 'react-router-dom';
import DetailHero from '../components/detail/DetailHero.jsx';
import DetailPageState, { resolveDetailPageState } from '../components/detail/DetailPageState.jsx';
import EngineProjectionPanel from '../components/matches/detail/EngineProjectionPanel.jsx';
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

      <EngineProjectionPanel projection={engineProjection} />

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
