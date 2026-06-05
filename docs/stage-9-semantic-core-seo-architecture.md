# Этап 9 — Семантическое ядро и SEO-архитектура

Дата: 2026-06-05  
Сайт: https://voytkevich-artel.vercel.app/

## 1. Что сделано

На Этапе 9 создана **системная SEO-архитектура** без массовой генерации контента:

- 20 семантических кластеров в `src/data/seo-clusters.ts`
- Карта внутренней перелинковки и анкор-лист в `src/data/internal-linking-map.ts`
- Контентная дорожная карта из **60 материалов** (3 очереди) в `src/data/content-roadmap.ts`
- Типы в `src/types/seo-architecture.ts`
- Настоящий документ с картой страниц, приоритетами, чек-листами и TODO для Этапа 10

**Важно:** частотности Wordstat/Serpstat не использовались — приоритеты основаны на бизнес-логике, текущей структуре сайта и коммерческом потенциале.

Предыдущие отчёты этапов 1–8 найдены в `/docs/stage-*.md`.

---

## 2. Краткое резюме SEO-архитектуры

Сайт строится как **воронка поискового спроса**:

```
Cold (блог, FAQ, сравнения, ошибки)
  → Warm (категории, материалы, планировщик, смета)
    → Hot (коммерческие страницы, калькулятор, карточки проектов)
      → Заявка / CRM
```

Три слоя контента:

| Слой | Тип | Примеры |
|------|-----|---------|
| Commercial | service, category, project | `/stroitelstvo-domov-pod-klyuch-irkutsk`, `/catalog/kategoriya/iz-brusa` |
| Tools | calculator, planner | `/calculator`, `/planirovka` |
| Informational | blog, faq, process | `/blog/oshibki-pri-stroitelstve`, `/faq` |

---

## 3. Data-файлы (внедрено в код)

| Файл | Назначение |
|------|------------|
| `src/types/seo-architecture.ts` | Типы кластеров, roadmap, перелинковки |
| `src/data/seo-clusters.ts` | 20 SEO-кластеров |
| `src/data/internal-linking-map.ts` | Правила перелинковки, анкоры, каннибализация, лид-магниты |
| `src/data/content-roadmap.ts` | 60 материалов + `sitePageMap` |

Data-файлы **не подключены к UI** на этом этапе — готовы для блога, админки, автолинковки на Этапе 10+.

---

## 4. Таблица 1 — Кластеры

| Кластер | Основная страница | Интент | Приоритет | CTA | Статус |
|---------|-------------------|--------|-----------|-----|--------|
| turnkey | `/stroitelstvo-domov-pod-klyuch-irkutsk` | commercial, local | high | Рассчитать стоимость | created |
| cost | `/smeta-na-stroitelstvo-doma` | commercial, informational | high | Предварительный расчёт | needs-expansion |
| materials | `/stroitelstvo-domov-iz-brusa` (+ каркас, газобетон) | commercial, comparison | high | Рассчитать по материалу | created |
| area | `/catalog/kategoriya/100-150-m2` | commercial | high | Проекты по площади | exists |
| floors | `/odnoetazhnye-doma-pod-klyuch` | commercial, comparison | high | Подобрать по этажности | created |
| projects | `/catalog` | commercial, transactional | high | Подобрать проект | exists |
| planning | `/planirovka` | informational, commercial | medium | Собрать планировку | exists |
| foundation | `/blog/fundament-pod-dom-v-sibiri` | informational | high | Уточнить фундамент | needs-expansion |
| land | `/stroitelstvo-domov-v-irkutskoy-oblasti` | informational, commercial | high | Проверить участок | needs-expansion |
| engineering | `/smeta-na-stroitelstvo-doma` (hub) | informational | medium | Уточнить инженерию | future |
| estimate | `/smeta-na-stroitelstvo-doma` | commercial | high | Получить смету | created |
| mortgage | `/stroitelstvo-doma-v-ipoteku` | commercial | medium | Обсудить ипотеку | created |
| contract | `/process` | informational | medium | Обсудить строительство | exists |
| mistakes | `/blog/oshibki-pri-stroitelstve` | informational | high | Разобрать случай | needs-expansion |
| comparisons | `/blog/sravnenie-tehnologij` | comparison | medium | Сравнить варианты | needs-expansion |
| geo | `/stroitelstvo-domov-v-irkutskoy-oblasti` | local | medium | Рассчитать на участке | created |
| cases | `/cases` (future) | commercial | high | Хочу похожий дом | future-after-cases |
| faq | `/faq` | informational | medium | Консультация | exists |
| calculator | `/calculator` | transactional | high | Предварительный расчёт | exists |
| design | `/proektirovanie-domov` | commercial | medium | Обсудить проект | created |

---

## 5. Таблица 2 — Карта ключевых URL

