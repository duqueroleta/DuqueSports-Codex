const MOCK_FAILURE_KEY = 'duque.dev.mockFailure';
const MOCK_DELAY = 360;

function shouldFailMockRequest(scope) {
  if (!import.meta.env.DEV) {
    return false;
  }

  const storedValue = window.localStorage.getItem(MOCK_FAILURE_KEY);
  return storedValue === 'all' || storedValue === scope;
}

function mockRequest(scope, data) {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (shouldFailMockRequest(scope)) {
        reject(new Error(`Falha simulada em ${scope}`));
        return;
      }

      resolve(data);
    }, MOCK_DELAY);
  });
}

export { MOCK_FAILURE_KEY, mockRequest };
