import { randomUUID } from 'node:crypto';

type Identity = { userId: string; tenantId: string; roles: string[] };
const SAFE_ID = /^[a-z0-9][a-z0-9-]{0,39}$/;
const ACCEPTED_ROLES = new Set(['analyst', 'operator', 'admin']);

export function parseIdentity(headers: Record<string, string | string[] | undefined>): Identity | null {
  const read = (name: string) => {
    const raw = headers[name];
    return typeof raw === 'string' ? raw.trim() : '';
  };
  const userId = read('x-demo-user');
  const tenantId = read('x-demo-tenant');
  const roles = read('x-demo-roles').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (!SAFE_ID.test(userId) || !SAFE_ID.test(tenantId) || !roles.length || roles.some(r => !ACCEPTED_ROLES.has(r))) return null;
  return { userId, tenantId, roles };
}

export function locallyAuthorized(identity: Identity, action: string): boolean {
  // Local-only educational fallback. Real deployment MUST validate an external identity token.
  if (action === 'eval') return identity.roles.includes('admin');
  if (action === 'ask' || action === 'search') return identity.roles.some(r => ['analyst', 'operator', 'admin'].includes(r));
  return false;
}

export function traceId(value: string | undefined): string {
  if (value && /^[a-zA-Z0-9-]{1,80}$/.test(value)) return value;
  return randomUUID();
}

export function validateQuestion(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim();
  return cleaned.length >= 3 && cleaned.length <= 1000 ? cleaned : null;
}
