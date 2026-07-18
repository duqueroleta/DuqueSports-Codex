import { Link } from 'react-router-dom';
import ErrorState from '../error/ErrorState.jsx';
import SkeletonGrid from '../loading/SkeletonGrid.jsx';
import { DETAIL_PAGE_STATES } from './detailPageState.js';
import '../../styles/detail-page-state.css';

function getResourceTitle(resource) {
  return `${resource.charAt(0).toUpperCase()}${resource.slice(1)}`;
}

function DetailPageState({ backHref, backLabel, onRetry, resource, state }) {
  const analysisLabel = `análise do ${resource}`;

  if (state === DETAIL_PAGE_STATES.LOADING) {
    return (
      <main className="detail-page">
        <section className="detail-page-state-shell" aria-label={`Carregando ${analysisLabel}`}>
          <div className="detail-page-state-copy">
            <span>Duque Engine</span>
            <h1>Montando análise estatística</h1>
            <p>Estamos calibrando probabilidades, contexto da partida e mercados fortes para exibir a leitura completa.</p>
          </div>
          <div className="detail-page-state-pipeline" aria-hidden="true">
            <span>Dados</span>
            <span>Modelo</span>
            <span>Score</span>
          </div>
          <div className="detail-grid detail-page-state-grid">
            <SkeletonGrid count={4} />
          </div>
        </section>
      </main>
    );
  }

  if (state === DETAIL_PAGE_STATES.ERROR) {
    return (
      <main className="detail-page">
        <section
          className="detail-grid detail-page-state-grid"
          aria-label={`Falha ao carregar ${analysisLabel}`}
        >
          <ErrorState onRetry={onRetry} />
        </section>
      </main>
    );
  }

  if (state === DETAIL_PAGE_STATES.NOT_FOUND) {
    return (
      <main className="detail-page">
        <section className="detail-empty">
          <span>Consulta sem resultado</span>
          <h1>{getResourceTitle(resource)} não encontrado</h1>
          <p>Esse conteúdo pode ter saído da base mockada ou o link acessado não corresponde a uma análise ativa.</p>
          <Link to={backHref}>{backLabel}</Link>
        </section>
      </main>
    );
  }

  return null;
}

export default DetailPageState;
