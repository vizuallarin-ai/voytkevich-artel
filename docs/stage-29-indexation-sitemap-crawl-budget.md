# Этап 29 — Indexation, sitemap, canonical, crawl budget

Единый технический SEO-контур: indexability → robots → sitemap → crawl priority → monitoring.

## 1. Что сделано

- Типы: `seo-indexation`, `crawl-budget`, `url-lifecycle`, `indexation-monitoring`
- Правила: `seo-indexation-rules.ts`
- 24 сервиса в `src/lib/seo-indexation/`
- Sitemap фильтруется через indexability (`build-sitemap.ts`)
- Robots: disallow `/api/`, `/dashboard/`, preview
- Dashboard: `/dashboard/seo/indexation/*`
- API: `/api/dashboard/seo-indexation/*`
- Tests: `npm run test:indexation`
- Analytics events в `indexation-analytics.ts`

## 2. Связь с Этапами 18–28

CMS status + calendar + priority (28) + quality + canonical → indexability decision.

## 3. Indexability engine

`evaluateIndexability(page)` — blockers: draft, review, AI, thin content, cannibalization high, P5 sitemap defer.

## 4–12. Robots, sitemap, canonical, crawl, lifecycle

См. `src/lib/seo-indexation/`.

## 13. Dashboard routes

| Route | Назначение |
|-------|------------|
| `/dashboard/seo/indexation` | KPI, ready/blocked |
| `/dashboard/seo/sitemaps` | Segments, URL count |
| `/dashboard/seo/canonicals` | Conflicts |
| `/dashboard/seo/crawl-budget` | Internal crawl priority |
| `/dashboard/seo/url-lifecycle` | Lifecycle states |
| `/dashboard/seo/monitoring` | GSC/Yandex stubs |

## 14. Этап 30 TODO

published vs indexed, impressions, CTR, leads by P1/P2, feedback loop в priority weights.

---

### Таблица 1 — Content status

| Content status | Robots | Sitemap | Indexability |
| -------------- | ------ | ------- | ------------ |
| draft | noindex,follow | нет | noindex |
| review | noindex,follow | нет | noindex |
| ai-generated | noindex,follow | нет | blocked |
| scheduled | noindex до даты | нет | pending |
| published + ready | index,follow | да | indexable |
| noindex | noindex | нет | noindex |

### Таблица 2 — Validation conflicts

| Conflict | Severity | Reaction |
| -------- | -------- | -------- |
| sitemap + noindex | high | exclude from sitemap |
| index + draft | high | force noindex |
| canonical loop | high | block sitemap |

## Проверки

| Команда | Результат |
|---------|-----------|
| `npm run build` | ✓ Success (413 pages) |
| `npm run test:indexation` | ✓ Core indexability tests |
