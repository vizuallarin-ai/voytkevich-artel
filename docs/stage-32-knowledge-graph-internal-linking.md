# Этап 32 — Knowledge Graph и интеллектуальная перелинковка

Документ описывает смысловой слой контента stroistroy.ru: единый Knowledge Graph, pillar-cluster архитектуру, internal linking engine и dashboard workflow с human review.

## 1. Что сделано на Этапе 32

- Единая модель Knowledge Graph (`KnowledgeNode`, `KnowledgeEdge`)
- Entity registry из существующих taxonomy/SEO данных (без дублирования источников истины)
- Entity normalization и entity resolution с human review для ambiguous
- Graph building, validation, content graph, cannibalization graph, user journey graph
- Pillar-cluster architecture и hub-page recommendations
- Internal link inventory, relevance scoring, link opportunities, anchor diversity
- Link review workflow: preview → approve → apply → verify → rollback
- CMS, AI factory, refresh, priority, indexation, analytics integrations
- Dashboard routes и API (subgraph limited — не весь граф в браузер)
- 34 unit-теста: `npm run test:knowledge-graph`

## 2. Связь с Этапами 18–31

| Этап | Интеграция в KG |
|------|-----------------|
| 18 Programmatic SEO | content nodes, programmatic URLs |
| 19 Taxonomy | entity registry, relation rules |
| 20 Templates | content type metadata на nodes |
| 21 Technical KB | technical-topic relations |
| 22 Editorial blog | content graph edges |
| 23 CMS | `cms-knowledge-graph-integration` |
| 24 AI factory | `ai-factory-graph-integration` (forbidden targets, no auto-apply) |
| 25 Distribution | analytics enrichment |
| 26 Visuals | — |
| 27 Calendar | — |
| 28 Prioritization | `priority-graph-integration`, cluster roles |
| 29 Indexation | `indexation-graph-integration`, noindex/redirect guards |
| 30 Analytics | `graph-analytics-integration` |
| 31 Refresh | `refresh-graph-integration`, regression detection |

## 3. Architecture

```text
CMS content + taxonomy + clusters
  → entity extraction / resolution
  → knowledge graph (nodes + edges)
  → content graph + pillar-cluster
  → link inventory + opportunities
  → relevance scoring + risk validation
  → human review + batch apply
  → monitoring + audit log
```

Хранилище: in-memory `knowledge-graph-store` (nodes, edges, recommendations, inventory, batches, audit). Полный rebuild через `buildKnowledgeGraph()` — не на каждом render.

## 4–5. Node types и Relation types

См. `src/types/knowledge-graph.ts`, `src/data/knowledge-relation-rules.ts`.

| Node type | Source | Required fields | Example |
| --------- | ------ | --------------- | ------- |
| content | CMS | title, status, indexability | `/blog/smeta-...` |
| service | entity registry | canonicalName, slug | Дома под ключ |
| project | programmatic | title, slug | dom-8-na-10 |
| material | project-materials | canonicalName | газобетон |
| technology | seo-clusters | canonicalName | каркас |
| location | local-demand | canonicalName | Иркутск |
| semantic-cluster | seo-clusters | clusterId | materials |
| pillar / hub | pillar-cluster service | assigned role | cluster hub |

| Source node | Relation | Target node | Validation |
| ----------- | -------- | ----------- | ---------- |
| project | uses-material | material | `isValidRelation()` |
| content | links-to | content | indexability check |
| content | competes-with | content | suggested, not auto-active |
| pillar | pillar-for | content | manual/SEO assign |
| faq | answers | technical-topic | taxonomy rule |

## 6–8. Entity registry, normalization, resolution

- **Registry:** `src/lib/knowledge-graph/entity-registry.ts` — seeds from `seoClusters`, `projectMaterials`, `localDemandRules`, `allServicePages`, `technicalContentClusters`, construction stages.
- **Normalization:** `normalizeEntityName`, `resolveEntityAlias`, size notation `8×10` → `8x10`, ё/е, aliases.
- **Resolution:** exact → alias → taxonomy → semantic → ambiguous → unresolved. Low confidence / ambiguous не создаёт edge автоматически.

## 9–11. Graph building и validation

- `buildKnowledgeGraph({ contentItems, incremental })` — sync CMS → nodes, entity edges.
- `createKnowledgeEdge` — duplicate prevention, relation rules, AI edges default `suggested`.
- Validator: broken edges, hierarchy cycles (не путает с bidirectional `related-to`), noindex targets, low-confidence AI active edges.

## 12–14. Content graph, pillar-cluster, hub pages

- Content graph: incoming/outgoing links, centrality, depth (сигнал, не business priority).
- Pillar-cluster: `identifyPillarCandidates` учитывает commercial breadth, priority, incoming links — **не только длину текста**.
- Hub pages: `hub-page-service` — recommend only when category/pillar insufficient; no auto-create.