| URL | Тип | Кластер | Статус | Приоритет | Что нужно сделать |
|-----|-----|---------|--------|-----------|-------------------|
| `/` | home | turnkey | exists | high | Усилить ссылки на commercial + calculator |
| `/stroitelstvo-domov-pod-klyuch-irkutsk` | service | turnkey | created | high | Мониторинг позиций, A/B CTA |
| `/smeta-na-stroitelstvo-doma` | service | estimate | created | high | — |
| `/calculator` | calculator | calculator | exists | high | Budget query param (TODO из этапа 8) |
| `/catalog` | catalog | projects | exists | high | — |
| `/catalog/kategoriya/*` | category | projects/area/materials | exists | high | Пустые категории → noindex (уже есть) |
| `/catalog/[slug]` | project | projects | exists | high | — |
| `/planirovka` | planner | planning | exists | medium | — |
| `/blog/*` (7 статей) | article | mixed | published | medium | Расширить перелинковку на Этапе 10 |
| `/cases` | case | cases | future-after-cases | high | Создать после реальных объектов |
| `/stroitelstvo-domov-v-angarske` | service | geo | avoid | low | Только с кейсами и данными |

**Фактические URL категорий:** `/catalog/kategoriya/{slug}` (не `/catalog/odnoetazhnye-doma`).

---

## 6. Таблица 3 — Контентная дорожная карта (сводка)

| Очередь | Кол-во | Фокус | Статус |
|---------|--------|-------|--------|
| 1 | 15 | Коммерческие + hot intent | 6 exists/published, 9 planned |
| 2 | 20 | Сравнения, инженерия, договор | 2 exists/published, 18 planned |
| 3 | 25 | Углубление, география, кейсы | 22 planned, 3 future-after-cases |

**Всего в roadmap:** 60 материалов (`contentRoadmap`).

### Очередь 1 — первые 15 (публикация в первую очередь)

1. Сколько стоит построить дом в Иркутске — **planned**
2. Смета (service) — **exists**
3. Дом до 10 млн — **exists**
4. Как выбрать проект — **published**
5. Одноэтажный или двухэтажный — **planned**
6. Сравнение материалов — **published**
7. Какой фундамент — **planned**
8. Что проверить на участке — **planned**
9. Ошибки при строительстве — **published**
10. Как выбрать подрядчика — **planned**
11. Что входит в под ключ (service) — **exists**
12. Как читать смету — **planned**
13. Планировка для семьи — **planned**
14. Ипотека (service + blog) — **exists / published**
15. Удалённый контроль — **planned**

---

## 7. Таблица 4 — Риски каннибализации

| Риск | Основная страница | Поддерживающие | Решение |
|------|-------------------|----------------|---------|
| Под ключ Иркутск | `/stroitelstvo-domov-pod-klyuch-irkutsk` | `/`, `/about` | Главная — бренд; commercial — primary target |
| Иркутск vs область | `/stroitelstvo-domov-v-irkutskoy-oblasti` | `/stroitelstvo-domov-pod-klyuch-irkutsk` | Разный intent: город vs логистика |
| Материал service vs category | `/stroitelstvo-domov-iz-brusa` | `/catalog/kategoriya/iz-brusa` | Service = услуга, category = проекты |
| Одно/двухэтажные | service pages | catalog categories | Разные H1, title, блоки |
| Смета vs калькулятор | `/smeta-na-stroitelstvo-doma` | `/calculator` | Trust vs tool |

Полный список: `cannibalizationRisks` в `internal-linking-map.ts`.

---

## 8. Правила внутренней перелинковки

См. `internalLinkingRules` в `src/data/internal-linking-map.ts`.

**Кратко:**

- **Главная** → catalog, calculator, planner, turnkey service, smeta
- **Service pages** → catalog categories, calculator, planner, related services, blog
- **Categories** → projects, calculator, service, blog
- **Projects** → categories, similar projects, calculator, lead form
- **Blog** → service (same cluster), calculator, catalog, 2–4 related articles
- **Calculator** → catalog, smeta, turnkey, projects
- **Planner** → calculator, design, catalog

**Правило анкоров:** чередовать формулировки из `anchorGroups`, не повторять один anchor >2 раз на странице.

---

## 9. Conversion paths по кластерам

| Кластер | Path |
|---------|------|
| cost | Статья → калькулятор → форма → CRM |
| materials | Service → категория → проект → расчёт |
| planning | Планировщик → калькулятор → заявка |
| land | Статья → «проверить участок» → консультация |
| estimate | Smeta page → форма сметы |
| mortgage | Service → проект → консультация (без обещаний банка) |
| mistakes | Статья → чек-лист / консультация |
| cases | Кейс → похожий проект → «хочу похожий дом» |

---

## 10. Лид-магниты

См. `leadMagnetsByCluster` в `internal-linking-map.ts`.

Примеры: чек-лист участка, чек-лист ошибок, подборка под бюджет, разбор планировки, список вводных для ипотеки.

---

## 11. Шаблоны будущих статей

### Стоимость
H1 → короткий ответ → факторы цены → что входит/не входит → предварительный расчёт → CTA калькулятор → FAQ → проекты → форма

### Сравнение
H1 → вывод → вариант A / B → таблица → цена и эксплуатация → риски → Иркутск → CTA → FAQ

