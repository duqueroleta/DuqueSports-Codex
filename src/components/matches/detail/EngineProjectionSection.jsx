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
        aria-label="Projeção estatística em processamento"
        aria-live="polite"
        className="engine-projection-state engine-projection-state-loading"
      >
        <div>
          <span>DUQUE Score Engine</span>
          <strong>Processando projeção estatística</strong>
          <p>Calibrando probabilidades, confiança e ranking de oportunidade.</p>
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
        aria-label="Projeção estatística indisponível"
        className="engine-projection-state engine-projection-state-error"
        role="alert"
      >
        <div>
          <span>DUQUE Score Engine</span>
          <strong>Projeção temporariamente indisponível</strong>
          <p>Os dados principais da partida continuam disponíveis para consulta.</p>
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