## 15–21. Internal linking

- Inventory: structured extraction from CMS `related` + HTML/markdown hrefs.
- Relevance: semantic, entity overlap, cluster, journey, business value, penalties.
- Opportunities: exclude draft/noindex/redirect/self-link/existing link/low relevance.
- Anchors: descriptive, partial-match, entity, CTA — diversity warnings, no exact-match spam.
- Density presets: `conservative`, `balanced` (default), `cluster-growth`, `orphan-recovery`, `commercial-path`.

| Link factor | Weight | Meaning | Risk |
| ----------- | -----: | ------- | ---- |
| semanticRelevance | 0.20 | same cluster/keyword | low alone |
| entityOverlap | 0.15 | shared entities | — |
| clusterRelationship | 0.15 | same semantic cluster | — |
| userJourneyValue | 0.15 | info → commercial path | — |
| linkDensityPenalty | subtract | too many links on page | over-linking |

## 22–25. Orphans, depth, journeys, cannibalization

- Orphan types: true-orphan, sitemap-only, weakly-connected, intentionally-isolated, etc.
- P1/P2 true orphan → high severity.
- Cannibalization: requires **multiple signals** (keyword + title/cluster); semantic similarity alone capped at 0.4.

## 26–27. Maintenance и review workflow

| Recommendation status | Allowed action | Required role |
| --------------------- | -------------- | ------------- |
| suggested | approve/reject | editor/admin |
| approved | batch preview | SEO/admin |
| applied | verify | publisher/admin |
| verified | rollback | publisher/admin |

Redirect/merge: `link-maintenance-service` — batch recommendations, `requiresReview: true`, rollback via batch snapshot.

## 28–33. Integrations

- **CMS:** graph context on content item (entities, links, orphans, recommendations).
- **AI factory:** `buildGraphContextForAI`, forbidden targets, `validateAIGeneratedLinks` — links stay suggested.
- **Refresh:** `detectGraphRegressionAfterRefresh` warns on lost cluster links.
- **Priority:** authority flow recommendations without forcing P1 links everywhere.
- **Indexation:** `excludeNonIndexableTargets`.
- **Analytics:** PII-safe events in `knowledge-graph-analytics.ts`.

## 34–38. Dashboard routes

| Route | Purpose |
|-------|---------|
| `/dashboard/content/knowledge-graph` | KPI, validation, subgraph table |
| `/dashboard/content/internal-linking` | inventory summary, opportunities |
| `/dashboard/content/internal-linking/orphans` | orphan classification + recovery |
| `/dashboard/content/clusters/architecture` | pillar/hub/coverage/health |
| `/dashboard/content/knowledge-graph/cannibalization` | competing pages |
| `/dashboard/content/knowledge-graph/journeys` | dead ends, missing steps |

API: `/api/dashboard/knowledge-graph/*`, `/api/dashboard/internal-linking/*`, `/api/dashboard/clusters/architecture`.

## 39. Audit log

Actions: node/edge create, entity merge, link recommendation approve/reject, batch preview/apply/verify/rollback, intentional isolation. Stored in `knowledgeGraphStore.listAudit()`.

## 40. Background jobs

Services prepared for: incremental graph sync, link inventory scan, orphan detection, cluster health, stale recommendations, redirect maintenance. Manual triggers via dashboard/API; idempotent rebuild.

## 41. Performance

- Subgraph limit: 80 nodes / 120 edges in API response
- Pagination on tables (50 rows default)
- No full graph to client
- Incremental `buildKnowledgeGraph({ incremental: true })`

## 42. Запущенные проверки

| Command | Result |
|---------|--------|
| `npm run test:knowledge-graph` | 34/34 pass |
| `npm run build` | success (464 pages) |

## 43. Что требует ручной проверки

- Production content: real orphan recovery quality
- Accumulated analytics: journey drop-off correlation
- Expert review: entity merges, pillar assignments, cannibalization resolutions
- Link batch apply on live CMS HTML (currently inventory-level)

## 44. Этап 33 — TODO

- Full-text + semantic + hybrid search
- Entity-aware filters (material, technology, location, project)
- Query intent detection, zero-result queries, suggestions
- RAG with citations, no hallucinated answers
- Knowledge graph retrieval for query expansion
- Navigation AI assistant → service/project/consultation
- CMS search index, incremental reindex, index versioning
- Prompt injection protection, human-controlled answer policies

## Analytics events

| Analytics event | Trigger | Purpose |
| --------------- | ------- | ------- |
| knowledge_graph_viewed | dashboard open | usage |
| link_opportunity_detected | scoring | pipeline |
| link_batch_applied | batch apply | audit |
| orphan_page_detected | orphan scan | recovery |
| cannibalization_conflict_detected | graph build | SEO review |

Payload keys whitelisted — no PII, no full page content.