### Ошибки
H1 → почему важно → список ошибок → как избежать → чек-лист → CTA → FAQ

### Участок
H1 → что проверить → коммуникации → подъезд → уклон → геология → посадка → ошибки → CTA → FAQ

### Кейс
Задача → участок → проект → материал → этапы → сложности → решение → фото → результат → отзыв (если есть) → CTA

---

## 12. Правила качества контента

1. Один основной интент на страницу
2. Каждая страница ведёт к действию (расчёт, каталог, заявка)
3. Без thin content и дублей
4. «Предварительный расчёт», не фиксированная цена
5. Региональность: Иркутск / область
6. Таблицы, списки, FAQ, внутренние ссылки
7. Блог — часть воронки, не отдельный журнал
8. Ипотека и цены — осторожные формулировки
9. Кейсы и локальные страницы — только с реальными данными

---

## 13. Technical SEO checklist

| Пункт | Статус | Примечание |
|-------|--------|------------|
| sitemap.xml | ✅ | Главная, catalog, calculator, planner, process, about, blog, faq, services, categories, projects |
| robots.txt | ✅ | Allow /, disallow /api/ |
| canonical | ✅ | `pageMetadata()` |
| metadata title/description | ✅ | На основных страницах |
| Open Graph | ✅ | Через `pageMetadata` |
| Один H1 | ✅ | Шаблоны service/catalog |
| Breadcrumbs | ✅ | Компонент + JSON-LD |
| JSON-LD | ✅ | Organization, Breadcrumb, FAQ, Service, Product (projects) |
| noindex пустых категорий | ✅ | `catalog/kategoriya/[slug]` |
| Alt изображений | ⚠️ | Есть на project cards; проверить блог |
| Core Web Vitals | ⚠️ | Ручная проверка Lighthouse |
| Битые ссылки | ⚠️ | Периодический crawl |
| Article schema для блога | ❌ | TODO Этап 10 |
| Blog categories | ❌ | TODO Этап 10 |
| /cases в sitemap | ❌ | Страница не создана |

---

## 14. Sitemap / robots / noindex

**Sitemap включает:** static, 11 service pages, categories (non-empty), projects, blog posts.

**Не включает:** /api/, /privacy (низкий приоритет — можно добавить), /cases (ещё нет).

**Noindex использовать для:**
- Пустых категорий каталога (реализовано)
- Черновиков блога
- Будущих кейсов без контента
- Локальных страниц без данных

---

## 15. URL-архитектура (фактическая)

```
/                                    — главная
/stroitelstvo-domov-pod-klyuch-irkutsk — commercial
/catalog                             — каталог
/catalog/kategoriya/{slug}           — категории
/catalog/{project-slug}              — проекты
/calculator, /planirovka             — инструменты
/blog/{slug}                         — статьи
/cases/{slug}                        — будущие кейсы
/process, /about, /faq               — trust
```

Кириллица в URL не используется. Дубли service vs category разведены по intent.

---

## 16. Приоритизация развития

### Priority HIGH (развивать первым)
- Commercial services (этап 8) ✅
- Calculator, catalog, smeta
- Material / floors categories
- Cost + mistakes + land + foundation articles (очередь 1)
- Cases (когда есть данные)

### Priority MEDIUM
- Ипотека, инженерия, сравнения, договор, планировки
- Blog expansion queue 2

### Priority LOW / AVOID
- Локальные страницы без кейсов (Ангарск, Шелехов…)
- Узкие комбинации «137 м² + терраса + брус»
- Страницы без уникального контента

---

## 17. Что внедрено в код

- `src/types/seo-architecture.ts`
- `src/data/seo-clusters.ts` — 20 кластеров
- `src/data/internal-linking-map.ts` — rules, anchors, cannibalization, lead magnets
- `src/data/content-roadmap.ts` — 60 items, sitePageMap, helpers

**Не менялось:** маршруты, UI, sitemap (уже актуален после этапа 8).

---

## 18. Ручная проверка SEO-специалистом

- Валидация кластеров по реальному Wordstat/Serpstat
- Приоритизация по фактическому спросу
- Crawl сайта на битые ссылки
- Lighthouse / CWV
- Проверка SERP по primary pages
- Решение о локальных landing (после кейсов)

---

## 19. Этап 10 — TODO

- Структура блога: категории, `/blog/kategoriya/[slug]`
- Шаблон SEO-статьи с CTA, related articles, related projects, FAQ
- Article schema + author block
- Первые 10–15 статей из `contentRoadmap` queue 1
- Лид-магниты в статьях
- Analytics по CTA в блоге
- Автоперелинковка из `internalLinkingRules` (optional)
- Раздел `/cases` при наличии данных
- Article schema для существующих 7 постов

---

## 20. Проверки

| Команда | Результат |
|---------|-----------|
| `npm run build` | ✅ 91 страница, TypeScript OK |
| `npm run lint` | ⚠️ legacy warnings в других файлах; новые data-файлы без ошибок |

---

*Этап 9 завершён. Сайт получил SEO-архитектуру для системного развития, а не хаотичный список статей.*
