# Этап 8 — Коммерческие SEO-страницы

Дата: 2026-06-05  
Сайт: https://voytkevich-artel.vercel.app/

## 1. Что сделано

Реализован слой из **11 коммерческих SEO-страниц** под горячий поисковый спрос. Каждая страница — посадочная с единым шаблоном: hero, аудитория, состав работ, факторы цены, проекты из каталога, CTA на калькулятор и планировщик, процесс, блок доверия, риски, FAQ, SEO-текст, перелинковка и форма заявки.

Предыдущие отчёты этапов 1–7 найдены в `/docs/stage-*.md`.

## 2. Коммерческие страницы

| Страница | URL | Целевой интент | CTA | Связанные разделы | Статус |
|---|---|---|---|---|---|
| Строительство домов под ключ | `/stroitelstvo-domov-pod-klyuch-irkutsk` | Подрядчик, дом под ключ, Иркутск | Рассчитать / Подобрать проект | Каталог, калькулятор, планировщик, смета, область | ✅ |
| Дома из бруса | `/stroitelstvo-domov-iz-brusa` | Материал: брус | Рассчитать дом из бруса | Каталог (брус), калькулятор, смета | ✅ |
| Каркасные дома | `/karkasnye-doma-pod-klyuch` | Каркас под ключ | Рассчитать каркасный дом | Каталог (каркас), калькулятор | ✅ |
| Дома из газобетона | `/stroitelstvo-domov-iz-gazobetona` | Газобетон | Рассчитать дом из газобетона | Каталог (газобетон), калькулятор | ✅ |
| Одноэтажные дома | `/odnoetazhnye-doma-pod-klyuch` | Этажность: 1 | Подобрать одноэтажный проект | Категория одноэтажных, планировщик | ✅ |
| Двухэтажные дома | `/dvuhetazhnye-doma-pod-klyuch` | Этажность: 2 | Подобрать двухэтажный проект | Категория двухэтажных, планировщик | ✅ |
| Дома до 10 млн | `/doma-pod-klyuch-do-10-mln` | Бюджет | Подобрать под бюджет | Категория до 10 млн, смета, ипотека | ✅ |
| Проектирование | `/proektirovanie-domov` | Проект дома | Начать с планировки | Планировщик, каталог, смета | ✅ |
| Смета | `/smeta-na-stroitelstvo-doma` | Состав сметы, расчёт | Получить предварительную смету | Калькулятор, каталог, проектирование | ✅ |
| Ипотека | `/stroitelstvo-doma-v-ipoteku` | Стройка в ипотеку | Обсудить строительство в ипотеку | Смета, до 10 млн, каталог | ✅ |
| Иркутская область | `/stroitelstvo-domov-v-irkutskoy-oblasti` | География | Проверить участок | Иркутск, каталог, процесс | ✅ |

## 3. Маршруты

- Динамический маршрут: `src/app/[slug]/page.tsx`
- Чистые URL верхнего уровня: `/stroitelstvo-domov-pod-klyuch-irkutsk` и т.д.
- Статические маршруты (`/catalog`, `/about`, …) имеют приоритет над `[slug]`
- `generateStaticParams` — 11 slug из data
- Страницы добавлены в `sitemap.xml` (priority 0.88)

**Почему не `/services/[slug]`:** короткие URL лучше для коммерческого SEO; конфликтов с существующими маршрутами нет.

## 4. Данные: `service-pages`

```
src/data/service-pages/
  index.ts      — экспорт, getters
  shared.ts     — общие блоки (process, price factors, links)
  pages-a.ts    — страницы 1–3
  pages-b.ts    — страницы 4–7
  pages-c.ts    — страницы 8–11
src/data/service-pages.ts — re-export для импорта
src/types/service-page.ts — тип ServicePage
```

Поля: slug, title, h1, subtitle, seoTitle, seoDescription, serviceType, targetKeywords, intro, audience, includes, priceFactors, exclusions (бюджет), relatedProjectFilters, relatedCatalogHref, process, risks, faqs, seoText, relatedLinks, cta, calculatorParams, quickFacts, schemaType, noindex.

