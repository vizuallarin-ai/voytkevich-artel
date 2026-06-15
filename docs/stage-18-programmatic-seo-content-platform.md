# Этап 18 — Программируемая SEO-архитектура под массовый контент

**Статус:** ✅ фундамент в коде  
**Сайт:** https://stroistroy.ru  
**Дата:** 2026-06-05  

> **Примечание:** Production launch на VPS выполнен отдельно — см. [stage-infrastructure-vps-production-launch.md](./stage-infrastructure-vps-production-launch.md).

---

## 1. Что сделано на Этапе 18

Создан **архитектурный фундамент** programmatic SEO без массовой публикации страниц:

| Компонент | Файл |
|-----------|------|
| Типы | `src/types/programmatic-seo.ts` |
| Разделы контента | `src/data/programmatic-seo-sections.ts` |
| Типы SEO-страниц | `src/data/seo-page-types.ts` |
| География | `src/data/irkutsk-region-taxonomy.ts` |
| Модель приоритетов | `src/data/seo-priority-model.ts` |
| Внешние площадки | `src/data/external-content-platforms.ts` |
| Initial queue (50) | `src/data/programmatic-seo-initial-queue.ts` |
| Page builder | `src/lib/seo/programmatic-page-builder.ts` |
| Publishing priority | `src/lib/seo/publishing-priority.ts` |
| Index rules | `src/lib/seo/indexing-rules.ts` |
| Quality rules | `src/lib/seo/content-quality-rules.ts` |
| Cannibalization | `src/lib/seo/cannibalization-detector.ts` |
| Teaser builder | `src/lib/content-distribution/teaser-builder.ts` |
| UTM builder | `src/lib/content-distribution/utm-builder.ts` |
| CRM UI | `/dashboard/seo`, `/dashboard/seo/roadmap` |

**Не сделано намеренно:** CMS, автопостинг, AI-генерация, тысячи URL, image generation.

---

## 2. Новый запрос заказчика

Три направления SEO-контента + внешняя дистрибуция teaser-форматов:

1. **Проекты** — дома, бани, типоразмеры, материалы, география.
2. **Техническая база** — how-to, гиды, сравнения.
3. **Редакционный блог** — истории, дайджесты, новости.

Полная статья живёт на сайте. Внешние площадки получают **teaser + UTM → полная статья**.

---

## 3. Почему нельзя создать 15 000 страниц сразу

- Thin content и SEO-мусор → фильтры поисковиков.
- Каннибализация с существующими service/blog/catalog URL.
- Нет keyword validation → выдуманная «частотность».
- Нет CMS/review pipeline → некontrolируемая публикация.
- Риск fake cases/reviews/experts.

**Правило:** лучше 300 сильных indexable страниц, чем 15 000 слабых.

---

## 4. Конкурентная логика (кратко)

| Тип конкурента | Сильная сторона | Наш ответ |
|----------------|-----------------|-----------|
| Агрегаторы (Domclick и др.) | Объём проектов, фильтры | Каталог + programmatic project/size pages с review |
| Локальные компании | Доверие, кейсы, под ключ | Кейсы, карта, CRM, локальные landing после validation |
| SEO-сетки | Много посадочных | Programmatic platform с noindex по умолчанию |

---

## 5. География

`src/data/irkutsk-region-taxonomy.ts` — 17 локаций. P1/P2 — потенциал index после review. P3/P4 + СНТ — `needsKeywordValidation: true`, noindex by default.

---

## 6–8. Три направления + роль полной статьи + teaser

- **Сайт** — canonical, полный контент, FAQ, CTA, CRM attribution.
- **Teaser** — hook + open loop + UTM link, без полного дубля.

---

## 9. Площадки

См. `external-content-platforms.ts`. Adapter status: active | manual | needs-api | future.

---

## 10. UTM-логика

```
utm_source = platformId
utm_medium = content_teaser
utm_campaign = campaignId
utm_content = contentItemId
utm_term = clusterId
```

Функция: `buildContentUTMUrl()` в `utm-builder.ts`.

---

## 11–13. Типы страниц, регионы, приоритеты

- 12 page types в `seo-page-types.ts`
- 7 content sections в `programmatic-seo-sections.ts`
- Priority P1–P5 через `calculatePublishingPriority()` — **без выдуманного searchVolume**

---

## 14–17. Quality, index, cannibalization, thin content

- `calculateContentQualityScore()` — poor | acceptable | good | strong
- `determineIndexingStatus()` — index только approved/published + quality gate
- `detectCannibalizationRisk()` — keyword/slug/H1 overlap
- Planned/draft/needs-keyword-data → **always noindex**

---

## 18. Редакционные персонажи

Тип `EditorialAuthor` заложен. Editorial stories помечаются `isFictionalAuthor`, `requiresDisclaimer`. Не выдавать сценарии за verified кейсы.

---

## 19. Initial queue

50 страниц в `programmatic-seo-initial-queue.ts`. Все **planned / needs-keyword-data / noindex**.

---

## 20–21. Что публиковать первым / что нельзя без данных

**Первым (после Этапа 19–20):** P1 project-category, size pages с привязкой к каталогу, technical how-to с экспертным review.

**Нельзя без данных:** локации P3/P4, editorial как real case, regulation без источника, keyword без validation.

---

## 22–26. Что требует следующих этапов

