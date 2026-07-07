const teamCrests = {
  'Colômbia': { initials: 'COL', colors: ['#f8d448', '#244ed8', '#d9272e'] },
  Gana: { initials: 'GHA', colors: ['#d8232a', '#f6d54a', '#128241'] },
  Cruzeiro: { initials: 'CRU', colors: ['#0b55d9', '#f7fbff', '#143b8f'] },
  Flamengo: { initials: 'FLA', colors: ['#d71920', '#111827', '#f7fbff'] },
  Palmeiras: { initials: 'PAL', colors: ['#0f7a3c', '#f7fbff', '#9be7b2'] },
  'Boca Juniors': { initials: 'BOC', colors: ['#143a86', '#f6c43c', '#07111c'] },
  'São Paulo': { initials: 'SPF', colors: ['#f7fbff', '#d61f2c', '#111827'] },
  Grêmio: { initials: 'GRE', colors: ['#39a9dc', '#111827', '#f7fbff'] },
  Fortaleza: { initials: 'FOR', colors: ['#214a9a', '#d9202f', '#f7fbff'] },
  LDU: { initials: 'LDU', colors: ['#f7fbff', '#d52635', '#111827'] },
  'Real Madrid': { initials: 'RM', colors: ['#f7fbff', '#f4d06f', '#6a7bd8'] },
  'Manchester City': { initials: 'MC', colors: ['#79c9f2', '#f7fbff', '#233a73'] },
  Arsenal: { initials: 'ARS', colors: ['#d71920', '#f7fbff', '#c7a34a'] },
  Liverpool: { initials: 'LIV', colors: ['#c8102e', '#20f6a4', '#f7fbff'] },
  Barcelona: { initials: 'BAR', colors: ['#7b1d7e', '#d91e36', '#f2c94c'] },
  'Atlético Madrid': { initials: 'ATM', colors: ['#d71920', '#f7fbff', '#244ed8'] },
  Inter: { initials: 'INT', colors: ['#0b55d9', '#111827', '#f7fbff'] },
  Milan: { initials: 'MIL', colors: ['#d71920', '#111827', '#f7fbff'] },
  Bayern: { initials: 'BAY', colors: ['#d71920', '#f7fbff', '#1d4ed8'] },
  Dortmund: { initials: 'BVB', colors: ['#f5d328', '#111827', '#f7fbff'] },
  PSG: { initials: 'PSG', colors: ['#1d3f8f', '#d71920', '#f7fbff'] },
  Monaco: { initials: 'ASM', colors: ['#f7fbff', '#d71920', '#d9b45b'] },
  Sevilla: { initials: 'SEV', colors: ['#f7fbff', '#d71920', '#111827'] },
  Roma: { initials: 'ROM', colors: ['#8f1d2c', '#f2b84b', '#111827'] },
  Fiorentina: { initials: 'FIO', colors: ['#6d28d9', '#f7fbff', '#d9b45b'] },
  'Aston Villa': { initials: 'AVL', colors: ['#8cc8f8', '#7f1734', '#f7fbff'] },
  'Al Hilal': { initials: 'HIL', colors: ['#1452d9', '#f7fbff', '#20f6a4'] },
  'Al Nassr': { initials: 'NAS', colors: ['#f5d328', '#1452d9', '#f7fbff'] },
  Benfica: { initials: 'BEN', colors: ['#d71920', '#f7fbff', '#d9b45b'] },
  Porto: { initials: 'POR', colors: ['#1452d9', '#f7fbff', '#20f6a4'] },
  'Inter Miami': { initials: 'MIA', colors: ['#f6a7c8', '#111827', '#f7fbff'] },
  LAFC: { initials: 'LA', colors: ['#111827', '#d9b45b', '#f7fbff'] },
};

function getTeamCrest(teamName) {
  return teamCrests[teamName] || {
    initials: teamName.slice(0, 3).toUpperCase(),
    colors: ['#d9b45b', '#20f6a4', '#07111c'],
  };
}

export { getTeamCrest, teamCrests };
