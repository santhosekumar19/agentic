import { useState } from 'react';

type Citation = { id: string; title: string };
type Answer = { answer: string; citations: Citation[]; latency_ms: number; mode: string; trace_id: string; requires_human_approval: boolean };
type Evaluation = { hit_at_3: number; count: number; cases: {question:string;expected_doc:string;returned_docs:string[];hit_at_3:boolean}[] };
const API = import.meta.env.VITE_GATEWAY_URL ?? 'http://localhost:8080';
const EXAMPLES = [
  'How should we retry a failed card payment?',
  'What happens after repeated failed onboarding verification?',
  'Which signals help triage a payment service incident?',
  'How do we evaluate retrieval and citation accuracy?'
];

export default function App() {
  const [tenant, setTenant] = useState('demo-bank');
  const [role, setRole] = useState('analyst');
  const [question, setQuestion] = useState(EXAMPLES[0]);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [evalReport, setEvalReport] = useState<Evaluation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function send(path: string, method: 'GET' | 'POST', payload?: object) {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Demo-User': 'portfolio-user',
        'X-Demo-Tenant': tenant, 'X-Demo-Roles': role },
      ...(payload ? { body: JSON.stringify(payload) } : {})
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.detail || `Request failed (${res.status})`);
    return data;
  }

  async function ask() {
    setBusy(true); setError(''); setAnswer(null); setEvalReport(null);
    try { setAnswer(await send('/api/ask', 'POST', { question })); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unknown error'); }
    finally { setBusy(false); }
  }
  async function evaluate() {
    setBusy(true); setError(''); setEvalReport(null);
    try { setEvalReport(await send('/api/evals', 'GET')); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unknown error'); }
    finally { setBusy(false); }
  }

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brandmark">A</div><div><strong>AegisFlow<span> AI</span></strong><small>Enterprise operations copilot</small></div></div>
      <nav aria-label="Project areas">
        <div className="navactive">◈ &nbsp; Assistant workspace</div>
        <div>▦ &nbsp; Knowledge retrieval</div>
        <div>⟡ &nbsp; Evaluation & tracing</div>
        <div>◇ &nbsp; Policy decisions</div>
      </nav>
      <div className="sidebar-bottom"><div className="project-tag">ENGINEERING PORTFOLIO</div><p>Multi-tenant synthetic data. No production customer systems connected.</p></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><span className="eyebrow">APPLICATION / AEGISFLOW</span><h1>Operations intelligence</h1><p>Auditable answers grounded in authorized enterprise knowledge.</p></div><span className="status"><i/> Demo environment</span></header>
      <section className="metrics" aria-label="Platform architecture">
        <div className="metric"><span>01 / AI ENGINE</span><strong>Python · FastAPI</strong><small>Tenant-filtered retrieval</small></div>
        <div className="metric"><span>02 / SERVICE GATEWAY</span><strong>Node.js · TypeScript</strong><small>API orchestration & trace IDs</small></div>
        <div className="metric"><span>03 / POLICY SERVICE</span><strong>Java · Spring Boot</strong><small>Role-based decisions</small></div>
        <div className="metric"><span>04 / EXPERIENCE</span><strong>React · TypeScript</strong><small>Interactive operations UI</small></div>
      </section>
      <div className="two-col">
        <section className="panel query-panel">
          <div className="panel-head"><div><span className="eyebrow">WORKSPACE</span><h2>Ask the knowledge assistant</h2></div><span className="pill">Source-grounded</span></div>
          <div className="row-fields"><label>Tenant<select value={tenant} onChange={e => {setTenant(e.target.value);setAnswer(null);}}><option value="demo-bank">Demo banking</option><option value="demo-insure">Demo insurance</option></select></label><label>Demo role<select value={role} onChange={e => setRole(e.target.value)}><option value="analyst">Analyst</option><option value="operator">Operator</option><option value="admin">Admin</option></select></label></div>
          <label className="q-label" htmlFor="question">Your question</label>
          <textarea id="question" rows={5} value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask about synthetic policies or incident runbooks..." maxLength={1000}/>
          <button className="primary" onClick={ask} disabled={busy || question.trim().length < 3}>{busy ? 'Running…' : 'Run authorized query →'}</button>
          <div className="examples"><span className="eyebrow">TRY A QUESTION</span>{EXAMPLES.map(e => <button key={e} onClick={() => setQuestion(e)}>{e}</button>)}</div>
        </section>
        <section className="panel result-panel" aria-live="polite">
          <div className="panel-head"><div><span className="eyebrow">RESPONSE</span><h2>Answer & evidence</h2></div><span className="pill light">Citations required</span></div>
          {error && <div className="error">{error}</div>}
          {!answer && !error && <div className="empty"><div className="empty-icon">✧</div><h3>Ready to investigate</h3><p>Ask a question to view an evidence-linked response, latency and trace metadata.</p></div>}
          {answer && <div className="answer"><div className="answer-label">GROUNDED RESPONSE</div><p>{answer.answer}</p><div className="sources"><strong>Source citations</strong>{answer.citations.length ? answer.citations.map(c => <div key={c.id}><span>{c.id}</span>{c.title}</div>) : <em>No authorized sources found</em>}</div><div className="meta"><span>{answer.latency_ms} ms</span><span>{answer.mode.replaceAll('_',' ')}</span></div><div className="trace">Trace ID: {answer.trace_id}</div>{answer.requires_human_approval && <div className="note">Human approval required before operational action.</div>}</div>}
        </section>
      </div>
      <section className="panel eval-panel"><div><span className="eyebrow">QUALITY GATES</span><h2>Retrieval evaluation</h2><p>Run the fixed synthetic golden dataset. Admin role is required to execute evaluation.</p></div><button className="secondary" onClick={evaluate} disabled={busy}>Run evaluation</button>{evalReport && <div className="eval-result"><strong>Hit@3: {(evalReport.hit_at_3 * 100).toFixed(0)}%</strong> across {evalReport.count} cases <span>Baseline lexical retrieval, not LLM correctness</span></div>}</section>
      <footer>Built to demonstrate end-to-end IC ownership, cloud architecture, secure API design and engineering leadership. Demo data only.</footer>
    </main>
  </div>;
}
