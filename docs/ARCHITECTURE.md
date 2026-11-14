# Architecture and security model

## Components and ownership

- **React SPA:** Browser user experience, form validation, citations, trace feedback and test-role demonstration. It never accesses storage directly.
- **Node.js BFF:** Trust boundary for the browser. Resolves demo identity in this baseline, overwrites `tenant_id` from client input, validates request length, forwards trace ID, and calls policy before retrieval. Upstream calls use 5-second timeouts.
- **Spring Boot policy service:** Independent policy decisions with known tenant IDs and roles. Denies unknown actions and tenants. Does not use request body question text.
- **FastAPI retrieval:** Synthetic documents labeled by tenant, lexical BM25-like ranking, extractive response with inline citation IDs. No customer secrets or third-party LLM calls by default; an opt-in adapter can send synthetic retrieved excerpts and user questions to the OpenAI Responses API.

## Critical trust boundaries

1. **Browser to gateway:** The current `x-demo-*` identity headers are spoofable. This is for localhost demonstration ONLY. Replace with OIDC Authorization Code + PKCE, gateway JWT validation, issuer/audience checks, and server-derived claims before any real deployment.
2. **Gateway to policy:** Fail closed on timeout, exception or denial when the policy endpoint is configured; no privileged fallback.
3. **Gateway to retrieval:** Send only a derived tenant ID. In a real system also implement workload identity / mTLS, enforce tenant scope independently at the data layer and fail closed on missing tenant context.
4. **Retrieval to future model:** Source text is untrusted input. Add prompt-injection isolation, output validation, source grounding and red-team evaluation before introducing LLM generation.

## NFR targets (goals, not attained metrics)

| Concern | Proposed requirement |
| --- | --- |
| End-to-end latency | p95 under 1.5s for lexical baseline; separately benchmark LLM paths |
| Retrieval | At least 95% hit@3 on a much larger representative golden set |
| Authentication | Verified OIDC tokens and least privilege, no demo headers |
| Tenant isolation | Independent controls at BFF, search index, persistence, tests |
| Security | OWASP ASVS-aligned API controls, secret rotation, audit logging |
| Reliability | SLO/SLI dashboards, circuit breakers, retries where safe, rate limits |
| Change management | Automated unit/integration/security tests and staged rollout |

## Design tradeoffs

- **Separate Java policy service vs inline gateway checks:** Demonstrates decoupled governance and language interoperability; increases network complexity. In a small project, inline policy may be preferable until teams and policy complexity justify separation.
- **Lexical retrieval vs vector search:** Lexical is easy to test and explain, with predictable citations. It misses semantic variants; vector/hybrid and rerankers belong to phase 2.
- **Extractive answers vs LLM generation:** Extractive responses avoid pretending that an unconfigured generative model exists. Later introduce model routing and LLM validation behind an interface.
- **Synchronous network calls:** Simplicity for a small demo; long-running agents require a durable queue and checkpoint state.
