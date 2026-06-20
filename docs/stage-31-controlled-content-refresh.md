# Этап 31 — Controlled content refresh & experiments

Управляемое обновление контента на основе аналитики Этапа 30. Без автопубликации.

## 1. Что сделано

- Типы: `content-refresh`, `content-update-brief`, `content-version`, `content-experiment`, `post-refresh-monitoring`
- 21 сервис refresh + 6 experiment services
- Refresh queue, signal validation, diagnosis, briefs, AI drafts, versions, diff, review, publication, monitoring, rollback
- Integrations: CMS, calendar, priority, AI factory, indexation
- Dashboard: `/dashboard/content/refresh/*`, `/dashboard/content/experiments`
- API: `/api/dashboard/content-refresh/*`, `/api/dashboard/content-experiments`
- Tests: `npm run test:refresh`

## 2. Lifecycle

```text
signal → validate → queue → diagnosis → brief → AI draft → review → publish → monitor → keep/rollback
```

## 3. Dashboard routes

| Route | Назначение |
|-------|------------|
| `/dashboard/content/refresh` | KPI, urgent candidates |
| `/dashboard/content/refresh/queue` | Refresh queue |
| `/dashboard/content/refresh/briefs` | Update briefs |
| `/dashboard/content/refresh/reviews` | Review workflow |
| `/dashboard/content/refresh/versions` | Version history |
| `/dashboard/content/refresh/monitoring` | Post-update monitoring |
| `/dashboard/content/experiments` | Controlled experiments |

## 4. Ограничения

- No auto publish
- No auto scoring weight changes
- AI drafts require human review
- Rollback requires approval (except configured critical flag)
- In-memory store until DB migration

## 5. Этап 32 TODO

Knowledge graph, semantic internal linking, orphan detection, pillar-cluster architecture.

## 6. Проверки

```bash
npm run test:refresh
npm run test:analytics
npm run lint
npm run build
```
