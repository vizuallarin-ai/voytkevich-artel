# Этап 19 — Таксономия проектов, типоразмеров, категорий и географии

**Статус:** ✅ фундамент в коде  
**Сайт:** https://stroistroy.ru  
**Дата:** 2026-06-05  

> Связанные этапы: [Этап 18 — programmatic SEO platform](./stage-18-programmatic-seo-content-platform.md)

---

## 1. Что сделано на Этапе 19

Создана **управляемая таксономическая система** для будущих programmatic SEO-страниц проектов — без массовой публикации URL.

| Компонент | Файл |
|-----------|------|
| Типы | `src/types/project-taxonomy.ts` |
| Типы объектов | `src/data/project-object-types.ts` |
| Материалы | `src/data/project-materials.ts` |
| Размеры / площади | `src/data/project-size-taxonomy.ts` |
| Особенности | `src/data/project-feature-taxonomy.ts` |
| Поисковые интенты | `src/data/project-intent-taxonomy.ts` |
| Матрица комбинаций | `src/data/project-taxonomy-matrix.ts` |
| Правила страниц | `src/data/project-taxonomy-page-rules.ts` |
| Slug builder | `src/lib/taxonomy/taxonomy-slug-builder.ts` |
| Title/H1/meta | `src/lib/taxonomy/taxonomy-title-builder.ts` |
| Combination builder | `src/lib/taxonomy/taxonomy-combination-builder.ts` |
| Index rules | `src/lib/taxonomy/taxonomy-indexing-rules.ts` |
| Canonical rules | `src/lib/taxonomy/taxonomy-canonical-rules.ts` |
| Priority | `src/lib/taxonomy/taxonomy-priority.ts` |
| Validation | `src/lib/taxonomy/taxonomy-validation.ts` |
| Dashboard | `/dashboard/seo/taxonomy`, `/dashboard/seo/taxonomy/matrix` |

**Статистика кандидатов (на момент сборки):**

- Всего комбинаций: **103**
- Indexable (approved/published): **0** — намеренно, до семантики и контента
- Planned: 15 | Needs keyword data: 78 | Draft (L3): 10
- Уровни: L1 — 88, L2 — 5, L3 — 10

**Не сделано намеренно:** публикация страниц, AI-контент, импорт частотности, синхронизация с `programmatic-seo-initial-queue.ts`.

---

## 2. Зачем нужна таксономия

Programmatic SEO без таксономии превращается в «генератор мусорных URL». Этап 19 отвечает на вопрос:

> **Какие комбинации домов, бань, материалов, размеров, регионов и интентов имеют смысл как SEO-страницы, а какие — фильтры, noindex или draft?**

Каждая будущая страница получает: slug, URL, H1, title, description, status, indexing, priority, risks, requirements.

---

## 3. Связь с Этапом 18

| Этап 18 | Этап 19 |
|---------|---------|
| Типы programmatic страниц | Конкретные dimension values (объект, материал, размер…) |
| `irkutsk-region-taxonomy.ts` | Переиспользуется для geo-комбинаций |
| Index/noindex/canonical модель | Реализована в `taxonomy-indexing-rules.ts`, `taxonomy-canonical-rules.ts` |
| Initial queue (50 planned) | **Не синхронизирована** — TODO: merge после семантики |
| Dashboard SEO roadmap | Добавлены Taxonomy + Matrix |
| Thin content / cannibalization guards | Риски на каждой комбинации + validation |

---

## 4. Типы объектов

10 типов в `project-object-types.ts` (9 active + 1 future):

- **Primary programmatic:** `houses`, `bathhouses` — генерируют material/size/geo URL
- **Subtype category:** cottages, country-houses, dacha-houses, guest-houses, family-houses, permanent-living-houses — уникальный category slug, без дублирования houses URL
- **Future:** utility-buildings — не indexable

### Таблица 1 — Типы объектов

| Тип объекта | Примеры страниц | Приоритет | Индексация | Комментарий |
| ----------- | --------------- | --------- | ---------- | ----------- |
| Дома | `/proekty-domov/karkasnye-doma` | P1 | planned → review | Ядро каталога |
| Бани | `/proekty-ban/banya-3-na-3` | P1 | planned → review | Отдельные bath slugs |
| Коттеджи | `/proekty-domov/kottedzhi` | P2 | needs-keyword-data | Category-only |
| Загородные дома | `/proekty-domov/zagorodnye-doma` | P2 | needs-keyword-data | Не дублирует «дома» |
| Дачные дома | `/proekty-domov/dachnye-doma` | P2 | needs-keyword-data | Компактные проекты |
| Гостевые дома | `/proekty-domov/gostevye-doma` | P3 | needs-keyword-data | Узкая ниша |
| Дома для семьи | `/proekty-domov/doma-dlya-semi` | P2 | needs-keyword-data | Feature overlap → canonical review |
| Дома для ПМЖ | `/proekty-domov/doma-dlya-postoyannogo-prozhivaniya` | P2 | needs-keyword-data | Связь с catalog `doma-dlya-postoyannogo` |
| Дома под аренду | — | — | — | Не добавлены — нет подтверждённой услуги |
| Хозпостройки | — | P4 | future | status: future, не indexable |

