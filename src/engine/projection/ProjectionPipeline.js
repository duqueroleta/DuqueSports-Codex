import { ENGINE_VERSION } from '../core/contracts.js';
import { runDuqueScoreCalibrationEngine } from '../calibration/DuqueScoreCalibrationEngine.js';
import { runProbabilityCalibrationEngine } from '../calibration/ProbabilityCalibrationEngine.js';
import { runDataQuality } from '../data-quality/DataQualityEngine.js';
import { runExplanationEngine } from '../explainability/ExplanationEngine.js';
import { buildFeatureStoreSnapshot } from '../feature-store/FeatureStore.js';
import { getMatchFeatureValue, getTeamFeatureValue } from '../feature-store/FeatureSelectors.js';
import { getScientificModuleCatalogSnapshot } from '../modules/ScientificModuleCatalog.js';
import { runOpponentStrengthEngine } from '../preprocessing/OpponentStrengthEngine.js';
import { runOpportunityRankingEngine } from '../ranking/OpportunityRankingEngine.js';
import { runRecencyEngine } from '../preprocessing/RecencyEngine.js';
import { runPoissonEngine } from '../statistical/PoissonEngine.js';
import { runProbableStatisticsEngine } from '../statistical/ProbableStatisticsEngine.js';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
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
  const featureStore = buildFeatureStoreSnapshot({
    matchId: matchInput.id,
    homeAdjusted,
    awayAdjusted,
  });
  const knockoutModifier = matchInput.context.isKnockout ? 0.94 : 1;
  const venueHomeModifier = matchInput.context.isNeutralVenue ? 1 : 1.06;
  const venueAwayModifier = matchInput.context.isNeutralVenue ? 1 : 0.97;
  const homeAdjustedXg = getTeamFeatureValue(featureStore, 'home', 'adjusted_xg');
  const awayAdjustedXg = getTeamFeatureValue(featureStore, 'away', 'adjusted_xg');
  const expectedHomeGoals = Number((homeAdjustedXg * venueHomeModifier * knockoutModifier).toFixed(2));
  const expectedAwayGoals = Number((awayAdjustedXg * venueAwayModifier * knockoutModifier).toFixed(2));
  const poisson = runPoissonEngine({
    homeLambda: expectedHomeGoals,
    awayLambda: expectedAwayGoals,
  });
  const probableStatistics = runProbableStatisticsEngine({
    awayAdjusted,
    expectedAwayGoals,
    expectedHomeGoals,
    homeAdjusted,
    matchInput,
  });
  const moduleCatalog = getScientificModuleCatalogSnapshot();
  const rawConfidence = calculateConfidence(dataQuality.score, homeAdjusted, awayAdjusted);
  const calibration = runProbabilityCalibrationEngine({
    probabilities: poisson.probabilities,
    dataQualityScore: dataQuality.score,
    confidence: rawConfidence,
  });
  const scoreCalibration = runDuqueScoreCalibrationEngine({
    calibration,
    expectedAwayGoals,
    expectedHomeGoals,
    matchInput,
    rawConfidence,
  });
  const confidence = scoreCalibration.duqueScore;
  const aiExplanation = runExplanationEngine({
    matchInput,
    expectedHomeGoals,
    expectedAwayGoals,
    probabilities: calibration.probabilities,
    dataQuality,
    featureStore,
    poisson,
    calibration,
  });
  const opportunityRanking = runOpportunityRankingEngine({
    dataQualityScore: dataQuality.score,
    confidence,
    calibration,
    aiExplanation,
  });

  return {
    matchId: matchInput.id,
    engineVersion: ENGINE_VERSION,
    dataQualityScore: dataQuality.score,
    expectedHomeGoals,
    expectedAwayGoals,
    confidence,
    probabilities: calibration.probabilities,
    aiExplanation,
    opportunityRanking,
    explanation: [
      `Data Quality approved with score ${dataQuality.score}.`,
      `Feature Store registered ${featureStore.catalogSize} official feature definitions.`,
      `${matchInput.homeTeam.name} adjusted xG stored as ${homeAdjustedXg}.`,
      `${matchInput.awayTeam.name} adjusted xG stored as ${awayAdjustedXg}.`,
      `xG differential stored as ${getMatchFeatureValue(featureStore, 'xg_differential')}.`,
      `Poisson model projects ${poisson.correctScore.homeGoals}-${poisson.correctScore.awayGoals} as the modal scoreline.`,
      `Probable Statistics Engine generated ${probableStatistics.rows.length} projected statistic ranges.`,
      `Scientific module catalog tracks ${moduleCatalog.implementedCount}/${moduleCatalog.totalModules} implemented modules.`,
      `Duque Score Calibration adjusted raw confidence ${rawConfidence} to ${confidence}.`,
      `Calibration reliability set to ${Math.round(calibration.reliability * 100)}%.`,
      `Opportunity ranking classified the match as ${opportunityRanking.rankSignal}.`,
      matchInput.context.isKnockout ? 'Knockout context reduced goal expectation.' : 'Standard competition context preserved goal expectation.',
    ],
    trace: {
      dataQuality,
      featureStore,
      moduleCatalog,
      recency: { home: homeRecency, away: awayRecency },
      opponentStrength: { home: homeAdjusted, away: awayAdjusted },
      statistical: { poisson, probableStatistics },
      calibration,
      scoreCalibration,
      explainability: aiExplanation,
      ranking: opportunityRanking,
    },
  };
}

export { runProjectionPipeline };
