import '../../../styles/engine-projection-section.css';
import AiExplanationPanel from './AiExplanationPanel.jsx';
import EngineProjectionPanel from './EngineProjectionPanel.jsx';
import {
  ENGINE_PROJECTION_SECTION_STATES,
  resolveEngineProjectionSectionState,
} from './engineProjectionSectionState.js';

function EngineProjectionSection({ error, isLoading, onRetry, projection }) {
  const state = resolveEngineProjectionSectionState({ error, isLoading });

  if (state === ENGINE_PROJECTION_SECTION_STATES.LOADING) {
    return (
      <section
        aria-busy="true"
        aria-label="Projecao estatistica em processamento"
        aria-live="polite"
        className="engine-projection-state engine-projection-state-loading"
      >
        <div>
          <span>DUQUE Score Engine</span>
          <strong>Processando projecao estatistica</strong>
          <p>Calibrando probabilidades, confianca e ranking de oportunidade.</p>
        </div>
        <div className="engine-projection-state-bars" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </section>
    );
  }

  if (state === ENGINE_PROJECTION_SECTION_STATES.ERROR) {
    return (
      <section
        aria-label="Projecao estatistica indisponivel"
        className="engine-projection-state engine-projection-state-error"
        role="alert"
      >
        <div>
          <span>DUQUE Score Engine</span>
          <strong>Projecao temporariamente indisponivel</strong>
          <p>Os dados principais da partida continuam disponiveis para consulta.</p>
        </div>
        <button onClick={onRetry} type="button">Tentar novamente</button>
      </section>
    );
  }

  return (
    <>
      <EngineProjectionPanel projection={projection} />
      <AiExplanationPanel explanation={projection?.aiExplanation} />
    </>
  );
}

export default EngineProjectionSection;
