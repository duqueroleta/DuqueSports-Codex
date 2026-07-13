const DATA_SCOPES = Object.freeze(['competitions', 'matches', 'match-detail']);

function createOperationState() {
  return Object.freeze({
    source: 'idle',
    status: 'idle',
    itemCount: 0,
    reason: null,
    updatedAt: null,
  });
}

function createSportsDataSourceStore({ apiEnabled = false, now = () => new Date() } = {}) {
  const listeners = new Set();
  let state = Object.freeze({
    apiEnabled,
    operations: Object.freeze(Object.fromEntries(
      DATA_SCOPES.map((scope) => [scope, createOperationState()]),
    )),
  });

  function getSnapshot() {
    return state;
  }

  function report({ scope, source, status = 'ready', itemCount = 0, reason = null }) {
    if (!DATA_SCOPES.includes(scope)) {
      return;
    }

    state = Object.freeze({
      ...state,
      operations: Object.freeze({
        ...state.operations,
        [scope]: Object.freeze({
          source,
          status,
          itemCount: Number.isInteger(itemCount) && itemCount >= 0 ? itemCount : 0,
          reason,
          updatedAt: now().toISOString(),
        }),
      }),
    });
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return Object.freeze({ getSnapshot, report, subscribe });
}

export { DATA_SCOPES, createSportsDataSourceStore };
