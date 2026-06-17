# Этап 22 — Редакционный блог: истории, персонажи, новости и дайджесты

## 1. Что сделано на Этапе 22

- 13 редакционных рубрик (`src/data/editorial-rubrics.ts`)
- 6 авторов и персонажей с disclaimers (`src/data/editorial-authors.ts`)
- 4 story-, 3 news-, 4 digest-шаблона
- Правила этики и маркировки (`src/data/editorial-ethics-rules.ts`)
- Правила фактчекинга (`src/data/editorial-fact-check-rules.ts`)
- 50 тем в initial queue — все `needs-human-review` / `needs-source`, noindex
- Lib: page builder, metadata, schema, CTA, related links, quality, teaser readiness, analytics, lead context
- UI: `src/components/editorial-content/*` (layout, hero, fiction notice, source notice, CTA, форма)
- Интеграция в `/blog/[slug]`: BlogPost → technical → editorial → notFound
- Dashboard: `/dashboard/content/editorial`
- `LeadSourceType: editorial-content`, `LeadContext.editorial`

## 2. Связь с Этапами 18–21

| Этап | Вклад |
|------|-------|
| 18 | SEO-архитектура, teaser/UTM, thin content, index policy |
| 19 | Таксономия проектов, geo, материалы |
| 20 | Programmatic landing pages, CTA, lead context |
| 21 | Техническая база знаний — how-to, дисклеймеры |
| 22 | Редакционная ветка — stories, personas, news, digests |

## 3. Зачем нужен редакционный блог

Прогрев доверия, жизненные сценарии, локальный контекст Иркутска, дайджесты и новости — с честной маркировкой вымысла и без фейковых кейсов.

## 4. Отличие от технической базы знаний

| Техническая база | Редакционный блог |
|------------------|-------------------|
| How-to, чек-листы | Истории и сценарии |
| Инженерные ответы | Эмоциональный контекст |
| Дисклеймер расчёта | Fiction notice |
| Expert review | Human review + source |

## 5–12. Рубрики, авторы, шаблоны, очередь

См. data-файлы в `src/data/editorial-*.ts`. Initial queue: 50 URL из промпта Этапа 22.

## 13. Структура материала

Breadcrumbs → Hero → Author → Fiction/Source notice → Hook → Story → Takeaways → CTA → Related technical → Related projects → Lead magnet → FAQ → Lead form.

## 14–17. CTA, связи, lead context

- CTA по рубрике: project-selection, land-checklist, estimate-example, bathhouse-selection, consultation
- Related links: каталог, programmatic pages, technical articles, калькулятор
- `EditorialLeadContext` → CRM summary через `formatEditorialLeadSummary()`

## 18–21. SEO, schema, quality, teaser

- `generateEditorialMetadata()` — noindex для draft/review/needs-*/без source/без fiction notice
- Schema: Article, BreadcrumbList, FAQPage (без Review/Rating для fiction)
- `calculateEditorialContentQualityScore()` — blockers: fiction без маркировки, news без source, thin content, fake claims
- `isEditorialContentTeaserReady()` — подготовка к Этапам 24–27 (без автопостинга)

## 22. Dashboard

`/dashboard/content/editorial` — список материалов, status, quality, fiction, indexable.

## 23. Analytics events

| Event | Где | Зачем |
|-------|-----|-------|
| `editorial_article_viewed` | tracker | просмотр |
| `editorial_cta_clicked` | CTA | конверсия |
| `editorial_lead_magnet_clicked` | lead magnet | магнит |
| `editorial_lead_form_started/submitted` | форма | воронка |
| `editorial_related_*_clicked` | related | перелинковка |
| `editorial_fiction_notice_viewed` | notice | compliance |
| `editorial_source_clicked` | source notice | новости |

## 24–25. UX

Desktop/mobile: читаемая история, заметный но не агрессивный fiction notice, CTA после первого экрана, адаптивные карточки.

## 26–29. Публикация

**Можно публиковать:** approved + quality good/strong + fiction notice (если нужен) + source (для news).

**Noindex:** planned, draft, needs-human-review, needs-source, fiction без маркировки, poor quality.

**Требует источника:** news, trend-review, regulation-notes.

**Требует ручной проверки:** все материалы initial queue.

## 30. Этап 23 — TODO

