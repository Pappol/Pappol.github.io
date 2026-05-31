---
title: "Lessons from Building RAG Pipelines That Actually Work"
description: "Practical, hard-won notes on retrieval-augmented generation: chunking, retrieval quality, evaluation, and the boring infrastructure that decides whether your RAG system is useful or just a demo."
pubDate: 2026-05-12
tags: ["rag", "llm", "ai-engineering", "retrieval"]
---

Retrieval-augmented generation demos beautifully and ships painfully. The first version always looks magical: you point a model at some documents, ask a question, and get a fluent answer. Then real users arrive with real questions and the cracks show. Here are the lessons I keep relearning.

## Retrieval quality is the whole game

If the right chunk is not in the context window, no amount of prompt engineering will save you. The model cannot cite what it never received. So before tuning prompts, I now spend my time measuring retrieval: for a set of known question/answer pairs, does the relevant passage show up in the top *k* results?

This single metric, recall at *k*, tells you more about your system's ceiling than almost anything else. If retrieval recall is 60 percent, your end-to-end accuracy is capped well below that, full stop.

## Chunking is a real decision, not a default

The naive "split every 500 characters" approach destroys meaning. A sentence gets cut in half, a table loses its header, a clause floats free of its subject.

What has worked better for me:

- Split on semantic boundaries (headings, paragraphs, list items) before falling back to length.
- Keep a small overlap between chunks so context bleeds across the seams.
- Store the parent document and section heading as metadata, then prepend the heading to the chunk text at index time.

That last trick is underrated. A chunk that reads "as of Q3 the figure dropped to 12 percent" is useless on its own; prefix it with its section heading and suddenly the embedding actually means something.

## Hybrid search beats pure vectors more often than you'd think

Dense embeddings are great at semantic similarity and terrible at exact matches: product codes, names, acronyms, error strings. Users type those constantly. Combining a vector search with a keyword search (BM25) and fusing the rankings recovers a lot of the cases pure embeddings miss.

```python
# rough shape of the fusion step
def reciprocal_rank_fusion(rankings, k=60):
    scores = {}
    for ranking in rankings:          # e.g. [vector_hits, bm25_hits]
        for rank, doc_id in enumerate(ranking):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank)
    return sorted(scores, key=scores.get, reverse=True)
```

## Evaluate, or you are flying blind

"It seems better" is not an evaluation. Build a small golden set of real questions with expected answers, and score every change against it. I separate two things:

1. **Retrieval metrics** (recall, precision at *k*) that need no LLM.
2. **Answer metrics** (faithfulness, relevance) where an LLM-as-judge is acceptable as long as you spot-check it.

Even fifty hand-labeled examples will catch regressions that a flashy demo hides.

## Make the model say "I don't know"

The most damaging RAG failures are confident wrong answers. Instructing the model to answer *only* from the provided context, and to admit when the context is insufficient, trades a little coverage for a lot of trust. For most business use cases that is exactly the right trade.

## The unglamorous parts decide everything

Re-indexing when source documents change. Handling PDFs that are secretly scanned images. Tracking which document version produced an answer. Latency budgets when you stack retrieval, reranking, and generation. None of this is exciting, and all of it determines whether the thing survives contact with production.

If I could give one piece of advice to past-me: treat RAG as a search problem with a language model on top, not a language model problem with some search bolted on. Get the retrieval right and the rest gets a lot easier.
