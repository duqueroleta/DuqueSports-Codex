import { useMemo } from 'react';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getAudits } from '../../services/auditsService.js';
import { getLiveMatches } from '../../services/liveService.js';
import { getMarkets } from '../../services/marketsService.js';
import { getMatches } from '../../services/matchesService.js';
import '../../styles/system-status.css';

function createStatus(label, state) {
  if (state.isLoading) {
    return { label, tone: 'loading', value: 'Checando' };
  }

  if (state.error) {
    return { label, tone: 'error', value: 'Falha' };
  }

  return { label, tone: 'ok', value: 'Operacional' };
}

function SystemStatus() {
  const matchesState = useAsyncData(getMatches, []);
  const marketsState = useAsyncData(getMarkets, []);
  const auditsState = useAsyncData(getAudits, []);
  const liveState = useAsyncData(getLiveMatches, []);

  const statuses = useMemo(
    () => [
      createStatus('Jogos', matchesState),
      createStatus('Mercados', marketsState),
      createStatus('Auditorias', auditsState),
      createStatus('Ao Vivo', liveState),
    ],
    [matchesState, marketsState, auditsState, liveState],
  );

  return (
    <section className="system-status" aria-labelledby="system-status-title">
      <div className="section-heading system-status-heading">
        <span>Operação</span>
        <div>
          <h2 id="system-status-title">Status do Sistema</h2>
          <p>Saúde dos serviços de dados que alimentam a experiência DUQUE Sports AI.</p>
        </div>
      </div>

      <div className="system-status-grid">
        {statuses.map((status) => (
          <article className={`system-status-card system-status-${status.tone}`} key={status.label}>
            <span>{status.label}</span>
            <strong>{status.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

export default SystemStatus;
