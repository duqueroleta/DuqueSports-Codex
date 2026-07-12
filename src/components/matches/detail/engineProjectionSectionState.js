const ENGINE_PROJECTION_SECTION_STATES = Object.freeze({
  ERROR: 'error',
  LOADING: 'loading',
  READY: 'ready',
});

function resolveEngineProjectionSectionState({ error, isLoading }) {
  if (isLoading) {
    return ENGINE_PROJECTION_SECTION_STATES.LOADING;
  }

  if (error) {
    return ENGINE_PROJECTION_SECTION_STATES.ERROR;
  }

  return ENGINE_PROJECTION_SECTION_STATES.READY;
}

export { ENGINE_PROJECTION_SECTION_STATES, resolveEngineProjectionSectionState };
