# Этап 25 — Внешняя дистрибуция контента

Система teaser-публикаций с UTM, manual export, adapters и lead attribution для stroistroy.ru.

## 1. Что сделано

- Platform registry (12 площадок)
- Типы `ExternalPublication`, queue, validation
- UTM builder (`utm_medium=content_teaser`)
- Publication service + in-memory repository
- Platform adapters: Telegram, VK, n8n, RSS, email, manual
- Manual export с copy + mark published
- Dashboard `/dashboard/content/distribution/*`
- Lead attribution при `utm_medium=content_teaser`
- Analytics events

## 2. Связь с Этапами 18–24

| Этап | Связь |
|------|-------|
| 18–22 | Контент на сайте — canonical full article |
| 23 | CMS statuses, published + indexable gate |
| 24 | AI teaser package → publication draft |

## 3. Главная логика

```text
Полная статья на stroistroy.ru
→ teaser + UTM на внешнюю площадку
→ переход на full article
→ lead attribution
```

## 4. Почему нельзя дублировать полные статьи

SEO cannibalization, E-E-A-T, потеря canonical control.

## 5–8. Модели

См. `src/types/content-distribution.ts`, `src/data/distribution-statuses.ts`.

## 9. UTM

`src/lib/content-distribution/utm-builder.ts`

| Поле | Значение |
|------|----------|
| utm_source | platform utmSource |
| utm_medium | content_teaser |
| utm_campaign | campaignId |
| utm_content | teaserId / contentItemId |
| utm_term | clusterId / rubricId |

## 10–14. Validation, adapters, manual, n8n

- `publication-validator.ts` — blockers: no UTM, full article not published, duplicate
- `platform-adapters/*` — honest needs-api без fake success
- `manual-export.ts` — copy text, UTM, checklist
- `n8n-webhook-adapter.ts` — `N8N_PUBLICATION_WEBHOOK_URL`

## 15–18. Dashboard routes

| Route | Назначение |
|-------|------------|
| `/dashboard/content/distribution` | KPI + recent |
| `.../queue` | Очередь |
| `.../publications` | Все публикации |
| `.../publications/[id]` | Деталь |
| `.../platforms` | Registry |
| `.../manual-export` | Ручной экспорт |

## 19. Lead attribution

`lead-attribution.ts` + enrich в `/api/leads` при content_teaser UTM.

## 20. Analytics

`publication-analytics.ts` — 15+ events.

## 21. RSS/email

RSS adapter — teaser feed item. Email — export payload (manual).

## 22. SEO safety

Canonical без UTM. External — только teaser. Draft/noindex — no distribution.

## 23–25. Auto / manual / API

| Platform | Adapter | Auto | Manual |
|----------|---------|------|--------|
| telegram | needs-api* | при env | да |
| vk | needs-api* | при env | да |
| dzen/vc/ok | manual | нет | да |
| n8n | needs-api | webhook | fallback |
| rss | active | feed | — |
| manual-export | active | нет | да |

\* `TELEGRAM_BOT_TOKEN`+`TELEGRAM_CHANNEL_ID`, `VK_ACCESS_TOKEN`+`VK_GROUP_ID`

## 26. Этап 27 TODO

Calendar, schedule, capacity 3–15/day, anti-spam.

## 27. Этап 30 TODO

Platform CTR, leads from teaser, ROI.

## 28. Этап 26 TODO

Visual templates, image formats 16:9/1:1/4:5/9:16.

## Проверки

```bash
npm run build
npm run lint
```

## Env

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHANNEL_ID=
VK_ACCESS_TOKEN=
VK_GROUP_ID=
N8N_PUBLICATION_WEBHOOK_URL=
```
