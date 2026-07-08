const competitionVisuals = {
  'Copa do Mundo': { accent: '#f8d448', glow: '#16a34a' },
  Brasileirão: { accent: '#20f6a4', glow: '#f4da91' },
  Libertadores: { accent: '#d9b45b', glow: '#16a34a' },
  'Copa do Brasil': { accent: '#f7fbff', glow: '#d9b45b' },
  'Copa Sul-Americana': { accent: '#f97316', glow: '#20f6a4' },
  'Champions League': { accent: '#8fb8ff', glow: '#d9b45b' },
  'Premier League': { accent: '#c084fc', glow: '#20f6a4' },
  'La Liga': { accent: '#f43f5e', glow: '#f4da91' },
  'Campeonato Italiano (Série A)': { accent: '#38bdf8', glow: '#ef4444' },
  Bundesliga: { accent: '#ef4444', glow: '#facc15' },
  'Campeonato Francês (Ligue 1)': { accent: '#60a5fa', glow: '#f7fbff' },
  'Liga Europa': { accent: '#f97316', glow: '#f7fbff' },
  'Liga Conferência': { accent: '#22c55e', glow: '#8b5cf6' },
  'Liga Profissional Saudita': { accent: '#20f6a4', glow: '#facc15' },
  'Liga Portugal': { accent: '#2563eb', glow: '#ef4444' },
  MLS: { accent: '#f9a8d4', glow: '#d9b45b' },
};

function getMatchVisualStyle(match) {
  const [primary, secondary, tertiary] = match.colors || ['#d9b45b', '#20f6a4', '#07111c'];
  const visual = competitionVisuals[match.league] || { accent: '#d9b45b', glow: '#20f6a4' };

  return {
    '--match-primary': primary,
    '--match-secondary': secondary,
    '--match-tertiary': tertiary,
    '--match-accent': visual.accent,
    '--match-glow': visual.glow,
  };
}

export { getMatchVisualStyle };
