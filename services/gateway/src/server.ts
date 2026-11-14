import http from 'node:http';
import { parseIdentity, locallyAuthorized, traceId, validateQuestion } from './logic.ts';

const PORT = Number(process.env.PORT ?? '8080');
const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? 'http://localhost:8000';
const POLICY_SERVICE_URL = process.env.POLICY_SERVICE_URL ?? '';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
const isConfiguredPolicy = POLICY_SERVICE_URL.trim().length > 0;

function respond(res: http.ServerResponse, status: number, data: unknown, trace = ''): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...(trace ? {'X-Request-Id': trace} : {}) });
  res.end(JSON.stringify(data));
}

async function readBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.from(chunk);
    size += buf.length;
    if (size > 16384) throw new Error('Payload exceeds the 16KB limit');
    chunks.push(buf);
  }
  const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Expected JSON object');
  return parsed as Record<string, unknown>;
}

async function jsonFetch(url: string, method: 'GET' | 'POST', body: unknown, requestId: string): Promise<{ status: number; data: unknown }> {
  const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'X-Request-Id': requestId },
    ...(method === 'POST' ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(5000) });
  const data: unknown = await response.json();
  return { status: response.status, data };
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (origin === FRONTEND_ORIGIN) res.setHeader('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Demo-User, X-Demo-Tenant, X-Demo-Roles, X-Request-Id');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const pathname = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`).pathname;
  if (pathname === '/api/health' && req.method === 'GET') return respond(res, 200, { status: 'ok', service: 'node-gateway', auth: 'DEMO-ONLY-HEADERS', policy: isConfiguredPolicy ? 'external' : 'local-demo' });

  const id = parseIdentity(req.headers);
  const requestId = traceId(typeof req.headers['x-request-id'] === 'string' ? req.headers['x-request-id'] : undefined);
  if (!id) return respond(res, 401, { error: 'Demo identity headers missing or invalid', requestId }, requestId);

  const routes: Record<string, { action: string; target: string; method: 'GET' | 'POST' }> = {
    '/api/ask': { action: 'ask', target: '/v1/assistant/ask', method: 'POST' },
    '/api/search': { action: 'search', target: '/v1/knowledge/search', method: 'POST' },
    '/api/evals': { action: 'eval', target: '/v1/evals/run', method: 'GET' }
  };
  const route = routes[pathname];
  if (!route || req.method !== route.method) return respond(res, 404, { error: 'Not found', requestId }, requestId);

  try {
    let allowed = locallyAuthorized(id, route.action);
    if (isConfiguredPolicy) {
      const result = await jsonFetch(`${POLICY_SERVICE_URL}/v1/policies/check`, 'POST', {
        userId: id.userId, tenantId: id.tenantId, roles: id.roles, action: route.action,
        resource: route.action === 'eval' ? 'evaluation' : 'knowledge'
      }, requestId);
      // Fail closed if the policy service fails or rejects the action.
      allowed = result.status === 200 && Boolean((result.data as {allowed?: boolean} | null)?.allowed);
    }
    if (!allowed) return respond(res, 403, { error: 'Not authorized', requestId }, requestId);

    let data: Record<string, unknown> = {};
    if (route.method === 'POST') {
      data = await readBody(req);
      const question = validateQuestion(data.question);
      if (!question) return respond(res, 422, { error: 'Question must be 3–1000 characters', requestId }, requestId);
      // IMPORTANT: Never trust tenant_id passed in the browser payload.
      data = { question, tenant_id: id.tenantId, user_id: id.userId, top_k: 3 };
    }
    const result = await jsonFetch(`${AI_SERVICE_URL}${route.target}`, route.method, data, requestId);
    // Log only trace metadata — no raw questions or retrieved contents.
    console.info(JSON.stringify({ trace_id: requestId, endpoint: pathname, tenant: id.tenantId, status: result.status }));
    return respond(res, result.status, result.data, requestId);
  } catch (err) {
    console.error(JSON.stringify({ trace_id: requestId, error: err instanceof Error ? err.name : 'UnknownError' }));
    return respond(res, 502, { error: 'Upstream request failed', requestId }, requestId);
  }
});

server.listen(PORT, '0.0.0.0', () => console.log(`AegisFlow gateway listening on :${PORT} (DEMO AUTH — NOT FOR INTERNET EXPOSURE)`));
