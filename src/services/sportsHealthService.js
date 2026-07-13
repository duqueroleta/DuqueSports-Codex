const DEFAULT_SPORTS_HEALTH_URL = 'http://127.0.0.1:8787/internal/v1/health';
const HEALTH_TIMEOUT_MS = 2500;

class SportsHealthError extends Error {
  constructor(message, { code = 'health-check-error', status = null, cause = null } = {}) {
    super(message, { cause });
    this.name = 'SportsHealthError';
    this.code = code;
    this.status = status;
  }
}

function validateHealthEnvelope(payload) {
  const isValid = payload
    && typeof payload === 'object'
    && payload.meta?.dataSchemaVersion === 'health-read.v1'
    && payload.data?.schemaVersion === 'health-read.v1'
    && payload.data?.status === 'healthy'
    && typeof payload.data?.service?.version === 'string'
    && Number.isInteger(payload.data?.time?.uptimeSeconds);

  if (!isValid) {
    throw new SportsHealthError('O health check retornou um contrato invalido.', {
      code: 'invalid-health-envelope',
    });
  }

  return payload.data;
}

function createSportsHealthClient({
  url = DEFAULT_SPORTS_HEALTH_URL,
  fetchImpl = globalThis.fetch,
  timeoutMs = HEALTH_TIMEOUT_MS,
} = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new TypeError('Um cliente fetch valido e obrigatorio.');
  }

  async function getHealth() {
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new SportsHealthError('O backend nao respondeu como saudavel.', {
          code: payload?.error?.code || 'health-http-error',
          status: response.status,
        });
      }

      return validateHealthEnvelope(payload);
    } catch (error) {
      if (error instanceof SportsHealthError) {
        throw error;
      }

      const timedOut = error?.name === 'AbortError';
      throw new SportsHealthError(
        timedOut ? 'O health check excedeu o tempo limite.' : 'O backend local esta indisponivel.',
        { code: timedOut ? 'health-timeout' : 'health-network-error', cause: error },
      );
    } finally {
      globalThis.clearTimeout(timeout);
    }
  }

  return Object.freeze({ getHealth });
}

const environment = import.meta.env ?? {};
const healthCheckEnabled = Boolean(environment.DEV) && environment.VITE_SPORTS_API_ENABLED === 'true';
const healthClient = createSportsHealthClient({
  url: environment.VITE_SPORTS_HEALTH_URL || DEFAULT_SPORTS_HEALTH_URL,
});

function getBackendHealth() {
  return healthCheckEnabled ? healthClient.getHealth() : Promise.resolve(null);
}

export {
  DEFAULT_SPORTS_HEALTH_URL,
  HEALTH_TIMEOUT_MS,
  SportsHealthError,
  createSportsHealthClient,
  getBackendHealth,
  healthCheckEnabled,
  validateHealthEnvelope,
};
