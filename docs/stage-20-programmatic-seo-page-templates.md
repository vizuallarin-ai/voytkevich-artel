# Этап 20 — Шаблоны программируемых SEO-страниц проектов

Документ описывает систему шаблонов programmatic SEO, связывающую таксономию Этапа 19 с посадочными страницами, компонентами, metadata, CRM и аналитикой.

## 1. Что сделано на Этапе 20

- 8 типов шаблонов страниц (`ProgrammaticPageTemplateType`)
- Конфигурация шаблонов: `src/data/programmatic-page-templates.ts`
- Resolver, data builder, project matcher, related pages
- Metadata, canonical, robots, Schema.org, FAQ, CTA, lead context
- UI-компоненты `src/components/programmatic-seo/*`
- Маршруты `/proekty-domov`, `/proekty-ban`, `/stroitelstvo-domov/[slug]`
- Dashboard preview: `/dashboard/seo/templates`
- Analytics events для programmatic-страниц
- Интеграция с CRM через `LeadContext.programmatic`

**Не сделано намеренно:** массовая публикация, indexable по умолчанию, генерация тысяч URL.

## 2. Связь с Этапами 18 и 19

| Этап | Вклад |
|------|-------|
| 18 | Типы programmatic-страниц, index/noindex, canonical, приоритеты, очередь, защита от thin content |
| 19 | Таксономия объектов, материалов, размеров, geo, матрица комбинаций, правила SEO vs filter |
| 20 | Шаблоны UI + data layer + маршруты, превращающие комбинации в посадочные страницы |

## 3. Шаблоны страниц

1. `object-category` — категории проектов
2. `material-page` — материалы
3. `size-page` — типоразмеры
4. `area-page` — площади
5. `floors-page` — этажность
6. `feature-page` — особенности
7. `location-page` — география
8. `combination-page` — комбинации

## 4–11. Описание шаблонов

Каждый шаблон включает: hero, intro, project grid, CTA, FAQ, форму, schema. Material/size/area добавляют блоки «кому подходит» и «от чего зависит стоимость». Location — локальный контекст без выдуманных фактов. Combination — строгая проверка index/noindex.

Примеры URL см. таблицу 1.

## 12. Project matcher

`src/lib/programmatic-seo/project-matcher.ts`:

- Точные совпадения по objectType, material, size, feature
- Fallback: broader category → related projects → empty state
- Честный disclaimer при fallback

## 13. Related pages

`src/lib/programmatic-seo/related-pages-builder.ts` — материалы, размеры, локации, статьи блога, filter links.

## 14. Metadata / canonical / robots

`programmatic-metadata.ts` — title, description, robots, canonical из `TaxonomyCombination.indexing`.

Правило: `pageData.robots.index = false` → noindex. Canonical из таксономии или self URL.

## 15. Schema

`programmatic-schema.ts` — BreadcrumbList, FAQPage (если FAQ), ItemList (проекты). Без fake ratings/offers/prices.

## 16. CTA и лид-магниты

`programmatic-cta.ts` — CTA по интенту и типу страницы. Лид-магниты маппятся на `src/data/lead-magnets.ts`.

## 17. Lead context

`ProgrammaticLeadContext` передаётся в CRM через `LeadContext.programmatic` и `managerNote` в форме.

## 18. Analytics events

- `programmatic_page_viewed`
- `programmatic_project_clicked`
- `programmatic_filter_used`
- `programmatic_cta_clicked`
- `programmatic_lead_form_started` (через LeadForm)
- `programmatic_lead_submitted` (через LeadForm)
- `programmatic_related_page_clicked`
- `programmatic_lead_magnet_clicked`

## 19. UX desktop / mobile

- Desktop: hero, grid, CTA после проектов, форма внизу
- Mobile: sticky CTA, accordion FAQ, readable cards

## 20. SEO требования

Один H1, уникальные title/description, canonical, robots, breadcrumbs, FAQ, перелинковка, schema.

Noindex если: нет проектов, нет контента, draft, высокий риск каннибализации, узкая комбинация.

## 21. Dashboard preview

`/dashboard/seo/templates` — список шаблонов, блоки, счётчики комбинаций, indexable.

## 22. Что можно публиковать

После `approved` + проекты в каталоге + human review: L1 material, P1 size, P1 geo (по очереди Этапа 18).

## 23. Что должно быть noindex

Все комбинации по умолчанию, combination L2+, features без данных, materials не подтверждённые как услуга.

## 24. Что требует реальных проектов

Material, size, area, feature pages с `minProjectsCount >= 1`.

