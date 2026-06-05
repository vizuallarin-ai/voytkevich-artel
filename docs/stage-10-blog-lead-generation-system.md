# Этап 10 — Блог как система лидогенерации

Дата: 2026-06-05  
Сайт: https://voytkevich-artel.vercel.app/

Предыдущие этапы: документы `stage-1` … `stage-9` найдены в `/docs`.

---

## 1. Что сделано на Этапе 10

- Блог переведён с простой ленты на **кластерную SEO- и лидоген-систему**.
- Добавлены **8 категорий** с маршрутами `/blog/category/[categorySlug]`.
- Расширена **модель статьи** (`BlogPost`): кластер, intent, funnel, FAQ, CTA, перелинковка, лид-магниты, status/noindex.
- Создан **шаблон статьи** `BlogPostTemplate` с CTA, проектами, коммерческими ссылками, FAQ, schema.
- Усилена **главная блога** `/blog`: hero, категории, рекомендуемые, темы, CTA, лид-магнит, SEO-текст, FAQ.
- Добавлены **13 новых опубликованных статей** + обновлены 4 legacy-материала.
- **3 устаревших материала** сняты с индексации (noindex) с указанием актуальных URL.
- **1 черновик** — draft + noindex.
- Карты **CTA** и **лид-магнитов**, helpers в `src/lib/blog.ts`.
- Sitemap: категории блога + только published/noindex=false статьи.

---

## 2. Новая роль блога

Блог — не журнал ради статей, а **воронка**:

`поисковый запрос → полезный ответ → доверие → следующий шаг → заявка / расчёт / каталог / планировщик`

---

## 3. Категории блога

| Категория | Slug | Основной CTA | Связанные страницы | Статус |
|---|---|---|---|---|
| Стоимость строительства | `cost` | Рассчитать стоимость дома | /calculator, /smeta-na-stroitelstvo-doma, /doma-pod-klyuch-do-10-mln | ✅ |
| Материалы и технологии | `materials` | Сравнить материалы | /stroitelstvo-domov-iz-brusa, /karkasnye-doma-pod-klyuch, … | ✅ |
| Фундамент и участок | `foundation-land` | Проверить вводные участка | /stroitelstvo-domov-v-irkutskoy-oblasti, /calculator, … | ✅ |
| Планировки и проекты | `planning-projects` | Собрать планировку | /planirovka, /proektirovanie-domov, /catalog | ✅ |
| Смета, договор и контроль | `estimate-contract-control` | Получить предварительную смету | /smeta-na-stroitelstvo-doma, /process | ✅ |
| Ипотека и документы | `mortgage-documents` | Обсудить строительство в ипотеку | /stroitelstvo-doma-v-ipoteku | ✅ |
| Ошибки и разборы | `mistakes` | Разобрать мой случай | /stroitelstvo-domov-pod-klyuch-irkutsk, /calculator | ✅ |
| Кейсы и опыт | `cases-experience` | Смотреть проекты | /catalog, /about | ✅ (контент — Этап 11) |

---

## 9. Первые созданные статьи

| Материал | URL | Категория | Кластер | CTA | Статус |
|---|---|---|---|---|---|
| Сколько стоит построить дом | /blog/skolko-stoit-postroit-dom-v-irkutske | cost | cost | Калькулятор | published |
| Смета: из чего состоит | /blog/smeta-na-stroitelstvo-doma-iz-chego-sostoit | estimate-contract-control | estimate | Смета | published |
| Дом до 10 млн | /blog/dom-pod-klyuch-do-10-mln-chto-realno | cost | cost | Подбор проекта | published |
| Одно- vs двухэтажный | /blog/odnoetazhnyy-ili-dvuhetazhnyy-dom | planning-projects | floors | Планировщик | published |
| Брус, каркас, газобетон | /blog/brus-karkas-ili-gazobeton | materials | comparisons | Калькулятор | published |
| Какой фундамент | /blog/kakoy-fundament-vybrat-dlya-chastnogo-doma | foundation-land | foundation | Участок | published |
| Что проверить на участке | /blog/chto-proverit-na-uchastke-pered-stroitelstvom | foundation-land | land | Чек-лист | published |
| Как выбрать подрядчика | /blog/kak-vybrat-podryadchika-dlya-stroitelstva-doma | mistakes | mistakes | Заявка | published |
| Как читать смету | /blog/kak-chitat-smetu-na-dom | estimate-contract-control | estimate | Пример сметы | published |
| Планировка для семьи | /blog/planirovka-doma-dlya-semi-s-detmi | planning-projects | planning | Планировщик | published |
| Ипотека: что подготовить | /blog/stroitelstvo-doma-v-ipoteku-chto-podgotovit | mortgage-documents | mortgage | Ипотека | published |
| Контроль удалённо | /blog/kak-kontrolirovat-stroitelstvo-doma-udalenno | estimate-contract-control | contract | Процесс | published |
| Проект под участок | /blog/kak-vybrat-proekt-doma-pod-uchastok | planning-projects | projects | Каталог | published |

**+ 4 обновлённых legacy-материала.** Итого **17 индексируемых статей**.

---

## 10. Черновики и noindex

| URL | Причина | Статус |
|---|---|---|
| /blog/stoimost-stroitelstva-2026 | Старые ₽/м² | needs-update + noindex |
| /blog/sravnenie-tehnologij | Старые цены | needs-update + noindex |
| /blog/ipoteka-na-izhs | Банки/ставки | needs-update + noindex |
| /blog/chto-vhodit-v-stroitelstvo-doma-pod-klyuch | Thin draft | draft + noindex |

---

## 8. Лид-магниты

| ID | CTA | Статус |
|---|---|---|
| estimate-example | Получить пример сметы | ✅ форма (TODO: PDF) |
| land-checklist | Чек-лист участка | ✅ форма |
| budget-project-selection | Подборка проектов | ✅ форма |
| layout-review | Разбор планировки | ✅ форма |
| material-comparison | Сравнение материалов | ✅ форма |
| mistakes-checklist | Чек-лист ошибок | ✅ форма |

---

## 23. Проверки

| Команда | Результат |
|---|---|
| `npm run build` | ✅ 113 страниц |

---

## 24. Этап 11

- `/cases`, шаблон кейса, реальные объекты
- Наполнение `cases-experience`
- CTA «хочу похожий дом»
- Без фейковых кейсов
