import { ENGINE_VERSION } from '../core/contracts.js';
import { runDuqueScoreCalibrationEngine } from '../calibration/DuqueScoreCalibrationEngine.js';
import { runProbabilityCalibrationEngine } from '../calibration/ProbabilityCalibrationEngine.js';
import { runCompetitiveContextEngine } from '../context/CompetitiveContextEngine.js';
import { runDataQuality } from '../data-quality/DataQualityEngine.js';
import { runExplanationEngine } from '../explainability/ExplanationEngine.js';
import { buildFeatureStoreSnapshot } from '../feature-store/FeatureStore.js';
import { getMatchFeatureValue, getTeamFeatureValue } from '../feature-store/FeatureSelectors.js';
import { runForecastIntelligenceLayer } from '../forecasting/ForecastIntelligenceLayer.js';
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
  const competitiveContext = runCompetitiveContextEngine(matchInput);
  const homeAdjustedXg = getTeamFeatureValue(featureStore, 'home', 'adjusted_xg');
  const awayAdjustedXg = getTeamFeatureValue(featureStore, 'away', 'adjusted_xg');
  const expectedHomeGoals = Number((homeAdjustedXg * competitiveContext.homeModifier * competitiveContext.goalModifier).toFixed(2));
  const expectedAwayGoals = Number((awayAdjustedXg * competitiveContext.awayModifier * competitiveContext.goalModifier).toFixed(2));
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
  const forecastIntelligence = runForecastIntelligenceLayer({
    awayAdjusted,
    competitiveContext,
    expectedAwayGoals,
    expectedHomeGoals,
    homeAdjusted,
    matchInput,
    probabilities: calibration.probabilities,
  });
  const scoreCalibration = runDuqueScoreCalibrationEngine({
    calibration,
    expectedAwayGoals,
    expectedHomeGoals,
    matchInput,
    rawConfidence,
    competitiveContext,
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
    forecastIntelligence,
    aiExplanation,
    opportunityRanking,
    explanation: [
      `Data Quality approved with score ${dataQuality.score}.`,
      `Feature Store registered ${featureStore.catalogSize} official feature definitions.`,
      `${matchInput.homeTeam.name} adjusted xG stored as ${homeAdjustedXg}.`,
      `${matchInput.awayTeam.name} adjusted xG stored as ${awayAdjustedXg}.`,
      `xG differential stored as ${getMatchFeatureValue(featureStore, 'xg_differential')}.`,
      `Competitive Context classified the match as ${competitiveContext.family}.`,
      `Poisson model projects ${poisson.correctScore.homeGoals}-${poisson.correctScore.awayGoals} as the modal scoreline.`,
      `Probable Statistics Engine generated ${probableStatistics.rows.length} projected statistic ranges.`,
      `Forecast Intelligence Layer added distributions, model consensus and Game State scenarios for ${forecastIntelligence.focusMetrics.length} focus metrics without replacing legacy projections.`,
      `Scientific module catalog tracks ${moduleCatalog.implementedCount}/${moduleCatalog.totalModules} implemented modules.`,
      `Duque Score Calibration adjusted raw confidence ${rawConfidence} to ${confidence}.`,
      `Calibration reliability set to ${Math.round(calibration.reliability * 100)}%.`,
      `Opportunity ranking classified the match as ${opportunityRanking.rankSignal}.`,
      matchInput.context.isKnockout ? 'Knockout context reduced goal expectation.' : 'Standard competition context preserved goal expectation.',
    ],
    trace: {
      dataQuality,
      featureStore,
      competitiveContext,
      moduleCatalog,
      recency: { home: homeRecency, away: awayRecency },
      opponentStrength: { home: homeAdjusted, away: awayAdjusted },
      statistical: { poisson, probableStatistics },
      forecasting: forecastIntelligence,
      calibration,
      scoreCalibration,
      explainability: aiExplanation,
      ranking: opportunityRanking,
    },
  };
}

export { runProjectionPipeline };