## 25. Что требует проверки заказчиком

Geo-страницы, combination, тексты intro/SEO, indexable approval.

## 26. Этап 21 — TODO

- [ ] Шаблоны технических how-to статей
- [ ] How-to taxonomy
- [ ] Дисклеймеры
- [ ] Структура: короткий ответ → разбор → ошибки → FAQ → CTA
- [ ] Блок «мнение редакции»
- [ ] Автор/эксперт
- [ ] Связь technical статей с programmatic страницами
- [ ] Связь с лид-магнитами
- [ ] FAQ schema для how-to
- [ ] Teaser-ready структура для внешней дистрибуции

---

### Таблица 1

| Template | Пример URL | Главный интент | Indexable by default | Риск |
| -------- | ---------- | -------------- | -------------------- | ---- |
| object-category | /proekty-domov | Выбор категории проектов | нет | низкий |
| material-page | /proekty-domov/karkasnye-doma | Материал / технология | нет | средний |
| size-page | /proekty-domov/dom-8-na-10 | Типоразмер | нет | средний |
| area-page | /proekty-domov/doma-100-150-m2 | Площадь | нет | средний |
| floors-page | /proekty-domov/odnoetazhnye-doma | Этажность | нет | средний |
| feature-page | /proekty-domov/doma-s-terrasoy | Особенность планировки | нет | средний |
| location-page | /stroitelstvo-domov/irkutsk | Локальное строительство | нет | высокий (thin) |
| combination-page | /proekty-domov/karkasnye-doma-8-na-10 | Комбинированный запрос | нет | высокий |

### Таблица 2

| Блок страницы | Где используется | Зачем нужен | Обязателен |
| ------------- | ---------------- | ----------- | ---------- |
| breadcrumbs | все | Навигация + schema | да |
| hero | все | H1 + интент | да |
| intro | все | Уникальный контекст | да |
| project-grid | все | Релевантные проекты | да |
| filters | category | Быстрые подборки | category |
| cost-factors | material, size, location | Коммерческий интент | по шаблону |
| who-it-fits | material, area, feature | Сегментация | по шаблону |
| how-to-choose | size, floors | Помощь в выборе | по шаблону |
| cta | все | Конверсия | да |
| lead-magnet | category, material, location | Лид без звонка | опционально |
| related-pages | большинство | Перелинковка | по шаблону |
| faq | все | SEO + schema | да |
| seo-text | все | Доп. контент | да |
| final-form | все | CRM lead | да |
| schema | все | Rich results | да |

### Таблица 3

| CTA | Для какого интента | Lead context | Где показывать |
| --- | ------------------ | ------------ | -------------- |
| Подобрать проект под участок | project | objectTypeId, pageUrl | category |
| Рассчитать стоимость | commercial / price | materialId, sizeId | material, size |
| Обсудить строительство в локации | local | regionId | location |
| Получить расчёт под участок | combination | full taxonomy | combination |
| Получить пример сметы | price | sizeId | size, area |

### Таблица 4

| Page type | Projects required | FAQ required | Canonical check | Human review |
| --------- | ----------------- | ------------ | --------------- | ------------ |
| object-category | 1+ | да | да | да |
| material-page | 1+ | да | да | да |
| size-page | 1+ (fallback ok) | да | да | да |
| area-page | 1+ | да | да | да |
| floors-page | 1+ | да | да | да |
| feature-page | 1+ | да | да | да |
| location-page | 0+ | да | да | да |
| combination-page | 1+ | да | да | обязательно |

### Таблица 5

| Риск | Почему опасно | Как предотвращаем |
| ---- | ------------- | ----------------- |
| Thin content | Фильтр без текста | intro, FAQ, seo-text, min projects |
| Каннибализация | Дубли с каталогом | canonical, noindex combination |
| Fake schema | Санкции | без price/rating/review |
| Массовый index | SEO-мусор | indexableByDefault: false |
| Выдуманный geo | Доверие | noindex без данных, human review |

---

## Файловая структура

```
src/types/programmatic-page-template.ts
src/data/programmatic-page-templates.ts
src/lib/programmatic-seo/
  page-template-resolver.ts
  page-data-builder.ts
  project-matcher.ts
  related-pages-builder.ts
  programmatic-metadata.ts
  programmatic-schema.ts
  programmatic-faq.ts
  programmatic-cta.ts
  programmatic-lead-context.ts
  programmatic-analytics.ts
  programmatic-route.ts
src/components/programmatic-seo/
src/app/proekty-domov/
src/app/proekty-ban/
src/app/stroitelstvo-domov/
```
