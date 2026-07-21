function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeText(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function normalizeTeamName(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(fc|ec|mg|sc|rj|sp)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseNumericValue(value) {
  const parsed = Number(String(value).replace(',', '.').replace('%', ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function isScoreLine(value) {
  return /^\d+\s*-\s*\d+$/.test(String(value).trim());
}

function isDateTimeLine(value) {
  return /\b\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2}\b/.test(String(value));
}

function isIgnoredMatchLine(value) {
  const normalized = normalizeText(value);

  return !normalized
    || normalized.includes('nova janela')
    || normalized.includes('encerrado')
    || normalized.includes('jogoodds')
    || normalized.includes('sumario')
    || normalized.includes('1 tempo')
    || normalized.includes('2 tempo')
    || normalized.includes('fifa:')
    || isScoreLine(value)
    || isDateTimeLine(value);
}

function teamMatches(target, candidate) {
  const normalizedTarget = normalizeTeamName(target);
  const normalizedCandidate = normalizeTeamName(candidate);

  if (!normalizedTarget || !normalizedCandidate) {
    return false;
  }

  return normalizedCandidate.includes(normalizedTarget)
    || normalizedTarget.includes(normalizedCandidate)
    || normalizedTarget.split(' ').some((token) => token.length > 3 && normalizedCandidate.includes(token));
}

function cleanTeamName(value) {
  return String(value)
    .replace(/\s+(final|disputa|pela|playoffs|rodada|semifinal|quartas|oitavas|da copa|do campeonato).*$/i, '')
    .replace(/[:.]+$/g, '')
    .trim();
}

function readConfrontoTeams(text) {
  const match = String(text).match(/confronto\s+(.+?)\s+[xX×]\s+([^\n:]+)/i);

  if (!match) {
    return {};
  }

  return {
    awayName: cleanTeamName(match[2]),
    homeName: cleanTeamName(match[1]),
  };
}

function readMetric(block, aliases, fallback, blockedTerms = []) {
  const lines = String(block).split(/\r?\n|;/);
  const foundLine = lines.find((line) => {
    const normalizedLine = normalizeText(line);
    const hasAlias = aliases.some((alias) => normalizedLine.includes(alias));
    const hasBlockedTerm = blockedTerms.some((term) => normalizedLine.includes(term));

    return hasAlias && !hasBlockedTerm;
  });

  const value = foundLine?.match(/(\d+(?:[,.]\d+)?%?)/)?.[1];
  return value ? parseNumericValue(value) ?? fallback : fallback;
}

function readInlineMetric(line, aliases) {
  const normalizedLine = normalizeText(line).replace(',', '.');

  for (const alias of aliases) {
    const normalizedAlias = normalizeText(alias);
    const value = normalizedLine.match(new RegExp(`${normalizedAlias}\\s*[:=]?\\s*(\\d+(?:\\.\\d+)?%?)`))?.[1];

    if (value) {
      return parseNumericValue(value);
    }
  }

  return null;
}

function parseInlineRecentMatches(block) {
  return String(block)
    .split(/\r?\n/)
    .map((line) => {
      const normalizedLine = normalizeText(line);
      const isMatchLine = normalizedLine.includes('xg')
        && (normalizedLine.includes('finalizacoes') || normalizedLine.includes('chutes'));

      if (!isMatchLine) {
        return null;
      }

      const xg = readInlineMetric(line, ['xg']);
      const shots = readInlineMetric(line, ['finalizacoes', 'chutes']);

      if (xg === null || shots === null) {
        return null;
      }

      const shotsOnTarget = readInlineMetric(line, ['no alvo', 'chutes no alvo']);
      const xgot = readInlineMetric(line, ['xgot']);
      const goals = readInlineMetric(line, ['gols', 'goals']);

      return {
        goals: goals ?? Math.max(0, Math.round(xg - 0.25)),
        shots,
        shotsOnTarget: shotsOnTarget ?? Math.max(1, Math.round(shots * 0.38)),
        xg,
        xgot: xgot ?? Number((xg * 0.9).toFixed(2)),
      };
    })
    .filter(Boolean)
    .slice(0, 5);
}

function readMetricAroundLabel(lines, startIndex, aliases) {
  const endIndex = Math.min(lines.length, startIndex + 120);
  const labelIndex = lines.slice(startIndex, endIndex).findIndex((line) => (
    aliases.some((alias) => normalizeText(line).includes(alias))
  ));

  if (labelIndex === -1) {
    return null;
  }

  const absoluteIndex = startIndex + labelIndex;
  const homeValue = parseNumericValue(lines[absoluteIndex - 1]);
  const awayValue = parseNumericValue(lines[absoluteIndex + 1]);

  return homeValue === null || awayValue === null ? null : { awayValue, homeValue };
}

function parseScoreGoals(lines, dateIndex, side) {
  const scoreLines = lines.slice(dateIndex + 1, dateIndex + 12).filter((line) => isScoreLine(line));
  const score = scoreLines[side === 'home' ? 0 : 1] ?? scoreLines[0];
  const [homeGoals, awayGoals] = String(score).split('-').map((value) => parseNumericValue(value));

  return side === 'home' ? homeGoals : awayGoals;
}

function getParticipants(lines, destaquesIndex) {
  let dateIndex = -1;

  for (let index = destaquesIndex; index >= Math.max(0, destaquesIndex - 24); index -= 1) {
    if (isDateTimeLine(lines[index])) {
      dateIndex = index;
      break;
    }
  }

  if (dateIndex === -1) {
    return null;
  }

  const teams = lines
    .slice(dateIndex + 1, Math.min(lines.length, dateIndex + 12))
    .filter((line) => !isIgnoredMatchLine(line))
    .slice(0, 2);

  return teams.length === 2 ? { dateIndex, teams } : null;
}

function buildFlashscoreMatch(lines, destaquesIndex, side) {
  const metrics = {
    corners: readMetricAroundLabel(lines, destaquesIndex, ['escanteios']),
    possession: readMetricAroundLabel(lines, destaquesIndex, ['posse de bola']),
    shots: readMetricAroundLabel(lines, destaquesIndex, ['total de finalizacoes']),
    shotsOnTarget: readMetricAroundLabel(lines, destaquesIndex, ['finalizacoes no alvo']),
    xg: readMetricAroundLabel(lines, destaquesIndex, ['gols esperados (xg)']),
    xgot: readMetricAroundLabel(lines, destaquesIndex, ['xg das finalizacoes no alvo']),
  };
  const pick = (metric) => metrics[metric]?.[side === 'home' ? 'homeValue' : 'awayValue'];
  const xg = pick('xg');
  const shots = pick('shots');

  if (xg === undefined || shots === undefined) {
    return null;
  }

  return {
    corners: pick('corners'),
    goals: parseScoreGoals(lines, getParticipants(lines, destaquesIndex).dateIndex, side) ?? Math.max(0, Math.round(xg - 0.25)),
    possession: pick('possession'),
    shots,
    shotsOnTarget: pick('shotsOnTarget') ?? Math.max(1, Math.round(shots * 0.38)),
    xg,
    xgot: pick('xgot') ?? Number((xg * 0.9).toFixed(2)),
  };
}

function parseFlashscoreRecentMatches(text, homeName, awayName) {
  const lines = String(text).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const result = { awayRecentMatches: [], homeRecentMatches: [] };

  lines.forEach((line, index) => {
    if (normalizeText(line) !== 'destaques') {
      return;
    }

    const participants = getParticipants(lines, index);

    if (!participants) {
      return;
    }

    const [historicalHome, historicalAway] = participants.teams;

    if (teamMatches(homeName, historicalHome)) {
      const match = buildFlashscoreMatch(lines, index, 'home');
      if (match) result.homeRecentMatches.push(match);
    } else if (teamMatches(homeName, historicalAway)) {
      const match = buildFlashscoreMatch(lines, index, 'away');
      if (match) result.homeRecentMatches.push(match);
    }

    if (teamMatches(awayName, historicalHome)) {
      const match = buildFlashscoreMatch(lines, index, 'home');
      if (match) result.awayRecentMatches.push(match);
    } else if (teamMatches(awayName, historicalAway)) {
      const match = buildFlashscoreMatch(lines, index, 'away');
      if (match) result.awayRecentMatches.push(match);
    }
  });

  return {
    awayRecentMatches: result.awayRecentMatches.slice(0, 5),
    homeRecentMatches: result.homeRecentMatches.slice(0, 5),
  };
}

function averageRecentMatches(matches, field, fallback, decimals = 2) {
  const validValues = Array.isArray(matches)
    ? matches.map((match) => match[field]).filter((value) => Number.isFinite(value))
    : [];

  if (!validValues.length) {
    return fallback;
  }

  const total = validValues.reduce((sum, value) => sum + toNumber(value), 0);
  return Number((total / validValues.length).toFixed(decimals));
}

function readTextValue(text, aliases, fallback) {
  const lines = String(text).split(/\r?\n|;/);
  const foundLine = lines.find((line) => {
    const normalizedLine = normalizeText(line);
    return aliases.some((alias) => normalizedLine.startsWith(alias));
  });

  if (!foundLine) {
    return fallback;
  }

  const [, value] = foundLine.split(/[:=-]/);
  return value?.trim() || fallback;
}

function readDateValue(text, fallback) {
  const isoDate = String(text).match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
  if (isoDate) {
    return isoDate;
  }

  const brDate = String(text).match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/);
  if (brDate) {
    return `${brDate[3]}-${brDate[2]}-${brDate[1]}`;
  }

  const flashscoreDate = String(text).match(/\b(\d{2})\.(\d{2})\.(\d{4})\s+\d{2}:\d{2}\b/);
  return flashscoreDate ? `${flashscoreDate[3]}-${flashscoreDate[2]}-${flashscoreDate[1]}` : fallback;
}

function readTimeValue(text, fallback) {
  return String(text).match(/\b(?:[01]?\d|2[0-3]):[0-5]\d\b/)?.[0] || fallback;
}

function getSection(text, startAliases, endAliases) {
  const lines = String(text).split(/\r?\n/);
  const startIndex = lines.findIndex((line) => {
    const normalizedLine = normalizeText(line);
    return startAliases.some((alias) => normalizedLine.startsWith(alias));
  });

  if (startIndex === -1) {
    return text;
  }

  const endIndex = lines.findIndex((line, index) => {
    const normalizedLine = normalizeText(line);
    return index > startIndex && endAliases.some((alias) => normalizedLine.startsWith(alias));
  });

  return lines.slice(startIndex, endIndex === -1 ? undefined : endIndex).join('\n');
}

function parseSmartInput(text, currentForm) {
  const titleTeams = readConfrontoTeams(text);
  const homeName = readTextValue(text, ['mandante', 'casa', 'home'], titleTeams.homeName ?? currentForm.homeName);
  const awayName = readTextValue(text, ['visitante', 'fora', 'away'], titleTeams.awayName ?? currentForm.awayName);
  const homeBlock = getSection(text, ['mandante', 'casa', 'home'], ['visitante', 'fora', 'away']);
  const awayBlock = getSection(text, ['visitante', 'fora', 'away'], ['mandante', 'casa', 'home']);
  const flashscoreMatches = parseFlashscoreRecentMatches(text, homeName, awayName);
  const inlineHomeMatches = parseInlineRecentMatches(homeBlock);
  const inlineAwayMatches = parseInlineRecentMatches(awayBlock);
  const homeRecentMatches = inlineHomeMatches.length ? inlineHomeMatches : flashscoreMatches.homeRecentMatches;
  const awayRecentMatches = inlineAwayMatches.length ? inlineAwayMatches : flashscoreMatches.awayRecentMatches;
  const odds = readMetric(text, ['odd', 'odds', 'odd media'], currentForm.odds);

  return {
    ...currentForm,
    awayCorners: averageRecentMatches(awayRecentMatches, 'corners', readMetric(awayBlock, ['escanteios', 'corners'], currentForm.awayCorners)),
    awayName,
    awayPossession: averageRecentMatches(awayRecentMatches, 'possession', readMetric(awayBlock, ['posse'], currentForm.awayPossession), 0),
    awayRecentMatches,
    awayShots: averageRecentMatches(awayRecentMatches, 'shots', readMetric(awayBlock, ['finalizacoes', 'chutes'], currentForm.awayShots, ['alvo']), 0),
    awayShotsOnTarget: averageRecentMatches(awayRecentMatches, 'shotsOnTarget', readMetric(awayBlock, ['no alvo', 'chutes no alvo'], currentForm.awayShotsOnTarget), 0),
    awayXg: averageRecentMatches(awayRecentMatches, 'xg', readMetric(awayBlock, ['xg', 'expected goals'], currentForm.awayXg)),
    competition: readTextValue(text, ['campeonato', 'competicao'], currentForm.competition),
    date: readDateValue(text, currentForm.date),
    homeCorners: averageRecentMatches(homeRecentMatches, 'corners', readMetric(homeBlock, ['escanteios', 'corners'], currentForm.homeCorners)),
    homeName,
    homePossession: averageRecentMatches(homeRecentMatches, 'possession', readMetric(homeBlock, ['posse'], currentForm.homePossession), 0),
    homeRecentMatches,
    homeShots: averageRecentMatches(homeRecentMatches, 'shots', readMetric(homeBlock, ['finalizacoes', 'chutes'], currentForm.homeShots, ['alvo']), 0),
    homeShotsOnTarget: averageRecentMatches(homeRecentMatches, 'shotsOnTarget', readMetric(homeBlock, ['no alvo', 'chutes no alvo'], currentForm.homeShotsOnTarget), 0),
    homeXg: averageRecentMatches(homeRecentMatches, 'xg', readMetric(homeBlock, ['xg', 'expected goals'], currentForm.homeXg)),
    odds,
    time: readTimeValue(text, currentForm.time),
  };
}

export { parseFlashscoreRecentMatches, parseSmartInput };
