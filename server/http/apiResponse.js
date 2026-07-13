const API_ENVELOPE_VERSION = 'api-envelope.v1';

function baseHeaders() {
  return {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };
}

function sendJson(response, statusCode, payload, extraHeaders = {}) {
  response.writeHead(statusCode, { ...baseHeaders(), ...extraHeaders });
  response.end(JSON.stringify(payload));
}

function sendSuccess(response, {
  data,
  requestId,
  generatedAt,
  dataSchemaVersion,
  nextCursor = null,
  statusCode = 200,
}, headers) {
  sendJson(response, statusCode, {
    data,
    meta: {
      requestId,
      schemaVersion: API_ENVELOPE_VERSION,
      dataSchemaVersion,
      generatedAt,
      nextCursor,
    },
  }, headers);
}

function sendError(response, { statusCode, code, message, requestId, details = [] }, headers) {
  sendJson(response, statusCode, {
    error: { code, message, requestId, details },
  }, headers);
}

export { API_ENVELOPE_VERSION, sendError, sendSuccess };
