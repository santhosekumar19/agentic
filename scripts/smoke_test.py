"""Minimal integration check against a RUNNING local gateway and Python service.

Start services first as described in README. Doesn't need third-party packages.
"""
import json
import urllib.request
import urllib.error

BASE = 'http://127.0.0.1:8080'
HEADERS = {'Content-Type': 'application/json', 'x-demo-user': 'analyst-1',
           'x-demo-tenant': 'demo-bank', 'x-demo-roles': 'analyst'}

def get(path: str, headers: dict | None = None):
    return urllib.request.urlopen(urllib.request.Request(BASE + path, headers=headers or HEADERS), timeout=10)

def post(path: str, data: dict):
    return urllib.request.urlopen(urllib.request.Request(BASE + path,
        data=json.dumps(data).encode(), headers=HEADERS, method='POST'), timeout=10)

assert json.load(get('/api/health'))['status'] == 'ok'
answer = json.load(post('/api/ask', {'question': 'How should card payment retries work?', 'tenant_id': 'demo-insure'}))
assert any(c['id'] == 'kb-001' for c in answer['citations'])
print('PASS: grounded citation and server-side tenant derived from identity')
try:
    get('/api/evals')
    raise AssertionError('Evaluation should be denied for analyst')
except urllib.error.HTTPError as exc:
    assert exc.code == 403
print('PASS: admin-only evaluation is denied to an analyst')