## 5. Шаблон страницы

`ServicePageTemplate` (`src/components/service/service-page-template.tsx`) собирает секции:

1. Breadcrumbs  
2. ServiceHero  
3. ServiceIntro  
4. ServiceAudience  
5. ServiceIncludes  
6. ServiceExclusions (опционально)  
7. ServicePriceFactors  
8. ServiceRelatedProjects  
9. ServiceCalculatorCTA  
10. ServiceProcess  
11. ServiceTrustBlock  
12. ServiceRisks  
13. ServiceFAQ  
14. ServiceSeoText  
15. ServiceRelatedLinks  
16. ServiceLeadSection  

## 6. Компоненты

| Компонент | Файл |
|---|---|
| ServicePageTemplate | `service-page-template.tsx` |
| Hero, Intro, Audience, … | `service-sections.tsx` |
| ServiceFAQ | `service-faq.tsx` |
| ServiceRelatedProjects | `service-related-projects.tsx` |
| ServiceLeadSection | `service-lead-section.tsx` |

## 7. Перелинковка

На каждой странице блок «Полезные разделы» — 4–8 ссылок на каталог, калькулятор, планировщик, процесс, релевантные коммерческие страницы и категории.

## 8. Связь с каталогом

`filterProjects(projects, page.relatedProjectFilters)` — фильтры по material, floors, priceMax, sort.  
Если проектов нет — CTA на каталог и форму подбора (без пустого блока).

## 9. Связь с калькулятором

`buildServiceCalculatorUrl(page)` →  
`/calculator?source=service-page&service={slug}&material=…&floors=…`

Параметры material и floors передаются, если поддерживаются калькулятором.

**TODO:** калькулятор пока не читает `budget` / `priceMax` из query — для страницы «до 10 млн» передаётся только `service` slug для аналитики.

## 10. Связь с планировщиком

`buildServicePlannerUrl(page)` →  
`/planirovka?source=service-page&service={slug}`

## 11. Форма заявки

Используется существующий `LeadForm`:

- **source:** `service-page:{slug}`
- **prefilledComment:** serviceSlug, URL страницы
- **title / submitLabel:** контекстные из `page.cta`

API `/api/leads` принимает name, phone, area, comment, source — расширение payload в CRM зафиксировано как TODO при подключении CRM.

## 12. Metadata

`generateMetadata` → `pageMetadata({ title: seoTitle, description: seoDescription, path })`  
Уникальные title/description на каждую страницу, canonical, Open Graph.

## 13. Schema-разметка

На каждой странице JSON-LD:

- `BreadcrumbList`
- `Service` (новая функция `serviceSchema` в `json-ld.tsx`)
- `FAQPage`

Без Review, AggregateRating, Offer с фейковыми ценами.

## 14. Блок доверия

Используются только подтверждённые факты с сайта: с 2014 года, 127+ домов, гарантия до 5 лет на конструктив, фотоотчёты.

## 15. Риски thin content

- Все 11 страниц наполнены уникальным intro, FAQ, SEO-текстом и блоками
- Страницы с пустой подборкой проектов показывают fallback CTA, не пустой grid
- `noindex` не используется — контент достаточный для индексации

## 16. Проверки

| Команда | Результат |
|---|---|
| `npm run build` | ✅ 91 страница, 11 service routes |
| `npm run lint` | ⚠️ ошибки в legacy-файлах (не из этапа 8); новые service-компоненты без ошибок |

## 17. Этап 9 — TODO

- Собрать полное семантическое ядро и кластеры (стоимость, материалы, площадь, ипотека, география, …)
- Карта SEO-страниц: что есть / чего не хватает
- Правила внутренней перелинковки
- Контент-план для блога и новых коммерческих страниц
- Добавить `budget`/`priceMax` в query калькулятора
- Опционально: ссылки на коммерческие страницы в footer/header
- CRM: полный payload (serviceSlug, selectedCTA, utm)

---

*Этап 8 завершён. Сайт получил отдельный коммерческий слой под горячий спрос.*
