import StatCard from './StatCard.jsx';
import { getLeadCount } from '../../services/leadsService.js';
import '../../styles/stats-global.css';

function GlobalStats() {
  const leadCount = getLeadCount();
  const stats = [
    {
      id: 1,
      label: 'Taxa de acerto',
      value: '78.4%',
      detail: '+6.2% nos ultimos 30 dias',
      tone: 'neon',
      progress: 78,
      trend: 'alta controlada',
    },
    {
      id: 2,
      label: 'ROI projetado',
      value: '+18.7%',
      detail: 'baseado em gestao de stake padrao',
      tone: 'gold',
      progress: 64,
      trend: 'modelo validado',
    },
    {
      id: 3,
      label: 'Sinais analisados',
      value: '12.840',
      detail: 'amostra validada pelo modelo',
      tone: 'white',
      progress: 88,
      trend: 'escala ativa',
    },
    {
      id: 4,
      label: 'Lista VIP',
      value: `${leadCount}+`,
      detail: 'usuarios acompanhando o acesso gratuito',
      tone: 'neon',
      progress: 72,
      trend: 'captacao aberta',
    },
  ];

  return (
    <section className="global-stats" aria-labelledby="global-stats-title">
      <div className="global-stats-header">
        <div className="section-heading global-stats-heading">
          <span>Inteligencia do sistema</span>
          <h2 id="global-stats-title">Estatisticas Globais</h2>
          <p>Indicadores consolidados para acompanhar desempenho, escala e precisao do motor Duque Score.</p>
        </div>

        <aside className="global-stats-summary" aria-label="Resumo do motor Duque Score">
          <span>Motor Duque Score</span>
          <strong>12.840 sinais auditados</strong>
          <p>Modelo gratuito em fase de captacao, com leitura estatistica, auditoria e ranking de mercados.</p>
        </aside>
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
