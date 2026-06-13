# Этап 13 — Лид-магниты и промежуточные точки захвата заявок

Дата: 2026-06-05  
Сайт: https://voytkevich-artel.vercel.app/

Предыдущие этапы: документы `stage-1` … `stage-12` найдены в `/docs`.

---

## 1. Что сделано на Этапе 13

- Единая **data-модель лид-магнитов** (`LeadMagnet`, `LeadMagnetPlacement`).
- **8 активных лид-магнитов** с честными обещаниями (без фейкового PDF).
- Карта размещений `lead-magnet-placements.ts` + maps для кластеров блога и коммерческих страниц.
- Утилиты `@/lib/lead-magnets`: подбор по id/cluster/pageType, payload, analytics, success.
- Универсальные компоненты:
  - `LeadMagnetCard`
  - `LeadMagnetInlineCTA`
  - `LeadMagnetModal`
  - `LeadMagnetForm`
  - `LeadMagnetSection`
  - `LeadMagnetsBlock` (обёртка для страниц)
- Интеграция на ключевые страницы: главная, каталог, проекты, калькулятор, планировщик, блог, коммерческие страницы, кейсы, карта объектов.
- Форма отправляет в существующий **`POST /api/leads`** с honeypot (`website`).
- Адаптер `blog-lead-magnets.ts` для обратной совместимости с блогом (Stage 10).

**TODO (следующие этапы):**

- PDF-генерация / email-отправка материалов (`file.generationStatus: "future"`).
- Единая модель Lead + CRM/webhook (Этап 14).
- View-tracking через IntersectionObserver (опционально).

---

## 2. Роль лид-магнитов в воронке

Лид-магниты закрывают промежуток между «просто читаю сайт» и «готов оставить заявку на строительство».

| Цель | Как достигается |
|---|---|
| Не давить заявкой рано | Промежуточная ценность: чек-лист, разбор, подборка |
| Собрать контакт | Имя + телефон (+ контекстные поля) |
| Собрать контекст | pageType, clusterId, calculatorResult, projectSlug и т.д. |
| Подготовить CRM | Структурированный comment + source в `/api/leads` |

---

## 3. Data-модель LeadMagnet

Файл: `src/types/lead-magnet.ts`  
Данные: `src/data/lead-magnets.ts`

Ключевые поля: `id`, `slug`, `title`, `type`, `status`, `clusterIds`, `pageTypes`, `intent`, `valuePromise`, `highlights`, `cta`, `formFields`, `payloadDefaults`, `file`, `legalNote`, `analytics`.

**Правила честности:**

- `file.hasFile: false` — PDF не готов.
- `generationStatus: "future"` — материал отправляется специалистом вручную до автоматизации.
- CTA: «получить», «разобрать», «подобрать» — не «скачать PDF».

---

## 4. Data-модель LeadMagnetPlacement

Файл: `src/data/lead-magnet-placements.ts`

```ts
type LeadMagnetPlacement = {
  id, leadMagnetId, pageType, pageSlug?, clusterId?,
  position, priority, displayMode, rules?
}
```

Maps: `serviceLeadMagnetMap`, `clusterLeadMagnetMap`, `clusterSecondaryMagnetMap`.

---

## 5. Список лид-магнитов

| Лид-магнит | ID | Тип | Кластеры | CTA | Статус |
|---|---|---|---|---|---|
| Пример сметы | `estimate-example` | pdf/manual | cost, estimate, estimate-contract-control | Получить пример сметы | active |
| Чек-лист участка | `land-checklist` | checklist | land, foundation-land, geography | Получить чек-лист участка | active |
| Подборка проектов | `budget-project-selection` | selection | projects, cost, catalog | Подобрать проекты | active |
| Разбор планировки | `layout-review` | planner-review | planning, planning-projects | Разобрать планировку | active |
| Сравнение материалов | `material-comparison` | comparison | materials, comparisons | Сравнить материалы | active |
| Чек-лист ошибок | `mistakes-checklist` | checklist | mistakes, trust | Получить чек-лист ошибок | active |
| Вводные для ипотеки | `mortgage-inputs` | checklist | mortgage-documents | Получить список вводных | active |
| Разбор стоимости | `cost-review` | consultation | cost, calculator, estimate | Получить разбор стоимости | active |

---

## 6. Где используются лид-магниты

| Страница/тип | Основной | Вторичный | Цель |
|---|---|---|---|
| Главная | mistakes-checklist | cost-review, budget, land | Промежуточный шаг без давления |
| Каталог | budget-project-selection | — | Подбор под бюджет |
| Карточка проекта | cost-review | layout-review | Расчёт / адаптация |
| Калькулятор | cost-review | estimate-example | Разбор после расчёта |
| Планировщик | layout-review | land-checklist | Разбор планировки / участка |
| Блог (по clusterId) | cluster map | secondary map | Контекстный inline + card |
| Коммерческие страницы | serviceLeadMagnetMap | второй из map | SEO + конверсия |
| Кейсы | budget-project-selection | cost-review | «Хочу похожий дом» |
| Карта объектов | land-checklist | budget, cost | Участок / похожий дом |

---

## 7–11. Компоненты

### LeadMagnetCard

Карточка: тип материала, заголовок, описание, highlights (3–5), CTA → модалка, `legalNote`.

### LeadMagnetInlineCTA

Встроенный блок для статей и SEO-текстов. Не агрессивный, в контексте темы.

### LeadMagnetModal

Radix Dialog: форма, success/error, focus management, мобильная адаптация.

### LeadMagnetForm

Универсальная форма: поля из `magnet.formFields`, honeypot, POST `/api/leads`, analytics events.