| Нужно | Этап |
|-------|------|
| Шаблоны programmatic pages | 20 |
| CMS mass content | 23 |
| AI content factory | 24 |
| Autodistribution | 25 |
| Image generation | 26 |
| Content calendar | 27 |
| Semantics/frequency import | 28 |
| Sitemap automation | 29 |
| SEO dashboard analytics | 30 |

---

## 27. Дорожная карта (после 17)

| Этап | Название | Главный результат |
|------|----------|-------------------|
| 18 | Programmatic SEO architecture | ✅ Типы, queue, rules, CRM overview |
| 19 | Taxonomy projects/sizes/geo | Категории, типоразмеры, geo bindings |
| 20 | Programmatic page templates | Рендер SEO-страниц |
| 21 | Technical knowledge base | How-to pipeline |
| 22 | Editorial blog & personas | Authors, stories |
| 23 | CMS for mass content | Review workflow |
| 24 | AI content factory | Draft generation |
| 25 | External distribution | Teaser autopost |
| 26 | Image generation | Covers, character |
| 27 | Content calendar | Scheduling |
| 28 | Semantic prioritization | Wordstat import |
| 29 | Indexation & sitemap | Crawl budget |
| 30 | Content analytics | SEO dashboard |
| 31 | CRO/A/B | Conversion tests |
| 32+ | KP, client cabinet, PM… | См. промпт заказчика |

---

## Таблица 1 — Разделы

| Раздел | Тип контента | Цель | Риск | До публикации |
|--------|--------------|------|------|---------------|
| projects | Коммерческие landing | Лиды, каталог | Каннибализация с service | Review + keyword |
| technical | How-to, guides | Trust, SEO | Thin / unsafe claims | Disclaimer + expert |
| blog | Editorial | Engagement | Fake stories | Persona label |
| news | Digest | Traffic | Low uniqueness | Editorial review |
| regulations | Normative | Trust | Legal | Source + disclaimer |
| comparisons | Compare | Choice | Generic content | Unique table |
| faq | FAQ | Long-tail | Duplicate FAQ | Cluster map |

---

## Таблица 2 — PageTypes (sample)

| PageType | Пример URL | Интент | Индексация | Требования |
|----------|------------|--------|------------|------------|
| project-category | /proekty-domov/karkasnye-doma | commercial | noindex until approved | FAQ, CTA, projects |
| project-size-page | /proekty-ban/banya-3-na-3 | commercial | noindex until approved | catalog match |
| project-location-page | /stroitelstvo-domov/mamony | local | keyword validation | unique local block |
| technical-how-to | /blog/kak-uteplit-krovlyu | informational | review + disclaimer | FAQ, CTA |
| editorial-story | /blog/kak-my-vybirali-proekt-doma | editorial | fictional label | disclaimer |

---

## Таблица 3 — Initial queue (sample)

| Страница | Тип | Кластер | Priority | Status | Комментарий |
|----------|-----|---------|----------|--------|-------------|
| Каркасные дома | project-category | frame-houses | P1 | planned | Hot commercial |
| баня 3×3 | project-size-page | banya-size | P2 | planned | Size landing |
| Мamony | project-location-page | local-mamony | P3 | needs-keyword-data | Geo validation |
| Как утеплить кровлю | technical-how-to | technical-roof | P4 | planned | Disclaimer |

Полный список: `/dashboard/seo/roadmap`.

---

## Таблица 4 — Площадки

| Площадка | Формат | Auto | API | Публикуем | CTA |
|----------|--------|------|-----|-----------|-----|
| site-full-article | Full | yes | yes | Полная статья | On-site |
| telegram | Teaser | no | manual | Hook + link | Read more |
| dzen | Teaser | no | manual | Short | Link to site |
| n8n | Orchestration | yes | needs-api | Teaser batch | UTM |

---

## Таблица 5 — Teaser styles

| Style | Где | Пример hook | Риск |
|-------|-----|-------------|------|
| mistake-hook | Telegram, Dzen | «Ошибка при выборе…» | Overpromise |
| cost-hook | VC, email | «Бюджет на бумаге…» | Fake price |
| local-hook | VK, OK | «Участок в области…» | Wrong geo |
| story-hook | TenChat | «Типичная ситуация…» | Fake case |

---

## Таблица 6 — Риски

| Риск | Почему опасно | Как предотвращаем |
|------|---------------|-------------------|
| Thin content | Filter | minWords, quality score |
| Cannibalization | Traffic split | detector + canonical |
| Fake reviews | Trust loss | no fake cases in queue |
| Full article syndication | Duplicate | teaser-only rule |
| Mass noindex leak | Index bloat | status + indexing rules |

---

## 23. Проверки

```bash
npm run build   # ✅ passed (2026-06-05)
npm run lint    # ⚠️ 10 errors / 14 warnings — существующие issues в других модулях; в stage-18 файлах исправлен unused `platform` в teaser-builder
node scripts/generate-initial-queue.mjs  # регенерация initial queue из scripts/programmatic-seo-initial-queue.data.mjs
```

TypeScript strict — все новые модули типизированы. Initial queue (50 страниц) хранится в `scripts/programmatic-seo-initial-queue.data.mjs` и генерируется в `.ts` для корректной UTF-8 кириллицы на Windows.

**Исправлено при финализации:** кодировка UTF-8 в queue, поле `rooms` в `QueuePageInput`, build TypeScript.

---

## 24. Что переходит в Этап 19

- Binding taxonomy к каталогу (categories, sizes, materials)
- Geo pages template + overlap check с service-pages
- Import keyword data (без выдуманных частотностей)
- First approved programmatic pages (limited batch)
