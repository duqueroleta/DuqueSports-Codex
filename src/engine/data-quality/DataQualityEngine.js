const REQUIRED_TEAM_FIELDS = ['id', 'name', 'opponentTier', 'recentMatches'];
const REQUIRED_RECENT_FIELDS = ['xg', 'xgot', 'shots', 'shotsOnTarget', 'goals'];

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function validateRecentMatch(match, teamName, index) {
  const issues = [];

  REQUIRED_RECENT_FIELDS.forEach((field) => {
    if (!isNumber(match[field])) {
      issues.push(`${teamName}: recent match ${index + 1} missing numeric ${field}`);
    }
  });

  if (isNumber(match.shotsOnTarget) && isNumber(match.shots) && match.shotsOnTarget > match.shots) {
    issues.push(`${teamName}: shotsOnTarget cannot exceed shots`);
  }

  return issues;
}

function validateTeam(team) {
  const issues = [];

  REQUIRED_TEAM_FIELDS.forEach((field) => {
    if (team[field] === undefined || team[field] === null || team[field] === '') {
      issues.push(`${team?.name || 'team'}: missing ${field}`);
    }
  });

  if (!Array.isArray(team.recentMatches) || team.recentMatches.length < 3) {
    issues.push(`${team?.name || 'team'}: at least 3 recent matches are required`);
    return issues;
  }

  team.recentMatches.forEach((match, index) => {
    issues.push(...validateRecentMatch(match, team.name, index));
  });

  return issues;
}

function calculateCompletenessScore(matchInput) {
  const teams = [matchInput.homeTeam, matchInput.awayTeam].filter(Boolean);
  const recentCount = teams.reduce((total, team) => total + (team.recentMatches?.length || 0), 0);
  const sampleScore = Math.min(100, Math.round((recentCount / 10) * 100));
  const freshnessScore = Math.max(60, 100 - Math.round((matchInput.context?.dataFreshnessHours || 0) / 6));

  return Math.round((sampleScore * 0.7) + (freshnessScore * 0.3));
}

function runDataQuality(matchInput) {
  const issues = [];

  if (!matchInput?.id) {
    issues.push('match: missing id');
  }

  if (!matchInput?.competition) {
    issues.push('match: missing competition');
  }

  if (!matchInput?.homeTeam || !matchInput?.awayTeam) {
    issues.push('match: homeTeam and awayTeam are required');
  } else {
    issues.push(...validateTeam(matchInput.homeTeam));
    issues.push(...validateTeam(matchInput.awayTeam));
  }

  const completenessScore = calculateCompletenessScore(matchInput);
  const penalty = Math.min(45, issues.length * 8);
  const score = Math.max(0, completenessScore - penalty);

  return {
    passed: score >= 70 && issues.length === 0,
    score,
    status: score >= 90 ? 'excellent' : score >= 80 ? 'high' : score >= 70 ? 'moderate' : 'blocked',
    issues,
  };
}

export { runDataQuality };
