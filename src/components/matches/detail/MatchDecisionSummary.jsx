import { AFFILIATE_LINKS } from '../../../config/affiliateLinks.js';
import { getMatchConfidenceLabel, normalizeMatchConfidence } from '../../../utils/matchConfidence.js';
import { formatMatchOdds } from '../../../utils/matchOdds.js';
import { normalizeMatchProbabilities } from '../../../utils/matchProbabilities.js';
import '../../../styles/match-decision-summary.css';

function MatchDecisionSummary({ match }) {
  if (!match) {
    return null;
  }

  const confidence = normalizeMatchConfidence(match.confidence);
  const confidenceLabel = getMatchConfidenceLabel(confidence);
  const probabilities = normalizeMatchProbabilities(match.probabilities);
  const marketProbability = probabilities[1] ?? probabilities[0] ?? null;

  return (
    <section className="match-decision-summary" aria-label="Resumo executivo da analise">
      <div className="match-decision-copy">
        <span>Decisao rapida</span>
        <strong>{match.signal}</strong>
        <p>{match.insight}</p>
      </div>

      <div className="match-decision-metrics" aria-label="Indicadores da recomendacao">
        <span>
          <small>Modelo</small>
          <strong>{marketProbability ? `${marketProbability.value}%` : `${confidence ?? '--'}%`}</strong>
          <em>{marketProbability?.label ?? confidenceLabel}</em>
        </span>
        <span>
          <small>Confianca</small>
          <strong>{confidence ?? '--'}</strong>
          <em>{confidenceLabel}</em>
        </span>
        <span>
          <small>Odd media</small>
          <strong>{formatMatchOdds(match.odds)}</strong>
          <em>mercado atual</em>
        </span>
      </div>

      <a href={AFFILIATE_LINKS.readyBetslip} rel="noreferrer" target="_blank">
        <span aria-hidden="true">R$</span>
        <strong>Bilhete pronto</strong>
      </a>
    </section>
  );
}

export default MatchDecisionSummary;
