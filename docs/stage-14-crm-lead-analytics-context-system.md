# Этап 14 — CRM, аналитика заявок и передача контекста лида

Дата: 2026-06-05  
Сайт: https://voytkevich-artel.vercel.app/

Предыдущие этапы: документы `stage-1` … `stage-13` найдены в `/docs`.

---

## 1. Что сделано на Этапе 14

- Единая модель **`Lead`** (`src/types/lead.ts`).
- Слой формирования payload: `lead-payload.ts`, `lead-validation.ts`, `lead-source.ts`, `lead-score.ts`.
- Единый клиентский **`submitLead()`** и hook **`useLeadForm`**.
- Обновлён **`POST /api/leads`** — принимает structured payload + legacy fallback.
- Адаптеры доставки: webhook, Telegram, Supabase (TODO), email (TODO), dev mock.
- UTM + session attribution (`utm.ts`, `session.ts`, `AttributionInit` в layout).
- Conversion goals (`conversion-goals.ts`) + unified events (`events.ts`).
- Обновлены ключевые формы: главная, проект, калькулятор, планировщик, коммерческие страницы, блог, лид-магниты.
- Readable summary для Telegram/webhook (`formatLeadSummary`).
- SQL migration для Supabase: `docs/supabase-leads-migration.sql`.

---

## 2. Главная роль CRM-контекста

Заявка приходит как структурированная карточка с источником, контекстом (проект / калькулятор / планировщик / лид-магнит), UTM, leadScore и readiness — не как «имя + телефон».

---

## 3–7. Модель Lead

См. `src/types/lead.ts`: `Lead`, `LeadSource`, `LeadContext`, `LeadQualification`, `LeadAnalytics`, `LeadStatus`.

---

## 8. UTM и атрибуция

| Функция | Файл | Назначение |
|---|---|---|
| `getUtmFromUrl()` | `utm.ts` | Парсинг UTM из URL |
| `saveUtmToStorage()` | `utm.ts` | Сохранение в localStorage |
| `getStoredUtm()` | `utm.ts` | Чтение UTM |
| `getAttributionData()` | `utm.ts` | landingPage, referrer, first/last touch |
| `initAttribution()` | `utm.ts` | Вызывается в `AttributionInit` |
| `getOrCreateSessionId()` | `session.ts` | sessionId для analytics |

---

## 9. submitLead

Клиент: `src/lib/leads/submit-lead.ts`

1. Валидация contact
2. Merge UTM + session
3. POST `/api/leads`
4. Conversion goal + lead events
5. Human-readable result

---

## 10. API route

`POST /api/leads`

- Structured body: `{ contact, request, source, context, ... }`
- Legacy body: `{ name, phone, area, comment, source, website }` → нормализуется
- Honeypot → status `spam`, silent success
- Fast submit (<1.5s) → suspicious
- `persistLead()` → webhook / supabase / telegram / dev mock

---

## 11–12. Валидация и антиспам

- Zod schema `LeadFormInputSchema`
- Honeypot `website`
- Submit timing check
- Double-submit blocked in `useLeadForm`
- Phone normalization

---

## 13. useLeadForm

`src/hooks/use-lead-form.ts` — values, errors, isSubmitting, isSuccess, submit, honeypot.

`LeadForm` использует hook + опциональный `leadConfig`.

---

## 14–15. Формы и payload

| Форма | Где | SourceType | Context | Goal | Статус |
|---|---|---|---|---|---|
| Главная | `/` | home | — | callback_request | ✅ updated |
| Карточка проекта | `/catalog/[slug]` | project-page | project.* | project_request | ✅ updated |
| Калькулятор | `/calculator` | calculator | calculator.* | calculator_submit | ✅ updated |
| Планировщик | `/planirovka` | planner | planner.* | planner_submit | ✅ updated |
| Коммерческая | `/[slug]` | service-page | service.* | service_page_submit | ✅ updated |
| Блог (статья) | `/blog/[slug]` | blog-post | blog.* | blog_submit | ✅ updated |
| Лид-магнит | inline/modal | lead-magnet | leadMagnet + context | lead_magnet_submit | ✅ updated |
| Кейсы | `/cases/[slug]` | case-page | case.* | case_like_request | ✅ updated |
| Карта объектов | `/objects-map` | objects-map | legacy infer | objects_map_request | ⚠️ legacy infer |
| Каталог picker | `/catalog` | catalog | legacy infer | catalog_project_selection | ⚠️ TODO |
| FAQ / process / about | various | unknown | legacy | form_submit | ⚠️ legacy |

---

## 16. Lead score

`calculateLeadScore()` — rule-based 0–100.  
`scoreToReadiness()`: 0–30 cold, 31–60 warm, 61+ hot.

