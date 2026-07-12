import { formatMatchConfidence } from '../../../utils/matchConfidence.js';
import { normalizeMatchMetrics } from '../../../utils/matchMetrics.js';
import '../../../styles/match-analysis-grid.css';

function getAnalysisCards(match) {
  const confidence = formatMatchConfidence(match.confidence);
  const summaryCards = [
    {
      label: 'Mercado recomendado',
      title: match.signal,
      text: `Odd atual ${match.odds} com confianca operacional de ${confidence}.`,
      variant: 'highlight',
    },
    {
      label: 'Projecao estatistica',
      title: `${confidence} de confianca operacional`,
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
  const metricCards = normalizeMatchMetrics(match.metrics).map((metric) => ({
    key: `metric-${metric}`,
    label: 'Indicador avancado',
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
    <section className="detail-grid" aria-label="Analise completa do jogo">
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
    </section>
  );
}

export default MatchAnalysisGrid;
