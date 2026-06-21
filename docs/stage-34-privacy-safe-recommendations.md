# Этап 34 — Privacy-safe recommendations и Next Best Action

Документ описывает рекомендательную систему stroistroy.ru: contextual + anonymous session персонализация, grounded candidates, explainable ranking и privacy controls без скрытого профилирования.

## 1. Что сделано на Этапе 34

- Recommendation context, preference, candidate и result models
- In-memory `recommendation-store` (preferences, exposures, feedback, journeys, privacy, rulesets, audit)
- 38 сервисов: candidate generation, scoring, reranking, diversity, novelty, filter-bubble guard, frequency caps
- Related Content, Next Best Content, Next Best Action, project/technology/material/location recommendations
- Privacy modes: contextual, anonymous-session, consented
- Public API: `/api/recommendations/*` (rate limited)
- UI: `src/components/recommendations/*`
- Dashboard: `/dashboard/recommendations` (+ rules, quality, privacy, review)
- Интеграции: CMS, Knowledge Graph, search, AI assistant
- 33 unit-теста: `npm run test:recommendations`

## 2. Связь с Этапами 18–33

| Этап | Интеграция |
|------|------------|
| 19 Taxonomy | facets, preference keys |
| 23 CMS | source of truth, `related` fields, eligibility |
| 29 Indexation | noindex/draft exclusion |
| 30 Analytics | recommendation events |
| 31 Experiments | ruleset versioning hook |
| 32 Knowledge Graph | graph candidates, entity expansion |
| 33 Search | search journey, hybrid retrieval, session memory |

## 3. Privacy modes

| Personalization mode | Used signals | Consent | Retention |
| -------------------- | ------------ | ------- | --------- |
| contextual | current page, entities, KG, search query/filters | none | request-scoped |
| anonymous-session | viewed pages, filters, clicks, inferred prefs (low weight) | implicit session | session TTL |
| consented | persistent preferences, saved selections | explicit | policy-based |

Default: **contextual + anonymous-session** с минимальным хранением.

## 4. Architecture

```text
page/search/session context
  → buildContext (orchestrator)
  → policy + placement registry
  → candidate generation (KG, taxonomy, CMS, search, session, cold-start)
  → eligibility + exclusions
  → scoring + reranking + diversity + frequency caps
  → explanations
  → RecommendationItem[] / NextBestAction
```

## 5. Placements

| Placement | Recommendation types | Max items | Fallback |
| --------- | -------------------- | --------: | -------- |
| article-related | related-content, next-content | 6 | editorial related |
| project-similar | project | 4 | taxonomy |
| service-supporting | service, technical | 4 | cluster |
| search-continuation | next-content, next-action | 3 | related queries |
| homepage-section | project, editorial | 8 | cold-start popular |

## 6. Scoring priority

```text
relevance > eligibility > user value > diversity > business value
```

| Scoring factor | Meaning | Priority | Risk |
| -------------- | ------- | -------- | ---- |
| contextualRelevance | page/query match | high | — |
| entityRelevance | KG/taxonomy overlap | high | ambiguous entity |
| preferenceMatch | explicit > inferred | medium | overfitting |
| businessValue | P1–P5, lead potential | low | must not beat irrelevance |

## 7. Exclusions

| Exclusion | Detection | System action |
| --------- | --------- | ------------- |
| draft/review | CMS status | exclude |
| noindex | indexability | exclude |
| dismissed | session store | exclude |
| frequency cap | exposure count | suppress |
| unsupported location | location rules | exclude |

## 8. Fallback

| Failure | Fallback | User-facing behavior |
| ------- | -------- | -------------------- |
| session unavailable | contextual | related from page |
| KG unavailable | taxonomy + CMS related | degraded |
| personalization off | contextual only | no session signals |
| empty candidates | hide block | no random filler |

## 9. API routes

- `GET /api/recommendations?placement=&contentItemId=&sessionId=`
- `GET /api/recommendations/related`
- `GET /api/recommendations/projects`
- `GET /api/recommendations/next-content`
- `GET /api/recommendations/next-action`
- `POST /api/recommendations/feedback`
- `GET|POST /api/recommendations/preferences`
- `POST /api/recommendations/reset`

## 10. Dashboard routes

- `/dashboard/recommendations` — KPI overview
- `/dashboard/recommendations/rules` — rulesets, weights
- `/dashboard/recommendations/quality` — CTR, dismiss, diversity
- `/dashboard/recommendations/privacy` — consent, resets, retention
- `/dashboard/recommendations/review` — manual pins, feedback queue

## 11. Проверки

| Команда | Результат |
| ------- | --------- |
| `npm run test:recommendations` | 33/33 pass |
| `npm run build` | success |

**Требует ручной проверки:** production traffic для CTR/lead attribution, consent UX flow, mobile placements, A/B experiments с достаточной выборкой.

## 12. TODO для Этапа 35

- Anonymous + authenticated favourites
- Saved projects, comparisons, shortlists
- Pre-project brief workspace
- Transfer anonymous session after auth
- CRM handoff of curated selection
- Integration with calculator and AI assistant
