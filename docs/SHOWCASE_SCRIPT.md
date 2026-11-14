# 90-second portfolio demonstration

**0–15 sec — Problem:** “A fictional operations team needs trustworthy answers from tenant-specific operational policies, with evidence, authorization checks and repeatable quality gates.”

**15–35 sec — Full-stack architecture:** “The React/TypeScript frontend talks to a Node.js/TypeScript BFF. Before retrieval, the BFF requests a policy decision from an independent Java/Spring Boot service. FastAPI performs tenant-scoped lexical retrieval and produces source-linked answers. The LLM adapter is optional and only active when configured.”

**35–55 sec — Live demonstration:** Ask how to retry a failed payment. Show `[kb-001]`, trace ID, latency and human review. Change to insurance tenant and demonstrate separation; try evaluation as analyst and show `403`.

**55–75 sec — Staff/Lead/EM decisions:** “I deliberately separated policy decisions from orchestration, made policy dependency failures deny access, enforced tenant derived from gateway identity and documented ADRs, tests, rollout criteria and nonfunctional goals.”

**75–90 sec — Roadmap & tradeoffs:** “This is a tested synthetic baseline rather than a claimed production deployment. Next phases cover OIDC, PostgreSQL/pgvector, hybrid RAG, rerankers, LangGraph, MCP, DeepEval/LangSmith, OpenTelemetry and AWS infrastructure. Every advanced claim will be backed by code, test results and measured evaluation.”

## LinkedIn Featured suggestion

**Title:** Enterprise AI Operations Copilot — Hands-on Python, Node.js, Java/Spring Boot & React Architecture

**Description:** Public synthetic-data portfolio demonstrating cross-language microservices, permission checks, deterministic source-grounded retrieval, citations, trace IDs, evaluation and a full-stack React operations UI. Includes design decisions, unit/integration tests and an execution roadmap for advanced RAG/agent workflows. Link the actual public repository only after GitHub publishing succeeds.
