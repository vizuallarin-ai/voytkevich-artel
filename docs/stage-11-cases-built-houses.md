# Этап 11 — Кейсы построенных домов

Дата: 2026-06-05  
Сайт: https://voytkevich-artel.vercel.app/

Предыдущие этапы: документы `stage-1` … `stage-10` найдены в `/docs`.

---

## 1. Что сделано на Этапе 11

- Создана **доказательная система кейсов** — не галерея, а разбор задачи → вводных → решений → результата.
- Добавлена **data-модель** `CaseItem` и категории кейсов с фильтрами.
- Реализован раздел **`/cases`** с честным empty state (опубликованных кейсов пока нет).
- Реализована страница кейса **`/cases/[caseSlug]`** с полным шаблоном и noindex для черновиков.
- Реализованы страницы категорий **`/cases/category/[categorySlug]`** с `noindexIfEmpty`.
- Добавлены **2 внутренние заготовки** (`draft` / `needs-data`) — не показываются в публичном списке.
- Подключены **фильтры**, CTA «Хочу похожий дом», FAQ, SEO-текст, schema (FAQPage, Article, BreadcrumbList).
- Интеграция с каталогом, коммерческими страницами и блогом через `RelatedCases` (блоки скрыты, пока нет published-кейсов).
- Обновлены **header**, **footer**, **главная**, **sitemap**.

---

## 2. Роль кейсов в лидогенерации

Кейсы закрывают главный страх: «А вы реально строите?»

Воронка:

`поиск / доверие → кейс (задача + сложности + результат) → похожий проект / расчёт → заявка`

CTA на всех уровнях: **«Хочу похожий дом»** с payload `source: case-page`, `caseSlug`, параметры дома.

---

## 3. Структура раздела `/cases`

| Блок | Описание |
|---|---|
| Hero | H1, подзаголовок, empty state при отсутствии published |
| Избранные кейсы | Только если есть published |
| Фильтры + список | Client-компонент `CasesListClient` |
| «Как читать кейсы» | Объяснение формата |
| CTA | «Хотите похожий дом?» |
| SEO-текст | Честный текст о наполнении раздела |
| FAQ | 6 вопросов + FAQPage schema |
| Форма | `LeadForm` source=`cases:home` |

---

## 4. Структура страницы кейса

1. Breadcrumbs  
2. Hero (бейджи, CTA, микротекст о бюджете/сроках)  
3. Краткая сводка объекта  
4. Задача клиента  
5. С чем стартовали (вводные)  
6. Какое решение выбрали (+ ссылка на проект каталога)  
7. Сложности и решения  
8. Этапы работ  
9. Галерея (только реальные фото)  
10. Что получилось  
11. Отзыв (только `verified: true`)  
12. Что взять для своего дома  
13. Похожие проекты  
14. Похожие кейсы  
15. Полезно по теме (услуги + блог)  
16. FAQ  
17. Форма «Хочу похожий дом»  
18. SEO-текст (для published)  
19. Баннер для draft/needs-data  

---

## 5. Data-модель кейса

Тип: `src/types/case.ts` → `CaseItem`.

Ключевые поля: `status`, `clientTask`, `initialInputs`, `challenges`, `stages`, `gallery`, `result`, `testimonial`, `budget.showBudget`, `location.showExactLocation`, перелинковка.

**Хранение данных:**

| Файл | Назначение |
|---|---|
| `src/data/cases/index.ts` | `publishedCases[]`, `allCases`, `getCaseBySlug` |
| `src/data/cases/drafts.ts` | Внутренние заготовки |
| `src/data/cases.ts` | Re-export для совместимости со спецификацией |
| `src/data/case-categories.ts` | 10 категорий с фильтрами |
| `src/data/case-faqs.ts` | FAQ index + default case FAQ |

---

## 6. Категории кейсов

| Slug | Название | Фильтр |
|---|---|---|
| `doma-iz-brusa` | Дома из бруса | material: брус |
| `karkasnye-doma` | Каркасные | material: каркас |
| `doma-iz-gazobetona` | Газобетон | material: газобетон |
| `odnoetazhnye` | 1 этаж | floors: 1 |
| `dvukhetazhnye` | 2 этажа | floors: 2 |
| `do-100-m2` | до 100 м² | areaMax: 100 |
| `100-150-m2` | 100–150 м² | areaMin/Max |
| `dlya-semi` | для семьи | purpose: семья |
| `slozhny-uchastok` | сложный участок | taskTags |
| `irkutskaya-oblast` | Иркутская область | region |

Все категории: `noindexIfEmpty: true`.

---

## 7. Статусы кейсов

| Статус | Публичный список | Sitemap | robots |
|---|---|---|---|
| `published` | ✅ | ✅ | index |
| `draft` | ❌ | ❌ | noindex |
| `needs-data` | ❌ | ❌ | noindex |
| `noindex` | ❌ | ❌ | noindex |

