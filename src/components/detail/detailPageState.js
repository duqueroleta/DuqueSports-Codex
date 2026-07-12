const DETAIL_PAGE_STATES = Object.freeze({
  ERROR: 'error',
  LOADING: 'loading',
  NOT_FOUND: 'not-found',
  READY: 'ready',
});

function resolveDetailPageState({ data, error, isLoading }) {
  if (isLoading) {
    return DETAIL_PAGE_STATES.LOADING;
  }

  if (error) {
    return DETAIL_PAGE_STATES.ERROR;
  }

  if (!data) {
    return DETAIL_PAGE_STATES.NOT_FOUND;
  }

  return DETAIL_PAGE_STATES.READY;
}

export { DETAIL_PAGE_STATES, resolveDetailPageState };
