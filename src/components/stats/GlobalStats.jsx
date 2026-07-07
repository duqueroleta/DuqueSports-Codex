import StatCard from './StatCard.jsx';
import '../../styles/stats-global.css';

const stats = [
  {
    id: 1,
    label: 'Taxa de acerto',
    value: '78.4%',
    detail: '+6.2% nos últimos 30 dias',
    tone: 'neon',
  },
  {
    id: 2,
    label: 'ROI projetado',
    value: '+18.7%',
    detail: 'baseado em gestão de stake padrão',
    tone: 'gold',
  },
  {
    id: 3,
    label: 'Sinais analisados',
    value: '12.840',
    detail: 'amostra validada pelo modelo',
    tone: 'white',
  },
  {
    id: 4,
    label: 'Mercados rastreados',
    value: '146',
    detail: 'pré-jogo e ao vivo',
    tone: 'neon',
  },
];

function GlobalStats() {
  return (
    <section className="global-stats" aria-labelledby="global-stats-title">
      <div className="section-heading global-stats-heading">
        <span>Inteligência do sistema</span>
        <div>
          <h2 id="global-stats-title">Estatísticas Globais</h2>
          <p>Indicadores consolidados para acompanhar desempenho, escala e precisão do motor DUQUE.</p>
        </div>
      </div>

      <div className="global-stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>
    </section>
  );
}

export default GlobalStats;