`publishedCases` намеренно **пустой** — первый кейс добавляется только после сбора и согласования данных.

---

## 8. Правила честности и публикации

**Нельзя без подтверждения:**

- фото объекта, отзывы, бюджет, точный адрес, координаты, сроки, сложности и решения.

**Обязательно:**

- `testimonial.verified: true` для показа отзыва;
- `budget.showBudget: false` если бюджет не раскрывается;
- `location.showExactLocation: false` для приватности;
- без галереи — блок не показывается (не подставлять stock-фото как «наш объект»).

---

## 9. Фильтрация

Client: `CasesListClient` + `CaseFilters`.

Фильтры: материал, площадь (presets), этажность, сценарий (`purpose`), задача (`taskTags`).

Helpers: `filterCasesList()` в `src/lib/cases.ts`.

Empty state фильтра: «Пока нет кейсов по выбранным параметрам» + CTA «Подобрать похожий дом».

---

## 10. Карточка кейса

Компонент: `CaseCard`.

Показывает: изображение (или нейтральная заглушка с честным alt), title, excerpt, площадь, этажность, материал, локация, год, бейджи, CTA «Смотреть кейс» / «Хочу похожий дом».

Draft-кейсы **не попадают** в список.

---

## 11. Страница кейса

Компонент: `CasePageTemplate`.

- Draft/needs-data: баннер «материал не для публичной индексации», отзыв с `verified: false` **не показывается**.
- Published: полная структура + Article/Breadcrumb/FAQ schema.

---

## 12. Связь с каталогом

- На странице кейса: карточка связанного проекта + похожие проекты (`filterProjects`).
- На странице проекта: `ProjectRelatedCases` — показывается только при наличии published-кейсов для `projectSlug`.

---

## 13. Связь с карточками проектов

`getCasesForProject(allCases, projectSlug)` — по `project.projectSlug` и `relatedProjectSlugs`.

Блок: `src/components/cases/project-related-cases.tsx`.

---

## 14. Связь с коммерческими страницами

`ServiceRelatedCases` на `ServicePageTemplate` — `getCasesForService()` по slug услуги, материалу и этажности из `calculatorParams`.

Сейчас блок скрыт (нет published).

---

## 15. Связь с блогом

`BlogRelatedCases` на `BlogPostTemplate` — `getCasesForBlogPost()` по clusterId / categorySlug.

Сейчас блок скрыт (нет published).

---

## 16. Форма «Хочу похожий дом»

Компонент: `LeadForm` в `CasePageTemplate`.

| Поле payload | Значение |
|---|---|
| source | `case:{slug}` |
| prefilledComment | `buildCaseLeadComment()` — caseSlug, area, material, floors, location, relatedProjectSlugs, selectedCTA |

CRM-интеграция: существующий `/api/leads` (TODO: парсинг structured comment при подключении CRM).

---

## 17. Metadata и schema

**Index `/cases`:**

- Title: «Кейсы строительства домов в Иркутске…»
- Description: честный текст о подготовке раздела (если нет published)
- FAQPage schema

**Case page:**

- `noindex: !isCaseIndexable(item)`
- Article + BreadcrumbList + FAQPage (если FAQ есть)
- **Без** Review / AggregateRating / Offer с неподтверждённой ценой

---

## 18. Sitemap / noindex

- `/cases` — в sitemap (есть полезный контент + FAQ)
- Published-кейсы — в sitemap
- Категории кейсов — только если есть published-кейсы в категории
- Draft URLs генерируются SSG, но с `noindex` (не в sitemap)

---

## 19. Mobile UX

- Hero компактный, сводка карточками
- Фильтры — wrap на мобильных, сброс фильтров
- Этапы — вертикальный список
- CTA повторяются (hero + результат + форма)
- Галерея — responsive grid, lazy loading через `next/image`

---

## 20. Шаблон анкеты для сбора кейса

1. Название объекта  
2. Год строительства  
3. Локация (без точного адреса)  
4. Можно ли публиковать локацию?  
5. Площадь  
6. Этажность  
7. Материал  
8. Комплектация  
9. Срок строительства  
10. Можно ли публиковать бюджет?  
11. Задача клиента  
12. Состав семьи / сценарий  
13. Участок и особенности  
14. Ограничения  
15. Проект-основа (slug каталога или «индивидуальный»)  
16. Что адаптировали  
17. Сложности  
18. Как решили  
19. Какие этапы показать  
20. Фото до / процесс / результат  
21. Есть ли отзыв  
22. Можно ли публиковать отзыв  
23. Что нельзя раскрывать  
24. CTA кейса  
25. Связи: услуги, проекты, статьи блога  

---

## 21. Что нельзя публиковать без согласия