---

## 5. Материалы и технологии

8 материалов (6 active + 2 future: sip, log).

Для бань используются **отдельные slugs** (`banya-iz-brusa`, `karkasnye-bani`) через `resolveMaterialSlug()`.

### Таблица 2 — Материалы

| Материал | Для каких объектов | SEO-потенциал | Риск | Нужна проверка |
| -------- | ------------------ | ------------- | ---- | -------------- |
| Каркас | дома, бани, коттеджи… | high | overlap с `/catalog/kategoriya/karkasnye` | canonical review |
| Брус | дома, бани | high | overlap с catalog «из бруса» | canonical review |
| Газобетон | дома, коттеджи | high | технический контент | technical review |
| Кирпич | дома, коттеджи | medium | мало проектов в каталоге | projects count |
| Блоки | дома, бани, дачи | medium | низкая уникальность | keyword data |
| СИП | дачи, гостевые | medium | **future** — услуга не подтверждена | заказчик |
| Бревно | дома, бани | low | **future** — нет кейсов | заказчик |
| Комбинированные | дома, коттеджи | low | informational | не mass index |

---

## 6. Типоразмеры

### Бани (dimensions)

3×3, 3×4, 4×4, 4×5, 4×6, 5×5, 5×6, 6×6, 6×8 — slug `banya-{w}-na-{l}`.

**P1 indexable candidate:** баня 3×3.

### Дома (dimensions)

6×8, 6×10, 7×8, 8×8, 8×10, 9×9, 9×10, 10×10, 10×12, 12×12 + отдельно 6×6.

**P1 indexable candidate:** дом 8×10.

### Таблица 3 — Типоразмеры (выборка)

| Типоразмер | Для чего подходит | Indexable | Priority | Комментарий |
| ---------- | ----------------- | --------- | -------- | ----------- |
| Баня 3×3 | bathhouses | candidate P1 | P1 | Hot commercial, planned |
| Баня 4×6 | bathhouses | no | P2 | needs-keyword-data |
| Дом 8×10 | houses | candidate P1 | P1 | Ядро типоразмеров |
| Дом 10×10 | houses | no | P2 | needs-keyword-data |
| Дом 6×6 | guest-houses | no | P3 | filter-first |

---

## 7. Площади

| ID | Диапазон | Priority | Catalog overlap |
|----|----------|----------|-----------------|
| area-50-80 | до 80 м² | P2 | — |
| area-80-100 | 80–100 м² | P2 | do-100-m2 |
| area-100-120 | 100–120 м² | **P1** | 100-150-m2 |
| area-120-150 | 120–150 м² | **P1** | 100-150-m2 |
| area-150-200 | 150–200 м² | P2 | — |
| area-200-plus | 200+ м² | P3 | — |

---

## 8. Этажность

| Slug | Title | Catalog overlap |
|------|-------|-----------------|
| odnoetazhnye-doma | Одноэтажные | odnoetazhnye |
| dvukhetazhnye-doma | Двухэтажные | dvukhetazhnye |
| mansardnye-doma | С мансардой | — (не путать с feature `mansard`) |

---

## 9. Комнаты и спальни

2–4 комнаты, 2–4 спальни — **filter-only** в combination builder (не генерируются как SEO URL).

---

## 10. Особенности проектов

19 features в `project-feature-taxonomy.ts`. Часть помечена `filterOnly: true` (узкий участок, уклон, дача, compact-layout).

SEO-candidates (needs-keyword-data): терраса, гараж, мансарда, второй свет, панорамные окна, сауна, семья с детьми, постоянное проживание.

---

## 11. География Иркутска и области

Переиспользуется `irkutsk-region-taxonomy.ts` (17 локаций + 2 шаблона SNT/КП).

### Таблица 5 — География

| География | Тип | Priority | Indexable by default | Notes |
| --------- | --- | -------- | -------------------- | ----- |
| Иркутск | city | P1 | ✅ | Ядро спроса |
| Иркутская область | region | P1 | ✅ | Широкий geo |
| Иркутский район | district | P2 | ❌ | needs-keyword-data |
| Ангарск | city | P2 | ❌ | needs-keyword-data |
| Шелехов | city | P2 | ❌ | needs-keyword-data |
| Маркова | settlement | P2 | ❌ | Пригород |
| Хомутово | settlement | P2 | ❌ | Пригород |
| Мамоны | settlement | P2 | ❌ | Кейсы в каталоге |
| Байкальский тракт | tract | P2 | ❌ | Загородный спрос |
| Братск, Усолье | city | P3 | ❌ | Дальняя логистика — review |
| СНТ / КП (шаблон) | template | P4 | ❌ | Только именованные |

