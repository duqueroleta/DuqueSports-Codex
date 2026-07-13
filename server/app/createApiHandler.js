import { sendError, sendSuccess } from '../http/apiResponse.js';
import { paginate } from '../http/pagination.js';

const MATCH_STATUSES = Object.freeze(['scheduled', 'live', 'finished', 'postponed', 'cancelled']);

function getCorsHeaders(origin, allowedOrigins) {
  return origin && allowedOrigins.includes(origin)
    ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' }
    : {};
}

function parseLimit(value) {
  if (value === null) {
    return 20;
  }

  const limit = Number(value);
  return Number.isInteger(limit) && limit >= 1 && limit <= 100 ? limit : null;
}

function createApiHandler({ repository, now, requestIdFactory, allowedOrigins = [] }) {
  return (request, response) => {
    const requestId = requestIdFactory();
    const generatedAt = now().toISOString();
    const url = new URL(request.url, 'http://localhost');
    const corsHeaders = getCorsHeaders(request.headers.origin, allowedOrigins);

    if (request.method !== 'GET') {
      sendError(response, {
        statusCode: 405,
        code: 'method-not-allowed',
        message: 'This endpoint only supports GET.',
        requestId,
      }, { ...corsHeaders, Allow: 'GET' });
      return;
    }

    if (url.pathname === '/api/v1/competitions') {
      sendSuccess(response, {
        data: repository.listCompetitions(),
        requestId,
        generatedAt,
        dataSchemaVersion: 'competition-read.v1',
      }, corsHeaders);
      return;
    }

    if (url.pathname === '/api/v1/matches') {
      const limit = parseLimit(url.searchParams.get('limit'));
      const status = url.searchParams.get('status');

      if (limit === null || (status && !MATCH_STATUSES.includes(status))) {
        sendError(response, {
          statusCode: 400,
          code: 'invalid-query',
          message: 'Query parameters are invalid.',
          requestId,
        }, corsHeaders);
        return;
      }

      const page = paginate(
        repository.listMatches({
          competitionId: url.searchParams.get('competitionId'),
          status,
        }),
        url.searchParams.get('cursor'),
        limit,
      );

      if (!page) {
        sendError(response, {
          statusCode: 400,
          code: 'invalid-cursor',
          message: 'Pagination cursor is invalid.',
          requestId,
        }, corsHeaders);
        return;
      }

      sendSuccess(response, {
        data: page.data,
        requestId,
        generatedAt,
        dataSchemaVersion: 'match-read.v1',
        nextCursor: page.nextCursor,
      }, corsHeaders);
      return;
    }

    const detailMatch = url.pathname.match(/^\/api\/v1\/matches\/(match:internal:\d+)$/);

    if (detailMatch) {
      const match = repository.findMatchById(detailMatch[1]);

      if (match) {
        sendSuccess(response, {
          data: match,
          requestId,
          generatedAt,
          dataSchemaVersion: 'match-read.v1',
        }, corsHeaders);
        return;
      }
    }

    sendError(response, {
      statusCode: 404,
      code: 'resource-not-found',
      message: 'Requested resource was not found.',
      requestId,
    }, corsHeaders);
  };
}

export { MATCH_STATUSES, createApiHandler, parseLimit };
