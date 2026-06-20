# Этап 30 — Content performance analytics, SEO, leads, ROI

Единый аналитический контур: тема → кластер → priority → производство → публикация → индексация → трафик → лиды → сделки → feedback.

## 1. Что сделано

- Типы: `content-analytics`, `content-attribution`, `content-cost`
- 33+ сервисов в `src/lib/content-analytics/`
- Event taxonomy: lifecycle, search, engagement, conversion, distribution, intelligence
- Ingestion layer с idempotency и deduplication
- Source registry (internal, Metrica, GA, GSC, Webmaster, CRM, manual import)
- Performance snapshots, search, publication, indexation, conversion, ROI
- Lead attribution (first/last/linear/position-based/assisted)
- Priority feedback (Этап 28), calendar feedback (Этап 27)
- Distribution, cluster, programmatic, local analytics
- Decay, winners, underperformance, recommendations
- Dashboard: `/dashboard/content/analytics/*`
- API: `/api/dashboard/content-analytics/*`
- Tests: `npm run test:analytics`
- Confidence rules: `content-analytics-confidence-rules.ts`

## 2. Связь с Этапами 18–29

| Этап | Связь |
|------|-------|
| 18–20 | Programmatic SEO performance |
| 21–22 | Technical / editorial content types |
| 23 | CMS content items as source of truth |
| 24 | AI factory events in lifecycle taxonomy |
| 25 | Teaser / UTM distribution analytics |
| 26 | Visual cost in content cost model |
| 27 | Calendar feedback, planned vs published |
| 28 | Priority prediction accuracy feedback |
| 29 | Published vs indexed, indexation status |

## 3. Analytics architecture

```text
Sources → ingestion → normalizer → deduplicator → snapshots → services → dashboards
                ↓
         data quality / confidence rules
                ↓
         recommendations (human review only)
```

Не дублирует `src/lib/analytics/` — переиспользует events, leads, CRM.

## 4–12. Services

См. `src/lib/content-analytics/`: ingestion, search, publication, indexation, conversion, ROI, attribution, intelligence.

## 13. Dashboard routes

| Route | Назначение |
|-------|------------|
| `/dashboard/content/analytics` | KPI, funnel, recommendations |
| `/dashboard/content/analytics/search` | Search metrics |
| `/dashboard/content/analytics/conversions` | CTA, forms, funnel |
| `/dashboard/content/analytics/leads` | Attribution |
| `/dashboard/content/analytics/roi` | Cost, ROI, revenue ratio |
| `/dashboard/content/analytics/calendar` | Planned vs published |
| `/dashboard/content/analytics/distribution` | Teasers, UTM |
| `/dashboard/content/analytics/clusters` | Cluster performance |
| `/dashboard/content/analytics/programmatic` | Programmatic SEO |
| `/dashboard/content/analytics/local` | Local SEO |
| `/dashboard/content/analytics/intelligence` | Winners, decay, actions |
| `/dashboard/content/analytics/data-quality` | Source status, issues |

## 14. Data sources

| Source | Metrics | Status | Refresh mode | Limitations |
| ------ | ------- | ------ | ------------ | ----------- |
| internal | events, CTA, forms | active | realtime | depends on consent |
| yandex-metrica | sessions, pageViews | stub | manual/API | credentials required |
| google-analytics | sessions, engagement | stub | manual/API | credentials required |
| google-search-console | impressions, clicks | stub | manual/API | credentials required |
| yandex-webmaster | index status | stub | manual/API | credentials required |
| crm | qualified leads, deals | partial | sync | lead statuses |
| manual-import | any | active | on upload | CSV validation |

## 15. Metric formulas

| Metric | Formula | Required data | Confidence rules |
| ------ | ------- | ------------- | ---------------- |
| CTR | clicks/impressions | both non-null | min impressions preset |
| conversionRate | leads/pageViews | both non-null | min pageViews |
| qualifiedLeadRate | qualifiedLeads/leads | leads > 0 | min leads preset |
| ROI | (profit−cost)/cost×100 | profit + cost | strict preset |
| revenueReturnRatio | revenue/cost | revenue + cost | medium |

## 16. Privacy

No PII in events. Dashboard admin-only. No fingerprinting.

## 17. Запущенные проверки

```bash
npm run test:analytics
npm run lint
npm run build
```

## 18. Этап 31 TODO

- content refresh queue, controlled experiments, update briefs
- internal linking, consolidation workflow
- AI-assisted refresh with expert review and rollback
- post-update monitoring, control groups, statistical confidence
- task creation without auto-publish
