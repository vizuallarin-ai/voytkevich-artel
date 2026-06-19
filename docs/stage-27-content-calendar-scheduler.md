# Этап 27 — Контент-календарь и планировщик

Управляемая система планирования публикаций для SEO-монстра: календарь, очередь, readiness, capacity, balance — без массовой публикации.

## 1. Что сделано

- Типы календаря и scheduling
- Capacity presets: cautious / working / aggressive / manual
- Balance rules (7 правил)
- Content readiness (CMS + SEO + visual + distribution)
- Schedule validator, capacity/balance checkers
- Publication slots builder
- Recommended date engine
- Schedule service + calendar service
- In-memory calendar repository + audit log
- Integrations: CMS, visual, distribution
- Dashboard `/dashboard/content/calendar/*`
- 12 analytics events
- API routes под `/api/dashboard/content-calendar/*`

## 2. Связь с Этапами 18–26

| Этап | Связь |
|------|-------|
| 23 | CMS statuses, workflow schedule/publish |
| 24 | AI drafts — block schedule until review |
| 25 | Teaser after full article, UTM |
| 26 | Visual readiness (cover, OG, social) |

```text
content idea → draft → review → approved → visual ready → teaser ready → scheduled → published → tracked
```

## 3–4. Зачем календарь / схема

Публикация только при CMS + SEO + visual + distribution readiness. Scheduled ≠ published.

## 5. Content calendar item

`src/types/content-calendar.ts` — `ContentCalendarItem`, `PublicationSlot`, `CalendarSettings`.

## 6. Content readiness

`content-readiness.ts` — cmsReady, seoReady, visualReady, distributionReady, canSchedule, canPublish.

## 7–9. Rules

- `content-schedule-rules.ts` — 10 правил
- `content-capacity-rules.ts` — presets
- `content-balance-rules.ts` — weekly/daily balance

## 10–13. Slots, schedule, validator, recommendations

- `publication-slot-builder.ts`
- `schedule-service.ts`
- `schedule-validator.ts`
- `recommended-date-engine.ts`

## 14–16. Dashboard routes

| Route | Назначение |
|-------|------------|
| `/dashboard/content/calendar` | Day view + KPI |
| `/dashboard/content/calendar/week` | Weekly grid |
| `/dashboard/content/calendar/month` | Monthly density |
| `/dashboard/content/calendar/queue` | Unscheduled approved |
| `/dashboard/content/calendar/settings` | Mode, limits, timezone |

## 17–19. Integrations

- `distribution-schedule-integration.ts` — teaser after full article
- `visual-readiness-integration.ts` — cover/OG/social
- `cms-schedule-integration.ts` — sync scheduled status

## 20. Analytics

`calendar-analytics.ts` — 12 events.

## 21–25. UX, SEO safety, что можно/нельзя

- Нельзя планировать draft/review/ai-generated
- Teaser до full article — blocker
- Aggressive mode — только с подтверждением

## 26. Этап 28 TODO

Keyword demand, priority scoring, commercial intent, auto queue sort, сезонность Иркутска.

## 27. Этап 30 TODO

Planned vs published, schedule mode ROI, leads by date, teaser CTR by time.

---

### Таблица 1 — Schedule mode

| Schedule mode | Site/day | External/day | Когда использовать | Риск |
| ------------- | -------: | -----------: | ------------------ | ---- |
| cautious | 1–3 | 1–5 | Ранний этап, мало approved | low |
| working | 3–7 | 5–15 | Стабильный pipeline | medium |
| aggressive | 7–15 | 15–40 | После индексации + аналитики | high |
| manual | custom | custom | Ручные лимиты | medium |

### Таблица 2 — Readiness

| Readiness type | Что проверяет | Blocker или warning |
| -------------- | ------------- | ------------------- |
| CMS | approved status, review | blocker |
| SEO | metadata, canonical | blocker/warning |
| Visual | cover, OG, alt | blocker if indexable |
| Distribution | UTM, teasers | blocker for external |

### Таблица 3 — Content kind

| Content kind | Можно планировать когда | Что блокирует |
| ------------ | ----------------------- | ------------- |
| programmatic-page | approved + quality | thin content, no canonical |
| technical-article | approved + expert if required | no disclaimer |
| news | approved + source | no source |
| editorial | approved + fiction notice if needed | missing notice |

### Таблица 4 — Balance rules

| Balance rule | Зачем нужно | Severity |
| ------------ | ----------- | -------- |
| max 40% programmatic/week | SEO diversity | warning |
| min 20% technical/week | E-E-A-T | warning |
| max 1 digest/day | avoid spam | warning |

### Таблица 5 — Events

| Event | Где | Payload | Зачем |
| ----- | --- | ------- | ----- |
| content_scheduled | schedule API | contentItemId, scheduledAt | Pipeline |
| schedule_validation_failed | validator | blockersCount | Quality gate |
| content_calendar_mode_changed | settings | scheduleMode | Ops |

## Проверки

```bash
npm run build
```

**Результат (2026-06-05):** `npm run build` — **успешно** (389 страниц, включая `/dashboard/content/calendar/*` и API `/api/dashboard/content-calendar/*`).

Исправлено при сборке: `FactCheckStatus` (`passed` вместо `verified`), тип `ScheduleOptions.publicationType`, логика `fullArticleBeforeTeaser` в validator.