---

## 12. Поисковые интенты

13 интентов в `project-intent-taxonomy.ts`.

### Таблица 6 — Интенты

| Интент | Funnel stage | CTA | Lead magnet | Page types |
| ------ | ------------ | --- | ----------- | ---------- |
| project | warm | Подобрать проект | budget-project-selection | category, size, feature |
| build | hot | Предварительный расчёт | estimate-example | location, combination |
| turnkey | hot | Строительство под ключ | estimate-example | category, location, size |
| price | warm | Рассчитать стоимость | estimate-example | size, material |
| cost | warm | Разбор стоимости | cost-review | material, category |
| order | hot | Заявка на расчёт | — | category, location |
| choose | cold | Помочь выбрать | budget-project-selection | material, combination |
| calculate | warm | Калькулятор | estimate-example | category |
| compare | cold | Сравнение технологий | — | material (info) |
| how-to | cold | Консультация | — | blog overlap |
| mistakes | cold | Разбор ошибок | — | blog overlap |
| example | warm | Примеры проектов | — | cases only if real |
| local | warm | Строительство в регионе | — | location |

---

## 13. Матрица допустимых комбинаций

Правила в `project-taxonomy-matrix.ts`:

| Уровень | Dimensions | Default status | Indexable |
|---------|------------|----------------|-----------|
| L1 | object, material, size, feature, region | planned / needs-keyword-data | ❌ до approval |
| L2 | object+size, object+material+size (P1) | needs-keyword-data | ❌ |
| L3 | object+material+region | draft | ❌ thin content risk |
| L4 | 4+ dimensions | filter-only / noindex | ❌ |

### Таблица 4 — Примеры комбинаций

| Комбинация | Пример URL | Статус | Почему |
| ---------- | ---------- | ------ | ------ |
| object + material | `/proekty-domov/karkasnye-doma` | planned | P1 commercial |
| object + size | `/proekty-ban/banya-3-na-3` | planned | P1 hot query |
| object + region | `/stroitelstvo-domov/irkutsk` | planned | P1 geo |
| material + region | `/proekty-domov/karkasnye-doma-v-irkutsk` | draft | L3 — needs review |
| object + material + size | `/proekty-domov/karkasnye-doma-8-na-10` | needs-keyword-data | L2 long-tail |
| 4 dimensions | filter params | filter-only | Слишком узко |
| rooms/bedrooms | catalog filter | filter-only | Нет отдельного URL |

---

## 14. SEO-страница vs фильтр

**Отдельная SEO-страница**, если:

- самостоятельный поисковый интент;
- коммерческий или информационный потенциал;
- уникальный intro + FAQ + CTA;
- есть проекты в каталоге;
- нет высокой каннибализации;
- status = `approved` после review.

**Filter-only**, если:

- узкий запрос без частотности;
- нет проектов;
- дублирует catalog category;
- rooms/bedrooms, узкий участок, уклон;
- L4 комбинации.

---

## 15. Index / noindex / canonical

**`taxonomy-indexing-rules.ts`:**

- `planned`, `needs-keyword-data`, `draft`, `candidate` → **noindex**
- `approved`, `published` → indexable + sitemap
- L3+ thin content → noindex
- region/size без validation → noindex

**`taxonomy-canonical-rules.ts`:**

- L3 geo на material → canonical на L1 material или L2 material+region parent
- overlap с `/catalog/kategoriya/*` → canonical на catalog slug
- Хомутово без отдельной страницы → canonical на область

---

## 16. Slug rules

`taxonomy-slug-builder.ts`:

- латиница, kebab-case;
- материалы домов: `karkasnye-doma`, `doma-iz-brusa`;
- материалы бань: `karkasnye-bani`, `banya-iz-brusa`;
- размеры: `dom-8-na-10`, `banya-3-na-3`;
- geo: `/stroitelstvo-domov/{region-slug}`;
- составные: `{material}-v-{region}`, `{material}-{size}`.

---

## 17. H1 / title / description

`taxonomy-title-builder.ts`:

- `buildTaxonomyH1()` — без переспама, регион только если есть в комбинации;
- `buildTaxonomySeoTitle()` — до 60 символов, суффикс «проекты и расчёт»;
- `buildTaxonomyDescription()` — польза, без обещания точной цены;
- `buildTaxonomyIntro()` — заготовка intro для шаблонов Этапа 20.

