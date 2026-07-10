import { Link } from 'react-router-dom';
import ErrorState from '../error/ErrorState.jsx';
import SkeletonGrid from '../loading/SkeletonGrid.jsx';
import '../../styles/detail-page-state.css';

function getResourceTitle(resource) {
  return `${resource.charAt(0).toUpperCase()}${resource.slice(1)}`;
}

function resolveDetailPageState({ data, error, isLoading }) {
  if (isLoading) {
    return 'loading';
  }

  if (error) {
    return 'error';
  }

  return data ? null : 'not-found';
}

function DetailPageState({ backHref, backLabel, onRetry, resource, state }) {
  const analysisLabel = `análise do ${resource}`;

  if (state === 'loading') {
    return (
      <main className="detail-page">
        <section
          className="detail-grid detail-page-state-grid"
          aria-label={`Carregando ${analysisLabel}`}
        >
          <SkeletonGrid count={4} />
        </section>
      </main>
    );
  }

  if (state === 'error') {
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

  if (state === 'not-found') {
    return (
      <main className="detail-page">
        <section className="detail-empty">
          <h1>{getResourceTitle(resource)} não encontrado</h1>
          <Link to={backHref}>{backLabel}</Link>
        </section>
      </main>
    );
  }

  return null;
}

export default DetailPageState;
export { resolveDetailPageState };
