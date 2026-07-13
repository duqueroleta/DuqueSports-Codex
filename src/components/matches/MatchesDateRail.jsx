import '../../styles/matches-date-rail.css';

const dateOffsets = [-1, 0, 1, 2, 3];

function getDateOption(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);

  return {
    day: new Intl.DateTimeFormat('pt-BR', { day: '2-digit' }).format(date),
    label: offset === 0
      ? 'Hoje'
      : new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date).replace('.', ''),
    offset,
  };
}

function MatchesDateRail({ activeDay, onSelect }) {
  const options = dateOffsets.map(getDateOption);

  return (
    <nav className="matches-date-rail" aria-label="Selecionar data dos jogos">
      {options.map((option) => (
        <button
          aria-pressed={activeDay === option.offset}
          className={activeDay === option.offset ? 'matches-date-active' : ''}
          key={option.offset}
          onClick={() => onSelect(option.offset)}
          type="button"
        >
          <span>{option.label}</span>
          <strong>{option.day}</strong>
        </button>
      ))}
    </nav>
  );
}

export default MatchesDateRail;