---

## 18. Приоритизация

`calculateTaxonomyCombinationPriority()` в `taxonomy-priority.ts`:

**P1:** Иркутск, область, каркас, брус, газобетон, баня 3×3, дом 8×10, 100–150 м².

**P2:** L2 комбинации, P2 geo, features с спросом.

**P3:** long-tail, локальные поселения.

**P4–P5:** informational, experimental.

`searchDemand: unknown` — частотность не выдумывается.

---

## 19. Риски каннибализации

### Таблица 7 — Риски

| Риск | Почему опасно | Как предотвращаем |
| ---- | ------------- | ----------------- |
| Catalog overlap | `/catalog/kategoriya/karkasnye` vs `/proekty-domov/karkasnye-doma` | canonical + `catalogCategorySlug` |
| Service pages | `/karkasnye-doma-pod-klyuch` vs material page | cannibalization detector (Этап 18) |
| Subtype duplication | cottages + houses → один URL | primary object types only |
| Geo stacking | material+region+size | L3 default draft/noindex |
| H1 duplicates | material+size без title rule | title builder + validation warnings |
| Thin L4 | «каркас 8×10 терраса Хомутово под ключ» | filter-only |

---

## 20. Валидация таксономии

`validateProjectTaxonomy()` проверяет:

- уникальность slug (objects, materials, sizes, features);
- уникальность URL комбинаций;
- indexable + needs-keyword-data = error;
- indexable без CTA = error;
- high duplicateRisk без canonical = warning.

**Результат сборки:** `valid: true`, 0 errors, 3 warnings (similar H1 на L2 material+size — исправляется в title builder Этапа 20).

---

## 21. Dashboard SEO Taxonomy

Реализовано:

- `/dashboard/seo/taxonomy` — обзор dimensions, stats, validation
- `/dashboard/seo/taxonomy/matrix` — таблица комбинаций (object, material, size, region, status, priority, indexable, canonical, risks)

Навигация добавлена в dashboard SEO section.

---

## 22. Что можно отдавать в Этап 20

- Типы и data-файлы таксономии;
- `buildTaxonomyCombinations()` — список кандидатов;
- slug/title/description builders;
- indexing/canonical/priority rules;
- validation pipeline;
- dashboard matrix для editorial workflow.

---

## 23. Что нельзя генерировать без семантики

- L2/L3 комбинации со status `needs-keyword-data`;
- geo P2/P3 без Wordstat/keys;
- features с `filterOnly: true`;
- materials `future` (sip, log);
- utility-buildings;
- отзывы/кейсы без реальных объектов.

---

## 24. Что требует проверки заказчиком

- [ ] Строите ли СИП-панели (`sip` → future)?
- [ ] Строите ли из бревна (`log` → future)?
- [ ] Хозпостройки как отдельная услуга (`utility-buildings`)?
- [ ] Приоритет geo: Ангарск, Шелехов, Байкальский тракт?
- [ ] Canonical: programmatic URL vs catalog category — какой главный?
- [ ] Партия P1 approved страниц (5–10 штук) для первого релиза

---

## 25. Что переходит в Этап 20

### TODO Этап 20

- [ ] Шаблон **category page**
- [ ] Шаблон **size page**
- [ ] Шаблон **material page**
- [ ] Шаблон **feature page**
- [ ] Шаблон **location page**
- [ ] Шаблон **combination page**
- [ ] Подключить карточки проектов из каталога
- [ ] Подключить фильтры каталога
- [ ] FAQ blocks
- [ ] CTA + lead magnets
- [ ] Related pages / internal linking
- [ ] Breadcrumbs
- [ ] Schema.org (CollectionPage / Service)
- [ ] Canonical / noindex meta
- [ ] Sitemap logic для approved combinations
- [ ] Merge с `programmatic-seo-initial-queue.ts`

---

## Проверки сборки

| Команда | Результат |
|---------|-----------|
| `npm run build` | ✅ OK (148 static pages, TypeScript clean) |
| `npm run lint` | ⚠️ 10 pre-existing errors (react-hooks), не связаны с Этапом 19 |
| `validateProjectTaxonomy()` | ✅ valid: true |
| `getTaxonomyCombinationStats()` | 103 combinations, 0 indexable |

**Исправлено в процессе Этапа 19:**

- Дубли URL (subtype objects на одном urlSegment)
- Bath material slugs (`banya-iz-brusa` vs `doma-iz-brusa`)
- Slug builder: составные комбинации material+region
- Duplicate size slug `dom-6-na-6`
- Feature/object slug conflict `permanent-living`
- Unused import в taxonomy-overview

**Не проверено:** runtime smoke dashboard auth (требует login).
