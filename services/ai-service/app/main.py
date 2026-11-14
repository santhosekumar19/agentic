"""AegisFlow AI API — controlled, deterministic demo with synthetic documents only."""
import logging
import re
from time import perf_counter
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .retrieval import search
from .llm import try_llm_answer

log = logging.getLogger("aegisflow")
app = FastAPI(title="AegisFlow AI Service", version="0.1.0", description="Synthetic enterprise retrieval and evaluation baseline")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_methods=["GET", "POST"], allow_headers=["*"])

ID = re.compile(r"^[a-z0-9][a-z0-9-]{0,39}$")
BLOCKED = ("ignore previous instructions", "reveal system prompt", "print secrets", "bypass authorization")


class SearchRequest(BaseModel):
    tenant_id: str = Field(min_length=1, max_length=40)
    question: str = Field(min_length=3, max_length=1000)
    category: str | None = None
    top_k: int = Field(default=3, ge=1, le=5)


class AskRequest(SearchRequest):
    user_id: str = Field(min_length=1, max_length=40)
    approved: bool = False


class EvalCase(BaseModel):
    question: str
    expected_document_id: str
    tenant_id: str = "demo-bank"


EVAL_SET = [
    EvalCase(question="What do I do after three failed identity checks?", expected_document_id="kb-002"),
    EvalCase(question="How should a failed card payment be retried?", expected_document_id="kb-001"),
    EvalCase(question="How do we assess assistant groundedness and citations?", expected_document_id="kb-005"),
    EvalCase(question="What metrics help investigate a payment incident?", expected_document_id="kb-003"),
]


def validate_tenant(tenant_id: str) -> None:
    if not ID.fullmatch(tenant_id):
        raise HTTPException(status_code=422, detail="Invalid tenant ID")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "ai-service", "data": "synthetic"}


@app.post("/v1/knowledge/search")
def retrieve(payload: SearchRequest) -> dict:
    validate_tenant(payload.tenant_id)
    return {"results": search(payload.question, payload.tenant_id, payload.top_k, payload.category),
            "retrieval": "lexical-bm25-baseline", "tenant_id": payload.tenant_id}


@app.post("/v1/assistant/ask")
def ask(payload: AskRequest, request: Request) -> dict:
    validate_tenant(payload.tenant_id)
    started = perf_counter()
    trace_id = request.headers.get("x-request-id", str(uuid4()))[:80]
    if any(s in payload.question.lower() for s in BLOCKED):
        raise HTTPException(status_code=400, detail="Prompt failed the basic demo safety filter")
    results = search(payload.question, payload.tenant_id, payload.top_k, payload.category)
    # This is intentionally a grounded EXTRACTIVE demo, not an LLM generated answer.
    mode = "deterministic_extractive_demo"
    model_answer = try_llm_answer(payload.question, results)
    if model_answer:
        answer = model_answer
        mode = "openai_responses_grounded"
    elif results:
        answer = "Based on the available synthetic policies: " + " ".join(
            f"{item['excerpt']} {item['citation']}" for item in results[:2]
        )
    else:
        answer = "I couldn't find an authorized source for that request. Please ask an operator to review it."
    # Never log raw questions, customer information, or document excerpts.
    log.info("ask_request trace_id=%s tenant=%s retrieval_count=%d", trace_id, payload.tenant_id, len(results))
    return {"answer": answer, "citations": [{"id": r["id"], "title": r["title"]} for r in results[:2]],
            "trace_id": trace_id, "mode": mode, "requires_human_approval": not payload.approved,
            "latency_ms": round((perf_counter() - started) * 1000, 2), "retrieved_count": len(results)}


@app.get("/v1/evals/run")
def run_evals() -> dict:
    records = []
    for c in EVAL_SET:
        ids = [r["id"] for r in search(c.question, c.tenant_id, 3)]
        records.append({"question": c.question, "expected_doc": c.expected_document_id,
                        "returned_docs": ids, "hit_at_3": c.expected_document_id in ids})
    hits = sum(r["hit_at_3"] for r in records)
    return {"dataset": "synthetic-golden-v1", "hit_at_3": hits / len(records), "count": len(records), "cases": records}
