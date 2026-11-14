import test from 'node:test';
import assert from 'node:assert/strict';
import { parseIdentity, locallyAuthorized, traceId, validateQuestion } from '../src/logic.ts';

test('reject invalid demo identity', () => {
  assert.equal(parseIdentity({'x-demo-user':'staff','x-demo-tenant':'../../bad','x-demo-roles':'admin'}), null);
});
test('tenant identity and roles parsed correctly', () => {
  assert.deepEqual(parseIdentity({'x-demo-user':'staff-1','x-demo-tenant':'demo-bank','x-demo-roles':'analyst,operator'}),
    {userId:'staff-1',tenantId:'demo-bank',roles:['analyst','operator']});
});
test('evaluation is admin-only', () => {
  assert.equal(locallyAuthorized({userId:'a',tenantId:'demo-bank',roles:['analyst']}, 'eval'), false);
  assert.equal(locallyAuthorized({userId:'a',tenantId:'demo-bank',roles:['admin']}, 'eval'), true);
});
test('question limit and request IDs are validated', () => {
  assert.equal(validateQuestion(' hi '), null);
  assert.equal(validateQuestion(' what should I do? '), 'what should I do?');
  assert.equal(traceId('safe-id'), 'safe-id');
  assert.notEqual(traceId('bad id!!!'), 'bad id!!!');
});
