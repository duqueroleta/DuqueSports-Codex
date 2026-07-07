import AuditRow from './AuditRow.jsx';
import '../../styles/audits-latest.css';

const audits = [
  {
    id: 1,
    match: 'Barcelona x Atlético Madrid',
    market: 'Ambas marcam',
    odd: '1.64',
    result: 'Green',
    accuracy: '91%',
    trust: 'Elite',
  },
  {
    id: 2,
    match: 'Arsenal x Liverpool',
    market: 'Over 2.5',
    odd: '1.78',
    result: 'Pendente',
    accuracy: '82%',
    trust: 'Alta',
  },
  {
    id: 3,
    match: 'Inter x Milan',
    market: 'Under 3.5',
    odd: '1.42',
    result: 'Green',
    accuracy: '76%',
    trust: 'Estável',
  },
  {
    id: 4,
    match: 'Benfica x Porto',
    market: 'Escanteios +8.5',
    odd: '1.86',
    result: 'Red',
    accuracy: '68%',
    trust: 'Revisar',
  },
];

function LatestAudits() {
  return (
    <section className="latest-audits" aria-labelledby="latest-audits-title">
      <div className="section-heading latest-audits-heading">
        <span>Transparência</span>
        <div>
          <h2 id="latest-audits-title">Últimas Auditorias</h2>
          <p>Histórico recente de sinais avaliados pelo modelo, com resultado e grau de confiabilidade.</p>
        </div>
      </div>

      <div className="audits-panel">
        <div className="audits-header" aria-hidden="true">
          <span>Partida</span>
          <span>Mercado</span>
          <span>Odd</span>
          <span>Resultado</span>
          <span>Precisão</span>
          <span>Selo</span>
        </div>

        {audits.map((audit) => (
          <AuditRow audit={audit} key={audit.id} />
        ))}
      </div>
    </section>
  );
}

export default LatestAudits;