### LeadMagnetSection

Секция с заголовком «Не готовы сразу оставлять заявку?» + сетка карточек.

---

## 12. Payload заявки

Формируется в `buildLeadMagnetComment()` + `buildLeadMagnetSource()`:

```json
{
  "source": "lead-magnet:estimate-example:blog-post",
  "leadMagnetId": "estimate-example",
  "pageType": "blog-post",
  "pageSlug": "...",
  "clusterId": "cost",
  "userInput": { "name", "phone", "budget", "area", ... },
  "context": {
    "projectSlug", "calculatorResult", "plannerSummary",
    "caseSlug", "serviceSlug", "blogPostSlug", "objectSlug"
  }
}
```

| Payload-поле | Откуда | Зачем |
|---|---|---|
| leadMagnetId | data | Тип запроса в CRM |
| pageType / pageSlug | страница | Источник трафика |
| clusterId | блог / SEO | Тематика интереса |
| calculatorResult | калькулятор | Вводные расчёта |
| plannerSummary | планировщик | Сценарий, комнаты, участок |
| projectSlug | карточка проекта | Конкретный проект |
| caseSlug | кейс | «Похожий дом» |
| blogPostSlug | статья | Контент-триггер |

---

## 13–19. Интеграции по разделам

### Блог

- После short answer: `LeadMagnetsBlock` mode=`inline` (1 magnet по clusterId).
- Перед related: `LeadMagnetsBlock` mode=`cards` (до 1 доп.).
- Финальная `LeadForm` сохранена (Stage 10).

### Коммерческие страницы

`ServicePageTemplate`: после `ServiceRisks`, перед FAQ — `LeadMagnetsBlock` по `serviceLeadMagnetMap`.

### Каталог и проекты

- `/catalog`: `budget-project-selection` после списка.
- `/catalog/[slug]`: `cost-review` + `layout-review` с `projectSlug`.

### Калькулятор

После результата: `cost-review`, `estimate-example` с `calculatorResult` в context.

### Планировщик

`PlannerLeadSection`: `layout-review`, `land-checklist` + существующая LeadForm.

### Кейсы и карта

- `/cases`, `/cases/[slug]`: budget + cost review.
- `/objects-map`: land-checklist, budget, cost (section).

---

## 20. Success-сообщения

Честные формулировки без «PDF скачан», «смета готова», «ипотека одобрена».  
Тексты в `lead-magnets.ts` → `cta.successTitle` / `cta.successMessage`.

---

## 21. Аналитика

Helper: `trackLeadMagnetEvent()` → `trackEvent()` (Yandex Metrika, no-op если не подключена).

| Событие | Когда | Payload |
|---|---|---|
| lead_magnet_clicked | Клик CTA | leadMagnetId, pageType, clusterId |
| lead_magnet_modal_opened | Открыта модалка | leadMagnetId |
| lead_magnet_form_started | Фокус в форме | leadMagnetId, pageType |
| lead_magnet_submitted | Отправка | leadMagnetId, source |
| lead_magnet_success_viewed | Success state | leadMagnetId |
| lead_magnet_error | Ошибка | leadMagnetId |

View (`lead_magnet_viewed`) — не реализован (TODO).

---

## 22. Антиспам и валидация

- Honeypot `website` в форме + silent success в API если заполнен.
- Обязательные name/phone, мин. длина телефона (API).
- Disabled при отправке, защита от двойного submit.
- Пользователю — понятные сообщения, не технические ошибки.

TODO: captcha / rate limit при росте заявок.

---

## 23. Mobile UX

- Карточки: 1 колонка на mobile.
- Модалка: scroll внутри, без overflow.
- На страницах — max 1–2 лид-магнита в видимой зоне; остальные ниже.
- Без auto-popup.

---

## 24. Что нельзя обещать

- Точную смету/цену онлайн без вводных.
- Скачивание PDF, если файла нет.
- Одобрение ипотеки / ставки банков.
- Гарантии «без рисков».

---

## 25. Что требует ручной настройки

- Подготовка реальных PDF/чек-листов для отправки.
- CRM / Telegram / n8n маршрутизация по `leadMagnetId`.
- UTM-сохранение (Этап 14).
- View analytics через IntersectionObserver.

---

## 26. Что переходит в Этап 14

- Единая модель `Lead`.
- API route / server action с полным JSON payload.
- CRM или webhook (n8n / Supabase).
- UTM, selectedCTA, статусы лида.
- Цели: `lead_magnet_submit`, `calculator_submit`, `planner_submit`, `project_request`.
- Автоотправка материалов после CRM-триггера.

---

## 27. Проверки

| Команда | Результат |
|---|---|
| `npm run build` | ✅ Успешно (Next.js 16.2.6, 133 static pages) |
| `npm run lint` | ⚠️ 10 errors в legacy-коде (не Stage 13), 7 warnings |
| `npm run typecheck` | включён в `next build` — без ошибок |

Исправлено при сборке: `PlannerRecommendation.text` вместо `.title` в `planner-lead-section.tsx`.

Известные lint-замечания в legacy-коде (setState in effect) — не связаны с Этапом 13.

---

## Файловая структура

```
src/types/lead-magnet.ts
src/data/lead-magnets.ts
src/data/lead-magnet-placements.ts
src/data/blog-lead-magnets.ts          # adapter Stage 10
src/lib/lead-magnets.ts
src/components/lead-magnets/
  lead-magnet-card.tsx
  lead-magnet-inline-cta.tsx
  lead-magnet-modal.tsx
  lead-magnet-form.tsx
  lead-magnet-section.tsx
  lead-magnets-block.tsx
```
