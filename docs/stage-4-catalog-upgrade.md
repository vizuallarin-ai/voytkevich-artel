# Этап 4 — Прокачка каталога проектов

Сайт: [voytkevich-artel.vercel.app](https://voytkevich-artel.vercel.app/)  
Дата: июнь 2026

---

## 1. Что изменено в каталоге

Страница `/catalog` превращена в полноценный SEO- и conversion-раздел:

- Hero с H1, подзаголовком, фактами и 2 CTA
- Блок «Быстрый выбор проекта» по группам (этажность, площадь, материал, бюджет, сценарий)
- Расширенные фильтры с URL-синхронизацией и активными чипами
- Сортировка (цена, площадь, срок, рекомендуемые)
- Усиленные карточки проектов с бейджами и микротекстом о цене
- Блок подбора проекта с формой (`source=catalog-picker`)
- SEO-текст, FAQ, перелинковка
- Mid-grid CTA «Получить подборку»

---

## 2. Категории

### SEO-страницы (`/catalog/kategoriya/[slug]`)

| Slug | H1 |
|------|-----|
| odnoetazhnye | Одноэтажные дома для строительства в Иркутске |
| dvukhetazhnye | Двухэтажные дома для строительства в Иркутске |
| do-100-m2 | Проекты домов до 100 м² |
| 100-150-m2 | Проекты домов 100–150 м² |
| 150-200-m2 | Проекты домов 150–200 м² |
| iz-brusa | Проекты домов из бруса |
| karkasnye | Проекты каркасных домов |
| iz-gazobetona | Проекты домов из газобетона |
| s-terrasoj | Проекты домов с террасой |
| s-garazhom | Проекты домов с гаражом |
| do-5-mln | Проекты домов до 5 млн ₽ |
| do-10-mln | Проекты домов до 10 млн ₽ |
| doma-dlya-semi | Проекты домов для семьи |
| doma-dlya-dachi | Проекты домов для дачи |
| doma-dlya-postoyannogo | Проекты домов для постоянного проживания |

### Только query-фильтры (без отдельной SEO-страницы)

| Категория | URL |
|-----------|-----|
| Более 200 м² | `/catalog?area=200+` |
| 5–8 млн ₽ | `/catalog?budget=5-8-mln` |
| 8–12 млн ₽ | `/catalog?budget=8-12-mln` |
| От 12 млн ₽ | `/catalog?budget=12+` |
| С кабинетом | `/catalog?feature=cabinet` |

**Кирпичные дома** — категория не создана: в текущих данных проектов нет материала «кирпич».

Пустые SEO-категории получают `robots: noindex` и честный empty state.

---

## 3. Фильтрация

**Файл:** `src/lib/filters.ts`

- Площадь (пресеты + areaMin/areaMax)
- Бюджет (пресеты + priceMin/priceMax)
- Этажность
- Материал (только реально присутствующие в каталоге)
- Назначение: семья, дача, постоянное, загородная
- Особенности: терраса, гараж, кабинет, баня
- Поиск по названию/описанию

**Shorthand query:**

- `?floors=1`
- `?material=brus|karkas|gazobeton`
- `?area=100-150`
- `?budget=5-8-mln`
- `?feature=terrace|garage|cabinet`
- `?purpose=family|dacha|permanent`

Активные фильтры отображаются чипами с возможностью сброса.

---

## 4. Сортировка

- Рекомендуемые (featured + цена) — по умолчанию
- Цена ↑ / ↓
- Площадь ↑ / ↓
- Срок строительства ↑ / ↓
- Сначала новые

Состояние в URL: `?sort=price-asc` и т.д.

---

## 5. SEO-категории

- Один data-файл: `src/data/catalog-categories.ts`
- Один динамический шаблон: `src/app/catalog/kategoriya/[slug]/page.tsx`
- Уникальные `title`, `description`, `intro` на категорию
- Связанные категории (`relatedCategories`)
- JSON-LD breadcrumbs + itemList
- Sitemap включает только непустые SEO-категории

Маршрут `/catalog/kategoriya/` сохранён по текущей архитектуре (не `/catalog/odnoetazhnye-doma`).

---

## 6. Metadata

**Главный каталог:**

- Title: «Проекты домов в Иркутске — каталог домов под строительство»
- Description: из `catalog-copy.ts`

**Категории:** формируются из `catalog-categories.ts` (`title`, `description`).

---

## 7. CTA

| Место | CTA |
|-------|-----|
| Hero | Подобрать проект · Рассчитать стоимость |
| После быстрых категорий | Подберём проект под участок |
| Карточка | Получить расчёт · Подробнее |
| Empty state | Подобрать проект вручную |
| После сетки | Получить подборку |
| SEO-блок | Обсудить строительство |
| FAQ | Подобрать проект под мой участок |
| Форма подбора | source=`catalog-picker` |

---

## 8. Компоненты

| Компонент | Назначение |
|-----------|------------|
| `catalog-hero.tsx` | Верхний блок каталога |
| `catalog-quick-categories.tsx` | Быстрый выбор по группам |
| `catalog-active-filters.tsx` | Чипы активных фильтров |
| `catalog-sort.tsx` | Сортировка |
| `catalog-picker-block.tsx` | Форма подбора |
| `catalog-seo-section.tsx` | SEO-текст + перелинковка |
| `catalog-faq.tsx` | FAQ каталога |
| `catalog-client.tsx` | Сетка, фильтры, empty state |
| `catalog-filter-sidebar.tsx` | Боковая панель фильтров |
| `project-card.tsx` | Усиленная карточка |

---

## 9. Data-файлы

| Файл | Изменения |
|------|-----------|
| `catalog-categories.ts` | 19 категорий, группы, related, queryHref |
| `catalog-copy.ts` | Hero, SEO, FAQ, empty state, metadata |
| `project-meta.ts` | purpose, hasCabinet, badges, shortDescription |
| `filters.ts` | Shorthand query, purpose, cabinet, duration sort |
| `home.ts` | Обновлены быстрые категории на главной |

---

## 10. Поля проектов

Добавлены optional:

```ts
purpose?: ProjectPurpose[]
shortDescription?: string
tags?: string[]
specs.hasCabinet?: boolean
```

Заполняются автоматически в `enrichProject()` при импорте из `projects-megaartel.ts`.

**Не добавлено (TODO):**

- `popularity` — нет достоверных данных
- `hasSecondLight` / `masterBedroom` — нет в scraped данных
- Кирпичные проекты — отсутствуют в каталоге

---

## 11. Данные для заполнения позже

- Реальные `purpose` и `hasCabinet` из планировок (сейчас эвристика)
- Популярность проектов для сортировки
- Кирпичные проекты — тогда добавить SEO-категорию
- Бюджетные диапазоны 5–8 / 8–12 — при появлении страниц или редиректа
- Контекст заявки из карточки (activeFilters) — подготовить в API leads

---

## 12. Маршруты

| Маршрут | Статус |
|---------|--------|
| `/catalog` | Обновлён |
| `/catalog/kategoriya/[slug]` | 15 SEO-страниц |
| `/catalog?{filters}` | Query-фильтрация |
| `/catalog/[slug]` | Без изменений (Этап 5) |

---

## 13. Мобильная версия

- Фильтры в выезжающей панели (кнопка «Фильтры»)
- Сортировка в toolbar
- Активные фильтры — чипами
- Карточки: 1 колонка на мобильном, 2 на sm, 3 на xl
- SEO-текст — компактные абзацы

---

## 14. Что переходит в Этап 5

- Карточка проекта как мини-лендинг
- Уникальные SEO-тексты на страницах проектов
- Расширенная галерея и кейсы
- Контекст заявки с фильтрами в CRM
- Сравнение проектов — UX-полировка

---

## Таблица

| Зона | Что сделано | Что осталось |
|------|-------------|--------------|
| Каталог | Hero, quick categories, SEO, FAQ, picker, metadata | A/B заголовков hero |
| Фильтры | 6 групп, URL, чипы, shorthand query, mobile panel | Мастер-спальня, второй свет |
| SEO-категории | 15 страниц, уникальные intro, noindex пустых | Кирпич, 200+ как SEO-страница |
| Карточки | Бейджи, shortDescription, 2 CTA, price note | Lead context в API |
| CTA | 7 точек конверсии + форма подбора | Модалка быстрой заявки |
| Данные проектов | purpose, hasCabinet, shortDescription | popularity, теги из CMS |
| Мобильная версия | Панель фильтров, адаптивная сетка | Sticky sort bar |

---

## Проверки

| Команда | Результат |
|---------|-----------|
| `npm run build` | ✅ 80 страниц |
| `npm run lint` | ⚠️ Прежние предупреждения (counter, lead-form hooks) — вне scope |
| `npm run typecheck` | Через `next build` — OK |
