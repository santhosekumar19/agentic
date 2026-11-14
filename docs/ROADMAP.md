# Portfolio implementation roadmap — learn, implement, prove, publish

The stages below are planned scope, not already completed features. Don't claim them as production skills until implemented, evaluated, and demonstrated.

| Phase | Delivery | Skills covered | Evidence to publish |
| --- | --- | --- | --- |
| **0 — Baseline (included)** | React console, Node BFF, Java policy, FastAPI lexical retrieval, optional LLM adapter, citations, synthetic eval, Docker definitions, unit tests | React/TypeScript, Node.js, Java/Spring Boot, FastAPI, RBAC, API design, test design | Repo + screenshots + test logs |
| **1 — Production engineering** | OIDC/JWT authentication, PostgreSQL + pgvector schema, Redis cache, Kafka/SQS events, service health, request tracing, OpenTelemetry | AuthN/AuthZ, DB schema, caching, event-driven architecture, telemetry, security | Traces, load tests, threat model, latency before/after |
| **2 — Advanced RAG** | Tenant-aware ingest and chunking, embeddings, BM25+vector hybrid retrieval, reciprocal rank fusion, cross-encoder reranking, query decomposition/rewriting | Embeddings, pgvector, RAG, hybrid search, reranking, permission-aware retrieval | Recall@k, nDCG, MRR, groundedness benchmark |
| **3 — Agents & MCP** | LangGraph durable execution, tool schemas, sandboxed MCP server, human approvals, retries/checkpoints, agent tool audit log | LangGraph, MCP, agent orchestration, evaluation, human-in-loop | Workflow traces and replay, failure injection tests |
| **4 — LLM evaluation & security** | DeepEval/Ragas/LangSmith, prompt-injection testing, answer faithfulness, citation accuracy, cost/token tracking, model routing | AI observability, LLM evaluation, guardrails, FinOps | Golden dataset, regression dashboard, cost per successful task |
| **5 — AWS delivery** | Terraform VPC/IAM, ECS/EKS, Bedrock or approved model API, S3 ingestion, Secrets Manager, CI/CD, CloudWatch dashboards, WAF | AWS, IaC, DevSecOps, deployment, reliability | Public sanitized infrastructure diagrams and deployment walkthrough |
| **6 — FDE & EM outcomes** | Simulated customer workshop, 2-week pilot, live demo, incident drill, backlog/ADRs, cost plan, adoption analysis, team decision records | Discovery, FDE, stakeholder leadership, architecture tradeoffs, EM delivery | Before/after acceptance metrics and case study |

## Definition of done for each phase

- Actual implemented source code, running local or cloud demo, deterministic automated tests.
- Clearly labeled synthetic sample data and security boundaries.
- An architecture note explaining alternatives and failure modes.
- A metric gathered by a repeatable script (not invented throughput or accuracy).
- A project README and short demo video or annotated screenshots.
- A LinkedIn Featured description tied to *verified completed* functionality.

## Highest-value skills to prioritize

1. Advanced enterprise RAG: multi-tenant permission filters, retrieval benchmarking, reranking, citations.
2. Python/FastAPI: robust async APIs, Pydantic, test suites, AI model integration, data pipelines.
3. Node.js: BFF contracts, Kafka, caching, reliability and system behavior under failure.
4. Java/Spring Boot: security, persistence, policy evaluation and independent integration tests.
5. React: accessible stateful UI, caching, dashboards and real-time collaboration.
6. LLM evaluation/security: reproducible goldens, prompt injection testing, guarded tool access.
7. AWS: architecture, Terraform, tracing, production-minded deployment.
8. Leadership/FDE: customer requirements, ADRs, metrics, rollout/reliability plan.
