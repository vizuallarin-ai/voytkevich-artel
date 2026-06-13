# Этап 17 — Аналитика эффективности сайта и воронки

Дата: 2026-06-05  
Сайт: https://voytkevich-artel.vercel.app/

Предыдущие этапы: [stage-15](./stage-15-leads-dashboard-simple-crm.md), [stage-16](./stage-16-lead-automation-notifications.md)

---

## 1. Что сделано на Этапе 17

- Единая модель **AnalyticsEvent** (`src/types/analytics.ts`)
- Сохранение событий: file store `.data/analytics-events.json` + Supabase migration (TODO)
- API: `POST /api/analytics/events`, `GET /api/analytics/report` (protected)
- Клиентский capture: `PageViewTracker`, расширенный `trackEvent`
- Server events: `lead_created`, `crm_status_changed`
- Агрегация: funnel, pages, sources, CTA, tools, CRM
- **Insights** — автоматические рекомендации
- Dashboard **`/dashboard/analytics`** с вкладками (обзор, воронка, страницы, источники, инструменты, CRM)
- Demo analytics только в dev
- Privacy: PII не в analytics events

---

## 2. Роль аналитики

Ответы на управленческие вопросы:
- Что даёт заявки и горячие лиды?
- Где просадка воронки?
- Какие CTA / лид-магниты / инструменты работают?
- Как быстро реагирует менеджер?
- Что улучшать на Этапе 18?

**Принцип:** не выдумывать трафик — показывать только реальные события и лиды.

---

## 3. AnalyticsEvent model

См. `src/types/analytics.ts`. Без name/phone/email — связь через `leadId` / `sessionId`.

---

## 4. События (минимум внедрён)

| Событие | Статус |
|---|---|
| page_viewed | ✅ PageViewTracker |
| cta_clicked | ✅ trackEvent / trackCta |
| form_submitted | ✅ trackLeadEvent |
| lead_created | ✅ server POST /api/leads |
| calculator_* | ✅ trackCalculatorEvent |
| planner_* | ✅ trackPlannerEvent |
| lead_magnet_* | ✅ trackLeadMagnetEvent |
| crm_status_changed | ✅ lead-repository |
| automation_* | ⏳ через timeline (TODO полный capture) |
| catalog_*, blog_* views | ⏳ TODO точечное внедрение |

---

## 5. Сохранение событий

- **File store:** `.data/analytics-events.json` (`ANALYTICS_FILE_STORE`, default true)
- **Supabase:** `docs/supabase-analytics-events-migration.sql` (TODO adapter)
- **Demo:** `src/data/demo-analytics-events.ts` (dev only, `meta.debug: true`)

Ошибки save не ломают UX.

---

## 6–12. Метрики

| Модуль | Файл |
|---|---|
| Page performance | `page-performance.ts` |
| Source / UTM | `source-performance.ts` |
| Funnels | `funnel-metrics.ts` |
| CTA | `cta-performance.ts` |
| Tools | `tool-performance.ts` |
| CRM / SLA | `crm-performance.ts` |
| Insights | `insights.ts` |
| Report | `analytics-service.ts` |

Conversion rate = leads / views только если views > 0, иначе `null` / «—».

---

## 13. Dashboard

**URL:** `/dashboard/analytics`

Вкладки: Обзор | Воронка | Страницы | Источники | Инструменты | CRM

Period: 7 / 30 / 90 / all days

KPI: лиды, hot, score, page views, CTA clicks, form CR, overdue SLA, top source/page.

---

## 14–19. Подразделы

Реализованы как вкладки одной страницы (не отдельные routes) — проще поддерживать.

---

## 20. Date ranges

`getDateRange()` — today, 7d, 30d, 90d, all. Default: 30d.

Trends: сравнение с предыдущим периодом (leads, hot, score).

---

## 21. Mock/demo

Badge «Demo analytics» при `ANALYTICS_USE_DEMO` или пустом store в dev.

---

## 22. Яндекс.Метрика / GA

- `NEXT_PUBLIC_YM_ID` — YaMetrika component + reachGoal
- `NEXT_PUBLIC_GA_ID` — gtag в events.ts
- Без env — no-op, warning в dashboard

Goals: conversion-goals.ts (form_submit, calculator_submit, …)

---

## 23. Privacy

- AnalyticsEvent без PII
- GA/YM без телефона/имени
- Dashboard analytics без персональных данных (только CRM-лиды отдельно)

---

## 24. Export

TODO: CSV export analytics (Этап 18). CRM export уже в Этапе 15.

---

## 25. Компоненты

| Компонент | Назначение |
|---|---|
| AnalyticsDashboardClient | Tabs + data |
| AnalyticsKpiCards | KPI |
| AnalyticsFunnelTable | Воронки |
| AnalyticsInsights | Рекомендации |
| PageViewTracker | page_viewed |

---

## 26. Manual test checklist

1. [ ] `/dashboard/analytics`
2. [ ] KPI + date range
3. [ ] Empty state без данных
4. [ ] Demo mode в dev
5. [ ] Тестовая заявка → lead_created
6. [ ] page_viewed при навигации
7. [ ] cta_click
8. [ ] CRM status change → event
9. [ ] UTM в sources
10. [ ] Privacy: нет телефона в events file
11. [ ] Mobile layout
12. [ ] build OK

---

## 27. Env

```env
ANALYTICS_FILE_STORE=true
ANALYTICS_USE_DEMO=true          # dev only
NEXT_PUBLIC_YM_ID=
NEXT_PUBLIC_GA_ID=
DASHBOARD_ACCESS_TOKEN=
```

---

## 28. Backend TODO

- Supabase analytics_events adapter
- Больше client events (catalog, blog views)
- Analytics CSV export
- Cron для sla_overdue events

---

## 29. Этап 18 (обновлено)

**Production launch на VPS** — см. [stage-18-production-vps-launch.md](./stage-18-production-vps-launch.md)

- Домен: **stroistroy.ru**
- Docker + persistent `.data/` volume
- nginx + SSL
- CRO / A/B перенесены в post-launch growth backlog

---

## Таблицы

### Метрики

| Метрика | Что показывает | Откуда | Действие |
|---|---|---|---|
| Лиды | Заявки за период | leads.json | Усилить источники |
| Hot leads | Горячие | qualification | SLA приоритет |
| Page views | Просмотры | analytics events | SEO/CRO |
| Conversion | leads/views | расчёт | A/B тесты |
| SLA overdue | Просрочки | lead-sla | Ускорить реакцию |

### Dashboard

| Раздел | URL | Назначение | Статус |
|---|---|---|---|
| Аналитика | `/dashboard/analytics?tab=overview` | KPI + insights | ✅ |
| Воронка | `?tab=funnel` | 6 воронок | ✅ |
| Страницы | `?tab=pages` | Page performance | ✅ |
| Источники | `?tab=sources` | UTM | ✅ |
| Инструменты | `?tab=tools` | Calc/planner/magnets | ✅ |
| CRM | `?tab=crm` | SLA, статусы | ✅ |

### Риски

| Риск | Важно | Обработка |
|---|---|---|
| Нет page views | Нет conversion rate | Показываем leads, CR = — |
| Vercel file store | Нет persistence | VPS volume или Supabase |
| Fake traffic | Ложные выводы | Не придумываем данные |
| PII в events | Privacy | sanitize + server rules |

---

## Проверки

| Команда | Результат |
|---|---|
| `npm run build` | ✅ 2026-06-05 |
