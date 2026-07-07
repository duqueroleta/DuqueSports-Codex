import MatchCard from './MatchCard.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getMatches } from '../../services/matchesService.js';
import '../../styles/matches-today.css';

function TodayMatches() {
  const { data: matches } = useAsyncData(getMatches, []);

  return (
    <section className="today-matches" aria-labelledby="today-matches-title">
      <div className="section-heading">
        <span>Centro de análise</span>
        <div>
          <h2 id="today-matches-title">Jogos do Dia</h2>
          <p>Partidas prioritárias com leitura estatística, mercado sugerido e confiança da IA.</p>
        </div>
      </div>

      <div className="matches-grid">
        {matches.slice(0, 3).map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  );
}

export default TodayMatches;
