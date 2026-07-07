import { competitions } from '../../data/competitions.js';
import '../../styles/competition-rail.css';

const ALL_COMPETITIONS = 'Todos';

function CompetitionRail({ activeCompetition = ALL_COMPETITIONS, onSelect }) {
  const items = [{ id: 'todos', label: ALL_COMPETITIONS, region: 'Geral' }, ...competitions];

  return (
    <section className="competition-rail" aria-label="Campeonatos disponíveis">
      <div className="competition-rail-track">
        {items.map((competition) => {
          const isActive = activeCompetition === competition.label;

          return (
            <button
              aria-pressed={isActive}
              className={isActive ? 'competition-pill competition-pill-active' : 'competition-pill'}
              key={competition.id}
              onClick={() => onSelect?.(competition.label)}
              type="button"
            >
              <span>{competition.label}</span>
              <small>{competition.region}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export { ALL_COMPETITIONS };
export default CompetitionRail;