- [ ] Единый content dashboard
- [ ] Editorial workflow: review/approve/schedule
- [ ] Author management, source management
- [ ] Fact-check workflow, fiction notice controls
- [ ] Content calendar, bulk operations
- [ ] Preview, noindex/canonical controls
- [ ] Подготовка AI-контент-завода

---

### Таблица 1 — Рубрики

| Рубрика | Типы материалов | Цель | CTA | Риск |
| ------- | --------------- | ---- | --- | ---- |
| project-choice-stories | scenario-story | выбор проекта | project-selection | fiction |
| land-plot-stories | scenario-story, local | участок | land-checklist | fiction |
| estimate-and-budget-stories | scenario-story | бюджет | estimate-example | medium |
| bathhouse-stories | scenario-story | баня | bathhouse-selection | low |
| market-news | news, trend-review | тренды | consultation | source |
| weekly-digest | weekly-digest | подборка | consultation | low |
| mistakes-and-lessons | author-column | ошибки | mistakes-checklist | medium |

### Таблица 2 — Авторы

| Автор | Тип | Вымышленный | Где использовать | Маркировка |
| ----- | --- | ----------- | ---------------- | ---------- |
| Редакция СтройСтрой | brand-editorial | нет | news, digest | — |
| Антон Коробков | editorial-persona | да | смета, ошибки | disclaimer |
| Иван Самоделкин | editorial-persona | да | бытовые вопросы | disclaimer |
| Маруся Иркутская | editorial-persona | да | семейные сценарии | disclaimer |
| Ваня Мамонский | editorial-persona | да | локальные истории | disclaimer |
| Ирина Клубничная | editorial-persona | да | быт, терраса, баня | disclaimer |

### Таблица 3 — Типы материалов

| Тип | Структура | CTA | Lead magnet | Риск |
| --- | --------- | --- | ----------- | ---- |
| scenario-story | hook → situation → conflict → takeaways | по рубрике | по рубрике | fiction |
| fictionalized-story | fiction notice + story | по рубрике | по рубрике | high без notice |
| news | summary + source | consultation | mistakes-checklist | source |
| weekly-digest | 3–7 пунктов | consultation | mistakes-checklist | low |
| question-roundup | вопрос + разбор | consultation | — | low |

### Таблица 4 — Initial queue (выборка)

| Материал | Рубрика | Status | Indexing | До публикации |
| -------- | ------- | ------ | -------- | ------------- |
| kak-semya-vybirala-dom-150-m2 | project-choice | needs-human-review | noindex | контент + review |
| daydzhest-stroitelstva-nedeli | weekly-digest | needs-human-review | noindex | пункты недели |
| chto-izmenilos-v-zagorodnom-stroitelstve | market-news | needs-source | noindex | источник + fact-check |

### Таблица 5 — Риски

| Риск | Почему опасно | Как предотвращаем |
| ---- | ------------- | ----------------- |
| Фейковый кейс | обман пользователя | fiction notice, ethics rules |
| News без source | дезинформация | needs-source, noindex |
| Псевдоэксперт | ложное доверие | publicLabel + disclaimer |
| Thin content | SEO-штраф | quality score blockers |
| Кликбейт | отказы | teaser validation |

### Таблица 6 — Analytics

| Event | Где | Payload | Зачем |
| ----- | --- | ------- | ----- |
| editorial_article_viewed | tracker | slug, type, rubric, author | охват |
| editorial_cta_clicked | CTA | sourceCTA, position | CRO |
| editorial_lead_submitted | форма | leadMagnetId, UTM | CRM |

---

## Проверки

| Команда | Результат |
| ------- | --------- |
| `npm run build` | ✓ 341 страница, TypeScript OK |
| `npm run lint` | не запускался отдельно (build включает typecheck) |

Исправлено при сборке: тип `storyMeta` в `requiresFactCheck()` вызове page builder.

---

## Файлы Этапа 22

```
docs/stage-22-editorial-blog-system.md
src/types/editorial-content.ts
src/data/editorial-*.ts (8 файлов)
src/lib/editorial-content/*.ts (9 файлов)
src/components/editorial-content/*.tsx (14 компонентов)
src/app/blog/[slug]/page.tsx (обновлён)
src/app/dashboard/(admin)/content/editorial/page.tsx
src/components/dashboard/content/editorial-content-dashboard.tsx
```
