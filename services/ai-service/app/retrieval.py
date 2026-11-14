"""Small auditable lexical retriever for synthetic public demonstration data.

Not a vector RAG implementation. The project roadmap specifies how to replace this
baseline with embeddings, hybrid search, tenant-aware indices and reranking.
"""
from dataclasses import dataclass
from math import log
from collections import Counter
import re

TOKEN_PATTERN = re.compile(r"[a-zA-Z0-9]{2,}")


def tokenize(text: str) -> list[str]:
    return TOKEN_PATTERN.findall(text.lower())


@dataclass(frozen=True)
class Document:
    id: str
    tenant_id: str
    title: str
    category: str
    body: str
    visibility: str = "internal"


DOCUMENTS = [
    Document("kb-001", "demo-bank", "Payment retry policy", "payments",
             "A failed card payment should not be retried blindly. Use an idempotency key across retries and exponential backoff for transient network errors. For a permanent decline, stop retries and refer the case for manual review."),
    Document("kb-002", "demo-bank", "Digital onboarding escalation", "onboarding",
             "If identity verification fails three times, place the onboarding case in manual review and notify the assigned operations queue. Never bypass verification for urgency. Record the decision and an audit event."),
    Document("kb-003", "demo-bank", "Service incident runbook", "reliability",
             "For a payment service incident, check p95 latency, error rate, Kafka consumer lag and downstream core-system health. Use tracing to identify bottlenecks. If error budget is exhausted, freeze changes and prepare a controlled rollback."),
    Document("kb-004", "demo-bank", "Customer data access standard", "security",
             "Customer records are available only to explicitly authorized roles within the same tenant. Use least privilege, purpose limitation, audit logging and verified server-side authorization. Do not put credentials or sensitive customer data into prompts."),
    Document("kb-005", "demo-bank", "Knowledge assistant evaluation", "ai",
             "Evaluate retrieval using hit rate and recall at k. Evaluate answers for citation correctness, groundedness, safety, latency and cost. Keep a frozen golden dataset and run regression checks before each release."),
    Document("kb-101", "demo-insure", "Claims triage workflow", "claims",
             "Claims submitted with incomplete evidence should be placed in pending-information status. A claims adjuster reviews suspicious claims; the automated system must not approve unsupported payouts."),
    Document("kb-102", "demo-insure", "Policy renewal rules", "policy",
             "Renewal quotes use the active policy, approved coverage and current risk information. Changes require approval and an auditable event. Verify all underwriting conditions before issuance."),
]


def search(query: str, tenant_id: str, top_k: int = 3, category: str | None = None) -> list[dict]:
    """Return tenant-filtered BM25-style ranked documents with stable citations."""
    tokens = tokenize(query)
    if not tokens:
        return []
    corpus = [d for d in DOCUMENTS if d.tenant_id == tenant_id and (category is None or d.category == category)]
    if not corpus:
        return []
    tokenized = [tokenize(d.title + " " + d.body) for d in corpus]
    avgdl = sum(len(t) for t in tokenized) / len(tokenized)
    unique = set(tokens)
    df = Counter(t for t in unique for row in tokenized if t in row)
    scored = []
    for doc, toks in zip(corpus, tokenized):
        counts = Counter(toks)
        score = 0.0
        for token in unique:
            tf = counts[token]
            if not tf:
                continue
            idf = log(1 + (len(corpus) - df[token] + 0.5) / (df[token] + 0.5))
            score += idf * tf * 2.2 / (tf + 1.2 * (0.25 + 0.75 * len(toks) / avgdl))
        if score > 0:
            scored.append((round(score, 5), doc))
    scored.sort(key=lambda x: (-x[0], x[1].id))
    return [dict(id=d.id, title=d.title, category=d.category, excerpt=d.body,
                 score=score, citation=f"[{d.id}]") for score, d in scored[:top_k]]
