# Этап 23 — CMS/админка для массового SEO-контента

## 1. Что сделано

- Единая модель `CMSContentItem` и статусная модель `ContentStatus` (18 статусов)
- Mock/dev `ContentRepository` — агрегирует programmatic + technical + editorial из data-файлов
- Workflow: transitions, validation, approval/publish guards
- Quality aggregator поверх programmatic/technical/editorial rules
- Indexing service, preview, audit log, bulk actions (без bulk publish)
- Permissions layer (admin/editor/seo/expert/viewer)
- Dashboard CMS: 14 routes под `/dashboard/content/*`
- UI components: table, badges, filters, item detail, preview

## 2. Связь с Этапами 18–22

| Этап | В CMS |
|------|-------|
| 18–20 | programmatic-page kind, indexing rules |
| 21 | technical-article kind, expert review |
| 22 | editorial/news/digest, fiction/source rules |

## 3. Зачем CMS перед AI-заводом

AI output → `ai-generated` → review → approved → publish. Auto-publish запрещён.

## 4–19. Архитектура

См. `src/lib/content-cms/*`, `src/types/content-*.ts`, `src/data/content-*.ts`.

### Routes

| Route | Назначение |
|-------|------------|
| `/dashboard/content` | KPI, quality, indexing, разделы |
| `/dashboard/content/items` | Единый список |
| `/dashboard/content/items/[id]` | Детальная карточка |
| `/dashboard/content/programmatic` | Programmatic SEO |
| `/dashboard/content/technical` | Technical articles |
| `/dashboard/content/editorial` | Editorial/news/digest |
| `/dashboard/content/authors` | Авторы |
| `/dashboard/content/rubrics` | Рубрики и кластеры |
| `/dashboard/content/queue` | Очередь публикаций |
| `/dashboard/content/review` | Review queue |
| `/dashboard/content/quality` | Quality issues |
| `/dashboard/content/indexing` | Index/noindex issues |
| `/dashboard/content/sources` | Sources/fact-check |
| `/dashboard/content/settings` | Publishing rules, bulk actions |
| `/dashboard/content/preview/[id]` | Preview (noindex) |

## 20. Repository

**Текущий:** mock adapter на data-файлах + in-memory patches.  
**TODO:** Supabase adapter при подключении БД.

## 21. Analytics events

`content_dashboard_viewed`, `content_item_opened`, `content_status_changed`, `content_sent_to_review`, `content_approved`, `content_rejected`, `content_quality_issue_viewed`, `content_bulk_action_requested`.

## 22–23. SEO safety

Draft/review/ai-generated не индексируются. Sitemap только для published+indexable. Bulk publish disabled.

## 24. После Этапа 23

- Просмотр и фильтрация всего контента
- Review workflow (read-only UI actions, server validation готова)
- Quality/indexing dashboards
- Preview перед публикацией

## 25. Без Этапа 24

- AI generation
- Auto-publish
- Полноценные формы редактирования
- Content calendar

## 26. Этап 24 TODO

- AI generation interface, prompts, safety rules
- Сохранение как `ai-generated`
- Обязательный review
- Trend Radar integration

---

### Таблица 1 — Разделы CMS

| Раздел | Route | Что показывает | Для чего |
|--------|-------|----------------|----------|
| Обзор | /dashboard/content | KPI | операционный контроль |
| Items | /dashboard/content/items | все материалы | единый список |
| Review | /dashboard/content/review | на проверке | workflow |

### Таблица 2 — Статусы (выборка)

| Статус | Индекс | Публикация |
|--------|--------|------------|
| draft | нет | нет |
| ai-generated | нет | нет |
| review | нет | нет |
| approved | по quality | после publish action |
| published | да* | да |

### Таблица 3 — Content kinds

| Kind | Источник | Проверки | Риск |
|------|----------|----------|------|
| programmatic-page | taxonomy queue | CTA, FAQ, projects | cannibalization |
| technical-article | stage 21 queue | disclaimer, expert | dangerous instructions |
| editorial-content | stage 22 queue | fiction notice | fake claims |
| news | editorial | source, fact-check | misinformation |

### Таблица 4 — Workflow

| Action | From | To | Условия |
|--------|------|-----|---------|
| approve | review | approved | no blockers |
| publish | approved | published | quality + metadata |
| set_noindex | * | noindex | manual |

### Таблица 5 — Риски

| Риск | CMS защита |
|------|------------|
| AI auto-publish | transition guards |
| Draft in index | indexing service |
| Bulk publish | disabled action |

---

## Проверки

| Команда | Результат |
|---------|-----------|
| `npm run build` | ✓ 352 страницы |

Repository: mock/dev only. Workflow actions в UI read-only до API routes (Этап 24).