- Точный адрес и координаты частного дома  
- Бюджет и детали сметы  
- Фото участка, процесса, интерьера  
- Имя и контакты заказчика  
- Отзыв без `verified: true`  
- Утверждения «построено нами», если объект не подтверждён  

---

## 22. Компоненты

| Компонент | Путь |
|---|---|
| CasesHomeHero, HowToRead, SeoText | `cases-home-sections.tsx` |
| CasesEmptyState | `cases-empty-state.tsx` |
| CaseCard | `case-card.tsx` |
| CasesListClient | `cases-list-client.tsx` |
| CaseFAQ | `case-faq.tsx` |
| CasePageTemplate | `case-page-template.tsx` |
| RelatedCasesSection, CaseRelatedProjects, CaseRelatedLinks | `case-related.tsx` |
| ProjectRelatedCases | `project-related-cases.tsx` |
| ServiceRelatedCases | `service-related-cases.tsx` |
| BlogRelatedCases | `blog-related-cases.tsx` |

---

## 23. Data-файлы

| Файл | Изменение |
|---|---|
| `src/types/case.ts` | Создан |
| `src/data/cases/index.ts` | Создан |
| `src/data/cases/drafts.ts` | Создан |
| `src/data/cases.ts` | Re-export |
| `src/data/case-categories.ts` | Создан |
| `src/data/case-faqs.ts` | Создан |
| `src/lib/cases.ts` | Helpers фильтрации, перелинковки, lead comment |

---

## 24. Таблица статуса

| Зона | Что сделано | Что осталось |
|---|---|---|
| Раздел /cases | Hero, empty state, FAQ, SEO, форма, фильтры | Наполнение published-кейсами |
| Карточки кейсов | CaseCard + заглушка без фейков | Реальные обложки |
| Страница кейса | Полный шаблон 18 блоков | Первый published-кейс |
| Data-модель | CaseItem + categories + drafts | Сбор данных по анкете |
| Фильтры | 5 групп фильтров | — |
| SEO | metadata, FAQ schema, SEO-тексты | Title кейсов при публикации |
| Schema | Article, Breadcrumb, FAQ | ImageObject при галерее |
| Формы | LeadForm + payload | CRM-парсинг |
| Связь с каталогом | ProjectRelatedCases | Показ после 1+ published |
| Связь с блогом | BlogRelatedCases | Показ после 1+ published |
| Mobile UX | Responsive layout | — |

---

## 25. Таблица кейсов

| Кейс | Slug | Статус | Индексация | Данных хватает? | Что нужно добавить |
|---|---|---|---|---|---|
| Шаблон (внутренний) | `shablon-kejsa` | draft | noindex | ❌ | Все поля по анкете |
| Барнхаус 100 м², п. Утулik | `barnhaus-100-utulik-needs-data` | needs-data | noindex | ⚠️ частично | Фото этапов, сложности, согласование отзыва, галерея, verified testimonial |

**Кандидат на первый published:** `barnhaus-100-utulik-needs-data` — есть проект в каталоге, черновик отзыва в `testimonials.ts`, нужны фото и согласование клиента.

---

## 26. Проверки

| Команда | Результат |
|---|---|
| `npm run build` | ✅ Успешно (126 static pages, incl. `/cases`, draft case pages, category pages) |
| `npm run lint` | ⚠️ exit 1 — 10 ошибок и 7 предупреждений в **существующем** коде (counter, lead-form, header, planner, hooks). Файлы Этапа 11 (`/cases`) ошибок не содержат |
| TypeScript | ✅ Без ошибок (в составе build) |

**Исправлено при сборке:**

- `Button variant="link"` → `ghost` (нет variant link в UI)
- Восстановлен `CaseServiceLink` type в `lib/cases.ts`
- FAQ data вынесены из `"use client"` модуля в `case-faqs.ts` (fix prerender `a.map is not a function`)

---

## 27. Что переходит в Этап 12

- **Карта построенных объектов** — только при наличии реальных данных и согласий
- Приблизительные районы, не точные координаты (`showExactLocation: false`)
- Фильтры карты: материал, площадь, этажность, год, сценарий
- Карточка объекта + CTA «Хочу похожий дом рядом»
- Связь точек карты с кейсами
- Локальные SEO-страницы — после появления реальных кейсов
- Правила приватности для частных домов

---

## 28. Как опубликовать первый кейс

1. Заполнить анкету (раздел 20) с клиентом/прорабом.
2. Собрать фото этапов (согласованные).
3. Подтвердить отзыв → `testimonial.verified: true`.
4. Перенести объект из `drafts.ts` в `publishedCases` в `index.ts` со статусом `published`.
5. Проверить sitemap, schema, блоки на проекте и услугах.
6. Не использовать `builtHomes` из `company.ts` — там placeholder Unsplash, не реальные объекты.
