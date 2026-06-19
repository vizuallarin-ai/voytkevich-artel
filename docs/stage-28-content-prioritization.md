# Этап 28 — Приоритизация контента

Система принятия решений: семантика, спрос, интент, сложность, сезонность, лид-потенциал → score → P1–P5 → очередь → календарь / CMS / AI-завод.

**Не генерируем и не публикуем контент на этом этапе.** Создаём «мозг» приоритизации.

## 1. Что сделано

- Типы: `keyword-demand`, `semantic-clusters`, `content-prioritization`
- Правила scoring: веса, intent, commercial, local, seasonality, content difficulty
- Сервисы: priority, keyword demand, semantic clusters, score calculator, explainer, queue sorter, CSV importer
- Интеграции: CMS (23), calendar (27), AI factory (24)
- Cannibalization check, data source registry (без fake API)
- Dashboard `/dashboard/content/prioritization/*`
- API `/api/dashboard/content-prioritization/*`
- 11 analytics events

## 2. Связь с Этапами 18–27

| Этап | Связь |
|------|-------|
| 18 | Программируемые SEO-страницы — кандидаты в очередь |
| 19 | Таксономия / география — local demand scoring |
| 20 | Шаблоны programmatic pages — readiness + lead potential |
| 21 | Technical articles — content difficulty |
| 22 | Editorial — низкий commercial, editorial intent |
| 23 | CMS items — attach priority, recalculate |
| 24 | AI factory — selectNextAIContentBriefs по priority |
| 25 | Teaser/distribution — не в top без full article |
| 26 | Visual readiness влияет на readiness score |
| 27 | Calendar queue — P1/P2 раньше P4/P5 |

```text
семантика / спрос / интент / сложность / сезонность / лид
  → score → P1–P5 → очередь → календарь / CMS / AI-завод
```

## 3. Зачем SEO-монстру приоритизация

Тысячи возможных страниц → управляемая очередь. Сначала то, что даёт спрос, лиды и стратегический рост.

## 4. Heuristic mode vs data-driven mode

| Режим | Когда | Confidence |
|-------|-------|------------|
| **Heuristic** | Нет импортированной частотности | `low`, UI: `P1*` |
| **Data-driven** | CSV / GSC / Wordstat с реальными метриками | `medium` / `high` |

Правило: **не выдумывать** `searchVolume`, `keywordDifficulty`, позиции, GSC.

## 5–14. Модели и scoring

См. типы в `src/types/` и правила в `src/data/`. Калькулятор: `priority-score-calculator.ts`.

## 15–20. Queue, CSV, registry, integrations

- `queue-sorter.ts`, `csv-importer.ts`, `data-source-registry.ts`
- `cms-priority-integration.ts`, `calendar-priority-integration.ts`, `ai-factory-priority-integration.ts`

## 21–24. Dashboard routes

| Route | Назначение |
|-------|------------|
| `/dashboard/content/prioritization` | KPI, top P1, needs keyword data |
| `/dashboard/content/prioritization/keywords` | Keyword demand |
| `/dashboard/content/prioritization/clusters` | Semantic clusters |
| `/dashboard/content/prioritization/import` | CSV paste |
| `/dashboard/content/prioritization/queue` | Priority queue |

## 25–29. Analytics, UX, SEO safety, без данных / нельзя утверждать

См. таблицы ниже. Heuristic mode при отсутствии volume; нельзя писать «высокочастотный» без импорта.

## 30. Этап 29 — индексация (TODO)

Priority → sitemap; P1/P2 быстрее; noindex/draft исключены; canonical conflicts; cannibalization block; crawl budget.

## 31. Этап 30 — analytics (TODO)

Сравнение priority vs лиды/CTR/позиции; feedback loop весов.

---

### Таблица 1 — Score factors

| Score factor | Вес | Что означает | Риск |
| ------------ | --: | ------------ | ---- |
| searchDemand | 0.20 | Частотность / impressions | Fake volume |
| commercialIntent | 0.20 | Коммерческий интент | Переоценка editorial |
| leadPotential | 0.20 | Потенциал заявки | Без CTA — завышение |
| strategicValue | 0.12 | Стратегические кластеры | Субъективность |
| localDemand | 0.08 | География Иркутска | Локация без услуг |
| seasonality | 0.05 | Сезонный boost | Вне сезона — шум |
| readiness | 0.10 | CMS + SEO готовность | Draft как P1 |
| competition | 0.05 | KD / competition | Placeholder без API |
| contentDifficulty | −0.05 | Сложность производства | Блокирует не полностью |
| cannibalizationPenalty | −0.15 | Дубли / каннибализация | High risk в top |
| thinContentPenalty | −0.15 | Thin content risk | Публикация thin |

### Таблица 2 — Priority levels

| Priority | Score | Что делать |
| -------- | ----: | ---------- |
| P1 | 80–100 | Создать/доработать → calendar → publish |
| P2 | 60–79 | Вторая волна после P1 |
| P3 | 40–59 | Backlog |
| P4 | 20–39 | Низкий приоритет / нужны данные |
| P5 | 0–19 | Отложить / merge |

При `confidence: low` — **P1 heuristic***.

### Таблица 3 — Data sources

| Data source | Status | Metrics | Notes |
| ----------- | ------ | ------- | ----- |
| manual | active | volume, intent | Dashboard |
| csv-import | active | volume, GSC fields | Textarea MVP |
| yandex-wordstat | needs-api | searchVolume | TODO |
| google-search-console | needs-api | impressions, clicks | TODO OAuth |
| yandex-webmaster | needs-api | impressions | TODO |
| serpstat/ahrefs/semrush | future | volume, KD | CSV later |

### Таблица 4 — Missing data

| Missing data | Как показываем | Что делать |
| ------------ | -------------- | ---------- |
| searchVolume | «нет данных частотности» | CSV / Wordstat |
| keywordDifficulty | unknown | Import KD |
| GSC | hasGSCData: false | Connect GSC |

### Таблица 5 — Risks

| Risk | Влияние | Действие |
| ---- | ------- | -------- |
| Cannibalization high | −penalty | canonical / merge |
| Thin content high | −penalty | Доработать |
| Missing canonical | readiness ↓ | Задать URL |

### Таблица 6 — Analytics events

| Event | Где | Зачем |
| ----- | --- | ----- |
| priority_dashboard_viewed | Dashboard | Воронка |
| keyword_csv_import_* | Import | Качество данных |
| priority_recalculated | API | Операции |
| priority_queue_viewed | Queue | Использование |
| priority_item_sent_to_calendar | Queue | Pipeline |
| priority_item_sent_to_ai_factory | AI | AI queue |

---

## Проверки

| Команда | Результат |
|---------|-----------|
| `npm run build` | ✓ Success (~400 pages, TypeScript OK) |

Исправлено: `content-difficulty-rules.ts`, `priority-score-calculator.ts`, `CSVImportPanel.tsx`.
