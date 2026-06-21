# Этап 33 — Intelligent Search, Hybrid Retrieval, RAG и навигационный AI-помощник

Документ описывает поисково-навигационный слой stroistroy.ru: единый search document, hybrid retrieval, grounded RAG и navigation assistant на базе опубликованного CMS-контента и Knowledge Graph (Этап 32).

## 1. Что сделано на Этапе 33

- Единая модель `SearchDocument` и `SearchChunk`
- Search source registry из CMS, taxonomy, KG (без второго источника контента)
- Lexical index (in-memory postings) + local bag-of-words embeddings (`local-bow-v1`, 128 dim)
- Hybrid retrieval (RRF + business reranking + diversity)
- Query normalization, typo tolerance, synonyms, intent detection, entity-aware search
- Faceted filters, suggestions, zero-result handling, search analytics
- Index versioning: build → validate → activate → rollback
- Incremental indexing queue (idempotent jobs)
- RAG retrieval pipeline + grounded answer generation + answerability policy
- Prompt-injection guard, citation policy, consent-based lead handoff
- Public `/search`, global search trigger, navigation assistant UI
- Dashboard: `/dashboard/search/*` (overview, index, queries, zero-results, quality, rag, assistant, content-gaps)
- API: `/api/search`, `/api/search/suggestions`, `/api/search/facets`, `/api/search/related`, `/api/search/feedback`, `/api/search/assistant`
- 20 unit-тестов: `npm run test:search`

## 2. Связь с Этапами 18–32

| Этап | Интеграция в Search |
|------|---------------------|
| 18 Programmatic SEO | programmatic pages в index |
| 19 Taxonomy | facets, entity extraction |
| 20 Templates | document types |
| 21 Technical KB | technical articles |
| 22 Editorial blog | editorial type |
| 23 CMS | единственный source of truth |
| 24 AI factory | только approved content |
| 29 Indexation | noindex/draft exclusion |
| 30 Analytics | search + assistant events |
| 31 Refresh | stale document reindex |
| 32 Knowledge Graph | entity expansion, graph boost |

## 3. Search architecture

```text
CMS published + indexable content
  → search document builder (sanitize, validate)
  → chunking (heading / FAQ / specs)
  → lexical index + vector embeddings
  → hybrid retrieval + ranking + diversity
  → search results / RAG context
  → grounded answer + citations + handoff
```

Хранилище: in-memory `search-store`. Bootstrap через `searchBootstrapService.ensureSearchIndexReady()` при первом запросе.

## 4. Индексируемые и исключаемые документы

**Индексируются:** published CMS services, projects, programmatic pages, technical/editorial articles, locations, FAQ, comparisons — только canonical indexable URLs.

**Исключаются:** draft, review, rejected, unpublished, noindex, redirect source, non-canonical duplicate, deleted, PII, internal notes, unapproved AI content.

## 5. Fallback strategy

| Failure | Fallback | User-facing state |
| ------- | -------- | ----------------- |
| AI unavailable | lexical search | search works |
| vector unavailable | lexical + entity | hybrid degraded |
| KG unavailable | lexical + semantic | no graph boost |
| new index invalid | keep active index | no swap |
| RAG insufficient | refuse + search | honest message |

## 6. Проверки

| Команда | Результат |
| ------- | --------- |
| `npm run test:search` | 20/20 pass |
| `npm run build` | success |

**Требует ручной проверки:** OpenAI answers (API key), real CTR/zero-result metrics (traffic), mobile UX.

## 7. TODO для Этапа 34

- Personalized recommendations, next-best-content/action
- Session recs with location consent, cold-start, explicit preferences
- Recommendation analytics, experimentation, privacy controls
- Integration with KG, search, assistant, CMS
