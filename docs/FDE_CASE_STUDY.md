# Simulated customer engagement — AegisFlow AI

> Entire case study is fictional and intended to demonstrate a Forward Deployed Engineering process, not a real customer deployment.

## Customer discovery

**Problem:** A fictional operations team spends time cross-referencing payment incident runbooks, onboarding policies and knowledge articles. Team members need evidence-linked answers, controlled access, and operational traceability. Separate fictional insurance tenants must never see banking knowledge.

**Discovery questions:** Which workflows are highest volume? What happens on missing data? What counts as an authorized answer? Which source is canonical? How should the team review risky decisions? What are the acceptable p95 latency, audit and error targets?

## MVP acceptance criteria

- A fictional banking analyst can ask a question and receive a source-linked answer.
- A request from an insurance tenant cannot retrieve banking documents.
- A non-admin cannot run evaluation.
- A configured policy service failing must deny the request (fail closed).
- No real customer data or secrets are included.
- Golden evaluation can run repeatably with visible hit@3.

## Rollout

Local synthetic prototype → stakeholder walkthrough → security review → OIDC replacement → staging tenant test suite → controlled pilot → measured adoption → wider rollout. Production rollout is **not completed**.

## Success measures to collect in a future pilot

Citation coverage, retrieval hit@3, grounded answer correctness, p95 latency, cost per completed request, workflow task completion, support ticket reductions, review/approval rates. All targets require future empirical measurement.

## Leadership artifacts

[ADR](ADR-001.md), [architecture overview](ARCHITECTURE.md), [roadmap](ROADMAP.md), unit tests, and deployment definitions support conversations about technical leadership, engineering management, architecture governance and delivery tradeoffs.
