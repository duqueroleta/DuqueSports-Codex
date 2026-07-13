const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8787/api/v1';
const DEFAULT_TIMEOUT_MS = 5000;

class SportsApiError extends Error {
  constructor(message, { code = 'sports-api-error', status = null, cause = null } = {}) {
    super(message, { cause });
    this.name = 'SportsApiError';
    this.code = code;
    this.status = status;
  }
}

function normalizeBaseUrl(baseUrl) {
  return String(baseUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
}

function assertEnvelope(payload) {
  if (!payload || typeof payload !== 'object' || !Object.hasOwn(payload, 'data')) {
    throw new SportsApiError('A API retornou um envelope invalido.', { code: 'invalid-envelope' });
  }

  return payload;
}

function createSportsApiClient({
  baseUrl = DEFAULT_API_BASE_URL,
  fetchImpl = globalThis.fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new TypeError('Um cliente fetch valido e obrigatorio.');
  }

  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  async function request(path, searchParams) {
    const url = new URL(`${normalizedBaseUrl}${path}`);
    Object.entries(searchParams ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });

    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new SportsApiError(payload?.error?.message || 'Falha ao consultar a API esportiva.', {
          code: payload?.error?.code || 'http-error',
          status: response.status,
        });
      }

      return assertEnvelope(payload);
    } catch (error) {
      if (error instanceof SportsApiError) {
        throw error;
      }

      const timedOut = error?.name === 'AbortError';
      throw new SportsApiError(
        timedOut ? 'A API esportiva excedeu o tempo limite.' : 'Nao foi possivel acessar a API esportiva.',
        { code: timedOut ? 'request-timeout' : 'network-error', cause: error },
      );
    } finally {
      globalThis.clearTimeout(timeout);
    }
  }

  return Object.freeze({
    async getCompetitions() {
      return (await request('/competitions')).data;
    },
    async getMatchById(id) {
      const canonicalId = String(id).startsWith('match:internal:') ? String(id) : `match:internal:${id}`;
      if (!/^match:internal:\d+$/.test(canonicalId)) {
        throw new SportsApiError('O identificador da partida e invalido.', { code: 'invalid-match-id' });
      }

      return (await request(`/matches/${canonicalId}`)).data;
    },
    async getMatches(filters = {}) {
      return (await request('/matches', { ...filters, limit: filters.limit ?? 100 })).data;
    },
  });
}

export {
  DEFAULT_API_BASE_URL,
  DEFAULT_TIMEOUT_MS,
  SportsApiError,
  createSportsApiClient,
};
