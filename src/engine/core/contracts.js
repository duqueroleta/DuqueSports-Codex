/**
 * @typedef {Object} TeamRecentMatch
 * @property {number} xg
 * @property {number} xgot
 * @property {number} shots
 * @property {number} shotsOnTarget
 * @property {number} goals
 */

/**
 * @typedef {Object} EngineTeamInput
 * @property {string} id
 * @property {string} name
 * @property {'elite'|'strong'|'balanced'|'weak'} opponentTier
 * @property {TeamRecentMatch[]} recentMatches
 */

/**
 * @typedef {Object} EngineMatchInput
 * @property {string|number} id
 * @property {string} competition
 * @property {EngineTeamInput} homeTeam
 * @property {EngineTeamInput} awayTeam
 * @property {Object} context
 * @property {boolean} context.isNeutralVenue
 * @property {boolean} context.isKnockout
 * @property {number} context.dataFreshnessHours
 */

/**
 * @typedef {Object} EngineProjection
 * @property {string|number} matchId
 * @property {string} engineVersion
 * @property {number} dataQualityScore
 * @property {number} expectedHomeGoals
 * @property {number} expectedAwayGoals
 * @property {number} confidence
 * @property {{homeWin:number, draw:number, awayWin:number, over25:number, under25:number, btts:number}} probabilities
 * @property {Object} aiExplanation
 * @property {Object} opportunityRanking
 * @property {string[]} explanation
 */

const ENGINE_VERSION = 'duque-score-engine-v1.phase-82';

export { ENGINE_VERSION };
