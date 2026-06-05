# Этап 5 — Прокачка карточек проектов

Сайт: [voytkevich-artel.vercel.app](https://voytkevich-artel.vercel.app/)  
Дата: июнь 2026

---

## 1. Что изменено

Страница `/catalog/[slug]` превращена в мини-лендинг: 17 блоков, повторяющиеся CTA, sticky-панель на мобильном, боковая панель на десктопе, расширенный FAQ и SEO.

---

## 2. Структура страницы проекта

1. Breadcrumbs  
2. Hero (`ProjectHero`)  
3. Связанные категории каталога  
4. Галерея  
5. Характеристики  
6. О проекте  
7. Кому подойдёт  
8. Планировка (с fallback)  
9. Что может входить в стоимость  
10. Комплектации (3 формата)  
11. Факторы цены  
12. Адаптация проекта  
13. Этапы строительства  
14. Похожие проекты (до 6)  
15. FAQ (8 вопросов)  
16. SEO-текст  
17. Форма заявки + sticky CTA  

---

## 3. Компоненты

| Компонент | Назначение |
|-----------|------------|
| `project-hero.tsx` | H1, бейджи, цена, CTA |
| `project-specs.tsx` | Сетка характеристик |
| `project-audience.tsx` | Сценарии «кому подойдёт» |
| `project-floor-plan-section.tsx` | Планировка + fallback |
| `project-included-works.tsx` | Группы работ |
| `project-packages.tsx` | 3 комплектации |
| `project-price-factors.tsx` | Факторы сметы |
| `project-adaptation.tsx` | Адаптация + планировщик |
| `project-build-steps.tsx` | 7 этапов |
| `project-related.tsx` | Похожие проекты |
| `project-seo-block.tsx` | SEO-текст |
| `project-lead-section.tsx` | Форма с контекстом проекта |
| `project-sticky-cta.tsx` | Mobile sticky + desktop sidebar |
| `project-categories-nav.tsx` | Перелинковка категорий |
| `project-inline-cta.tsx` | Промежуточные CTA |

---

## 4. Поля проекта

Добавлено optional: `categorySlugs?: string[]`  
Используются существующие: `purpose`, `shortDescription`, `specs.hasCabinet`, `packages`, `floorPlans`.

---

## 5. Fallback-блоки

- **Планировка:** текст + CTA «Обсудить планировку», список «можно предусмотреть»  
- **Комплектации коробка/тёплый контур:** без выдуманной цены — «после уточнения комплектации»  
- **Похожие проекты:** CTA на каталог, если мало совпадений  

---

## 6. Форма заявки

- Компонент: `ProjectLeadSection`  
- `source`: `project-page-{slug}`  
- В comment: название, slug, площадь, материал, цена, URL, выбранная комплектация (sessionStorage)  
- Кнопка: «Отправить проект на расчёт»  
- TODO: расширить API leads полями `projectSlug`, `projectTitle` (сейчас в comment)

---

## 7. Похожие проекты

`findSimilarProjects` — до 6 проектов по площади, этажности, материалу, стилю, цене.

---

## 8. Metadata и schema

- Title: «Проект дома {name} {area} м² — строительство под ключ в Иркутске»  
- Description: из `buildProjectSeoMeta()`  
- JSON-LD: Product (offers), BreadcrumbList, FAQPage  

---

## 9. Mobile UX

- Sticky CTA снизу (цена + «Получить расчёт»)  
- `pb-28` на странице под панель  
- Адаптивные сетки характеристик и комплектаций  

---

## 10. Данные для заполнения позже

- Реальные планировки с комнатами (rooms[])  
- Несколько комплектаций с ценами в data  
- categorySlugs вручную в CMS  
- popularity для сортировки похожих  
- CRM-поля в API  

---

## 11. Этап 6

- Связь калькулятора с projectSlug  
- PDF-смета  
- Breakdown стоимости по проекту  

---

## Таблица

| Зона | Сделано | Осталось |
|------|---------|----------|
| Hero | H1, бейджи, 2 CTA, price note | A/B заголовков |
| Галерея | Alt по spec, fullscreen | Больше фото в data |
| Характеристики | Динамическая сетка | Габариты в data |
| Планировка | Fallback + rooms hint | SVG-комнаты |
| Комплектации | 3 формата, честные цены | Реальные 3 пакета в data |
| Цена и смета | 10 факторов + CTA | Калькулятор (Этап 6) |
| FAQ | 8 вопросов + schema | — |
| Форма | Контекст в comment | CRM fields |
| SEO | Meta + текст | Уникальные тексты per project в CMS |
| Mobile | Sticky CTA | — |

---

## Проверки

| Команда | Результат |
|---------|-----------|
| `npm run build` | ✅ 80 страниц |
| `npm run lint` | Не запускался отдельно (прежние warnings) |
