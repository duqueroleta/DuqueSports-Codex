import AuditRow from './AuditRow.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getAudits } from '../../services/auditsService.js';
import '../../styles/audits-latest.css';

function parseAccuracy(accuracy) {
  return Number(accuracy.replace('%', ''));
}

function LatestAudits() {
  const { data: audits } = useAsyncData(getAudits, []);
  const latestAudits = audits.slice(0, 4);
  const greenCount = latestAudits.filter((audit) => audit.result === 'Green').length;
  const pendingCount = latestAudits.filter((audit) => audit.result === 'Pendente').length;
  const averageAccuracy = latestAudits.length
    ? Math.round(latestAudits.reduce((total, audit) => total + parseAccuracy(audit.accuracy), 0) / latestAudits.length)
    : 0;

  return (
    <section className="latest-audits" aria-labelledby="latest-audits-title">
      <div className="latest-audits-header">
        <div className="section-heading latest-audits-heading">
          <span>Transparência</span>
          <h2 id="latest-audits-title">Últimas Auditorias</h2>
          <p>Histórico recente de sinais avaliados pelo modelo, com resultado e grau de confiabilidade.</p>
        </div>

        <div className="latest-audits-metrics" aria-label="Resumo das auditorias recentes">
          <div>
            <strong>{greenCount}</strong>
            <span>greens recentes</span>
          </div>
          <div>
            <strong>{pendingCount}</strong>
            <span>em monitoramento</span>
          </div>
          <div>
            <strong>{averageAccuracy}%</strong>
            <span>precisão média</span>
          </div>
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

        {latestAudits.map((audit) => (
          <AuditRow audit={audit} key={audit.id} />
        ))}
      </div>
    </section>
  );
}

export default LatestAudits;
