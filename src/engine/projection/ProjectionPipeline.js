import { ENGINE_VERSION } from '../core/contracts.js';
import { runDataQuality } from '../data-quality/DataQualityEngine.js';
import { runOpponentStrengthEngine } from '../preprocessing/OpponentStrengthEngine.js';
import { runRecencyEngine } from '../preprocessing/RecencyEngine.js';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundProbability(value) {
  return Number(clamp(value, 1, 98).toFixed(1));
}

function buildProbabilities(homeGoals, awayGoals) {
  const totalGoals = homeGoals + awayGoals;
  const goalDifference = homeGoals - awayGoals;
  const homeWin = 50 + (goalDifference * 18);
  const awayWin = 50 - (goalDifference * 18);
  const draw = 28 - (Math.abs(goalDifference) * 5);

  return {
    homeWin: roundProbability(homeWin),
    draw: roundProbability(draw),
    awayWin: roundProbability(awayWin),
    over25: roundProbability((totalGoals - 1.8) * 32 + 50),
    btts: roundProbability(Math.min(homeGoals, awayGoals) * 34 + 30),
  };
}

function calculateConfidence(dataQualityScore, homeAdjusted, awayAdjusted) {
  const sampleStability = 100 - Math.abs(homeAdjusted.metrics.xg - awayAdjusted.metrics.xg) * 8;
  const shotSignal = ((homeAdjusted.metrics.shotsOnTarget + awayAdjusted.metrics.shotsOnTarget) / 10) * 100;

  return Math.round(clamp((dataQualityScore * 0.55) + (sampleStability * 0.25) + (shotSignal * 0.2), 0, 100));
}

function runProjectionPipeline(matchInput) {
  const dataQuality = runDataQuality(matchInput);

  if (!dataQuality.passed) {
    return {
      matchId: matchInput?.id,
      engineVersion: ENGINE_VERSION,
      dataQualityScore: dataQuality.score,
      blocked: true,
      issues: dataQuality.issues,
      explanation: ['Projection blocked because Data Quality Engine did not approve the input.'],
    };
  }

  const homeRecency = runRecencyEngine(matchInput.homeTeam);
  const awayRecency = runRecencyEngine(matchInput.awayTeam);
  const homeAdjusted = runOpponentStrengthEngine(homeRecency, matchInput.homeTeam.opponentTier);
  const awayAdjusted = runOpponentStrengthEngine(awayRecency, matchInput.awayTeam.opponentTier);
  const knockoutModifier = matchInput.context.isKnockout ? 0.94 : 1;
  const venueHomeModifier = matchInput.context.isNeutralVenue ? 1 : 1.06;
  const venueAwayModifier = matchInput.context.isNeutralVenue ? 1 : 0.97;
  const expectedHomeGoals = Number((homeAdjusted.metrics.xg * venueHomeModifier * knockoutModifier).toFixed(2));
  const expectedAwayGoals = Number((awayAdjusted.metrics.xg * venueAwayModifier * knockoutModifier).toFixed(2));
  const confidence = calculateConfidence(dataQuality.score, homeAdjusted, awayAdjusted);

  return {
    matchId: matchInput.id,
    engineVersion: ENGINE_VERSION,
    dataQualityScore: dataQuality.score,
    expectedHomeGoals,
    expectedAwayGoals,
    confidence,
    probabilities: buildProbabilities(expectedHomeGoals, expectedAwayGoals),
    explanation: [
      `Data Quality approved with score ${dataQuality.score}.`,
      `${matchInput.homeTeam.name} recency xG adjusted to ${homeAdjusted.metrics.xg}.`,
      `${matchInput.awayTeam.name} recency xG adjusted to ${awayAdjusted.metrics.xg}.`,
      matchInput.context.isKnockout ? 'Knockout context reduced goal expectation.' : 'Standard competition context preserved goal expectation.',
    ],
    trace: {
      dataQuality,
      recency: { home: homeRecency, away: awayRecency },
      opponentStrength: { home: homeAdjusted, away: awayAdjusted },
    },
  };
}

export { runProjectionPipeline };