---

## 17. Статусы лида

`new` (default), `spam` (honeypot), остальные — для будущей CRM (Этап 15).

---

## 18–19. Adapters

| Adapter | Env | Статус |
|---|---|---|
| Webhook | `N8N_LEAD_WEBHOOK_URL` или `LEADS_WEBHOOK_URL` | ✅ готов |
| Telegram | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | ✅ готов (было) |
| Supabase | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | TODO + SQL migration |
| Email | `LEADS_NOTIFICATION_EMAIL`, `RESEND_API_KEY` | TODO |
| Dev mock | `NODE_ENV=development` | ✅ active |

**Активный канал сейчас:** Telegram и/или webhook — в зависимости от env на Vercel.  
**Не подключено:** Supabase storage, email, amoCRM.

---

## 20. Supabase

SQL: `docs/supabase-leads-migration.sql`  
Adapter: `saveLeadToSupabase()` — no-op без env.

---

## 21–22. Аналитика и цели

`src/lib/analytics/events.ts` — `trackEvent`, `trackConversionGoal`, specialized helpers.

| Goal | Trigger |
|---|---|
| form_submit | Любая заявка |
| calculator_submit | Калькулятор |
| planner_submit | Планировщик |
| project_request | Проект |
| lead_magnet_submit | Лид-магнит |
| service_page_submit | Коммерческая |
| blog_submit | Блог |
| callback_request | Главная |

Env: `NEXT_PUBLIC_YM_ID`, `NEXT_PUBLIC_GA_ID` (optional).

---

## 23. SessionId

`getOrCreateSessionId()` в sessionStorage. Передаётся в `analytics.session`.

---

## 24. Success/error UX

Контекстные success messages из API + `LeadForm` / `LeadMagnetForm`.  
Технические ошибки не показываются пользователю.

---

## 25. Privacy

Микротекст + ссылка `/privacy`. `privacy.consent: true` при отправке.

---

## 26. Таблица payload-полей

| Поле | Источник | Обязательное? | Зачем менеджеру |
|---|---|---|---|
| contact.name/phone | форма | да | связаться |
| source.sourceType | leadConfig | да | откуда заявка |
| source.pageSlug | leadConfig | нет | конкретная страница |
| request.selectedCTA | форма | нет | что нажал |
| context.project | project form | нет | какой проект |
| context.calculator | calculator | нет | параметры расчёта |
| context.planner | planner | нет | планировка |
| context.leadMagnet | lead magnet | нет | тема запроса |
| analytics.utm | localStorage | нет | маркетинг |
| qualification.leadScore | server | нет | приоритет |

---

## 27. Manual test checklist

1. ☐ Форма с главной — payload sourceType=home
2. ☐ Заявка из проекта — project.slug в context
3. ☐ Калькулятор — calculator.area/material/total
4. ☐ Планировщик — planner.rooms
5. ☐ Лид-магнит — leadMagnet.id
6. ☐ Коммерческая — service.slug
7. ☐ Блог — blog.slug, clusterId
8. ☐ UTM: `?utm_source=test` → сохраняется
9. ☐ Honeypot заполнен → silent success
10. ☐ Пустой телефон → ошибка валидации
11. ☐ Success state читаемый
12. ☐ currentUrl в meta

---

## 28. Env-настройка

```env
# Доставка (минимум один канал для production)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
N8N_LEAD_WEBHOOK_URL=   # или LEADS_WEBHOOK_URL

# Будущее
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
LEADS_NOTIFICATION_EMAIL=
RESEND_API_KEY=

# Аналитика
NEXT_PUBLIC_YM_ID=
NEXT_PUBLIC_GA_ID=
```

---

## 29. Что переходит в Этап 15

- `/dashboard/leads` — список и карточка лида
- Смена status, комментарии менеджера, assignedTo
- Фильтры по sourceType / readiness
- CSV export
- amoCRM / Bitrix / n8n полная интеграция

---

## 30. Проверки

| Команда | Результат |
|---|---|
| `npm run build` | ✅ Успешно (133 pages) |
| `npm run lint` | legacy warnings (не Stage 14) |

---

## Файловая структура

```
src/types/lead.ts
src/lib/leads/
  lead-payload.ts
  lead-validation.ts
  lead-source.ts
  lead-score.ts
  lead-storage.ts
  submit-lead.ts
  adapters/index.ts
src/lib/analytics/
  events.ts
  utm.ts
  session.ts
  conversion-goals.ts
src/hooks/use-lead-form.ts
src/components/forms/
  lead-form.tsx
  honeypot-field.tsx
src/components/analytics/attribution-init.tsx
src/app/api/leads/route.ts
docs/supabase-leads-migration.sql
```
