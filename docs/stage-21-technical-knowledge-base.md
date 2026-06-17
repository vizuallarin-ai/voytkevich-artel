# Этап 21 — Техническая база знаний / how-to статьи

## 1. Что сделано

- Таксономия: 18 кластеров технических тем
- 10 типов статей + 10 шаблонов с блоками и quality rules
- 50 тем в initial queue (planned/draft/needs-expert-review, noindex)
- 5 дисклеймеров, 3 редакционных автора
- Lib: builder, metadata, schema, FAQ, CTA, related links, quality score, lead context, analytics
- UI: `src/components/technical-content/*`
- Интеграция в `/blog/[slug]` без ломки существующих постов
- Dashboard: `/dashboard/content/technical`

## 2. Связь с Этапами 18–20

| Этап | Вклад |
|------|-------|
| 18 | Программируемая SEO-архитектура, teaser, UTM, thin content защита |
| 19 | Таксономия проектов, материалы, geo |
| 20 | Programmatic landing pages, project matcher, related links |
| 21 | Информационная ветка: how-to, гайды, чек-листы → CTA → CRM |

## 3–11. Архитектура

Технический контент закрывает informational/how-to интенты и ведёт в калькулятор, каталог, programmatic-страницы и лид-магниты.

Структура статьи: short answer → disclaimer → контент → ошибки → специалист → related → FAQ → CTA → форма.

## 12–17. CTA, связи, CRM, SEO

- CTA по кластеру/типу (смета, участок, материалы, ошибки, специалист)
- Related links: каталог, programmatic URL, калькулятор, соседние статьи
- `LeadContext.technical` + `sourceType: technical-article`
- Metadata/robots: noindex для draft/review/needs-expert-review
- Schema: Article, BreadcrumbList, FAQPage (без HowTo по умолчанию)

## 18–22. Quality, dashboard, analytics, UX

`calculateTechnicalContentQualityScore()` — blockers для публикации.

Events: `technical_article_viewed`, `technical_cta_clicked`, `technical_lead_magnet_clicked`, `technical_related_*`, `technical_faq_opened`.

## 23–26. Публикация

**Можно публиковать:** approved + quality good/strong + expert review (если требуется).

**Noindex:** planned, draft, ai-generated, needs-expert-review, poor quality.

## 27. Этап 22 — TODO

- [ ] Редакционные рубрики и авторы-персонажи
- [ ] Story/digest/news templates
- [ ] Маркировка вымышленных историй
- [ ] Фактчекинг
- [ ] Связь editorial ↔ technical ↔ projects
- [ ] Teaser-дистрибуция

---

### Таблица 1 — Кластеры (выборка)

| Кластер | Примеры статей | Интент | Priority | Эксперт |
| ------- | -------------- | ------ | -------- | ------- |
| roof-insulation | как утеплить кровлю | how-to | P1 | да |
| foundation-choice | как выбрать фундамент | how-to | P1 | да |
| land-plot-check | проверка участка | checklist | P1 | нет |
| estimate-reading | как читать смету | cost | P1 | нет |
| frame-house-technology | каркас или брус | comparison | P2 | да |

### Таблица 2 — Типы статей

| Тип | Структура | CTA | Lead magnet | Риск |
| --- | --------- | --- | ----------- | ---- |
| how-to | short answer + steps + mistakes | специалист | mistakes-checklist | средний |
| comparison | таблица + кому подходит | сравнение материалов | material-comparison | низкий |
| cost-explainer | факторы + дисклеймер сметы | пример сметы | estimate-example | низкий |
| mistakes | ошибки + риски | чек-лист ошибок | mistakes-checklist | средний |

### Таблица 3 — Дисклеймеры

| ID | Где | Зачем |
| -- | --- | ----- |
| general-technical | все | не заменяет инженерное решение |
| insulation | утепление | пирог/толщина под проект |
| foundation | фундамент | не заменяет расчёт |
| estimate | смета | не финальная цена |
| regulatory | договор/нормы | не юрконсультация |

### Таблица 4 — Initial queue (все noindex)

| Статус | Кол-во | До публикации |
| ------ | ------ | ------------- |
| needs-expert-review | ~15 | эксперт + контент |
| planned | ~30 | keyword data + текст |
| draft | 2 | полный текст + review |

### Таблица 5 — CTA → CRM

| CTA | Темы | CRM |
| --- | ---- | --- |
| Пример сметы | смета, стоимость | articleSlug, clusterId, CTA |
| Чек-лист участка | участок | + leadMagnetId |
| Сравнение материалов | материалы | + related categories |

### Таблица 6 — Риски

| Риск | Опасно | Предотвращение |
| ---- | ------ | -------------- |
| DIY без специалиста | травмы, переделки | disclaimer + when-to-call-expert |
| Fake нормы | санкции | запрет СНиП/ГОСТ в тексте |
| AI без review | thin content | status + quality blockers |
| Fake эксперт | доверие | editorial-persona маркировка |

---

## Проверки

- `npm run build` — запускается после реализации
- `npm run lint` — на файлах этапа 21
- `eslint src/lib/technical-content src/components/technical-content`

## Файловая структура

```
src/types/technical-content.ts
src/data/technical-*.ts
src/lib/technical-content/
src/components/technical-content/
src/app/dashboard/(admin)/content/technical/
docs/stage-21-technical-knowledge-base.md
```
