import { formatMatchConfidence } from '../../../utils/matchConfidence.js';
import { normalizeMatchMetrics } from '../../../utils/matchMetrics.js';
import { formatMatchOdds } from '../../../utils/matchOdds.js';
import '../../../styles/match-analysis-grid.css';

function getAnalysisCards(match) {
  const confidence = formatMatchConfidence(match.confidence);
  const odds = formatMatchOdds(match.odds);
  const summaryCards = [
    {
      label: 'Mercado recomendado',
      title: match.signal,
      text: `Odd atual ${odds} com confiança operacional de ${confidence}.`,
      variant: 'highlight',
    },
    {
      label: 'Projeção estatística',
      title: `${confidence} de confiança operacional`,
      text: 'Score composto por forma recente, volume ofensivo, pressão territorial e preço médio do mercado.',
    },
    {
      label: 'Cenário provável',
      title: match.signal,
      text: match.insight,
    },
    {
      label: 'Gestão de risco',
      title: `Odd média ${odds}`,
      text: 'Leitura indicada para estudo prévio. A entrada deve respeitar banca, limite pessoal e contexto ao vivo.',
    },
  ];
  const metricCards = normalizeMatchMetrics(match.metrics).map((metric) => ({
    key: `metric-${metric}`,
    label: 'Indicador avançado',
    title: metric,
    text: 'Indicador utilizado para sustentar a leitura da IA.',
    variant: 'compact',
  }));

  return [...summaryCards, ...metricCards];
}

function MatchAnalysisGrid({ match }) {
  if (!match) {
    return null;
  }

  const cards = getAnalysisCards(match);

  return (
    <section className="detail-analysis" id="fundamentos" aria-label="Análise completa do jogo">
      <header>
        <span>Fundamentos estatísticos</span>
        <strong>Por que esta leitura?</strong>
      </header>
      <div className="detail-grid">
        {cards.map((card) => {
          const variantClass = card.variant ? ` detail-card-${card.variant}` : '';

          return (
            <article className={`detail-card${variantClass}`} key={card.key ?? card.label}>
              <span>{card.label}</span>
              <strong>{card.title}</strong>
              <p>{card.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default MatchAnalysisGrid;
