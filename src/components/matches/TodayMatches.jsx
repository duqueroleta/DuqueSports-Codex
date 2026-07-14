import MatchCard from './MatchCard.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getMatches } from '../../services/matchesService.js';
import { calculateAverageMatchConfidence, formatMatchConfidence } from '../../utils/matchConfidence.js';
import '../../styles/matches-today.css';

function TodayMatches() {
  const { data: matches } = useAsyncData(getMatches, []);
  const featuredMatches = matches.slice(0, 3);
  const liveMatchesCount = matches.filter((match) => match.status === 'Ao vivo').length;
  const averageConfidence = calculateAverageMatchConfidence(featuredMatches);

  return (
    <section className="today-matches" aria-labelledby="today-matches-title">
      <div className="today-matches-header">
        <div className="section-heading">
          <span>Centro de análise</span>
          <h2 id="today-matches-title">Jogos do Dia</h2>
          <p>Partidas prioritárias com leitura estatística, mercado sugerido e confiança da IA.</p>
        </div>

        <div className="today-matches-metrics" aria-label="Resumo dos jogos do dia">
          <div>
            <strong>{matches.length}</strong>
            <span>jogos mapeados</span>
          </div>
          <div>
            <strong>{liveMatchesCount}</strong>
            <span>ao vivo agora</span>
          </div>
          <div>
            <strong>{formatMatchConfidence(averageConfidence)}</strong>
            <span>confiança média</span>
          </div>
        </div>
      </div>

      <div className="matches-grid">
        {featuredMatches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  );
}

export default TodayMatches;
