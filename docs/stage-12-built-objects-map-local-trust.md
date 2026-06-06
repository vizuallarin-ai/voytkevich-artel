# Этап 12 — Карта построенных объектов и локальное доверие

Дата: 2026-06-05  
Сайт: https://voytkevich-artel.vercel.app/

Предыдущие этапы: документы `stage-1` … `stage-11` найдены в `/docs`.

**Маршрут:** `/objects-map` (зоны: `/objects-map/[areaSlug]`)

---

## 1. Что сделано на Этапе 12

- Создана **privacy-first архитектура** карты построенных объектов.
- Data-модели `BuiltObject`, `BuiltObjectArea`, фильтры, helpers.
- Страница **`/objects-map`** с честным empty state (published-объектов пока нет).
- **Fallback-схема зон** (без Leaflet/Mapbox/API-ключей) — карточки районов Иркутска и области.
- Фильтры, список объектов, переключатель «Список / Зоны», mobile-first UX.
- 6 географических зон с `noindexIfEmpty`.
- 2 внутренние заготовки (`draft` / `needs-data`) — не на публичной карте.
- Связь с кейсами, каталогом, коммерческими страницами (блоки скрыты до published).
- Форма «Хочу похожий дом в своём районе» + analytics events.
- Footer: ссылка «Карта объектов». Sitemap: `/objects-map`.

---

## 2. Роль карты в доверии и заявках

Карта отвечает на вопросы: «Вы реально строите?», «Строили ли рядом?», «Есть ли похожий материал/площадь?»

Воронка: `карта / зона → кейс / проект → расчёт → заявка`

---

## 3. Privacy-first правила

| Правило | Реализация |
|---|---|
| Нет точных адресов | `exactAddress` never shown if `showExactAddress: false` |
| Нет точных координат без согласия | `getPublicMapCoordinates()` → approximate или center зоны |
| Нет фото без разрешения | `allowedPublicFields.photos` + `allowedForPublicUse` |
| Нет бюджета без согласия | `budget.showBudget: false` |
| Нет фейковых точек | `publishedBuiltObjects: []` |
| Нет auto-map из кейса | Draft barnhaus явно помечен: не публиковать без verified |

### Что нельзя публиковать без согласия клиента

- Точный адрес и координаты частного дома  
- Фото участка, процесса, интерьера  
- Бюджет и детали сметы  
- Имя и контакты заказчика  
- Привязку кейса к карте (`caseLink`) без разрешения  

---

## 4. Структура `/objects-map`

| Блок | Компонент |
|---|---|
| Hero + privacy notice | `ObjectsMapHero` |
| Статистика | `BuiltObjectsStatsBlock` (честный текст если пусто) |
| Фильтры + список + зоны | `BuiltObjectsMapClient` |
| Блок доверия | `ObjectsMapTrustBlock` |
| CTA | форма + кнопки |
| SEO-текст | `ObjectsMapSeoText` |
| FAQ | `ObjectsMapFAQ` + FAQPage schema |
| Форма | `LeadForm` source=`objects-map` |

---

## 5. Data-модель built-objects

Тип: `src/types/built-object.ts`

Хранение:

| Файл | Назначение |
|---|---|
| `src/data/built-objects/index.ts` | `publishedBuiltObjects[]`, `allBuiltObjects` |
| `src/data/built-objects/drafts.ts` | Внутренние заготовки |
| `src/data/built-objects.ts` | Re-export |
| `src/data/built-object-areas.ts` | 6 зон |
| `src/data/built-objects-faqs.ts` | FAQ |

---

## 6. Data-модель зон

| Slug | Название | noindexIfEmpty |
|---|---|---|
| `irkutsk` | Иркутск | ✅ |
| `irkutskaya-oblast` | Иркутская область | ✅ |
| `irkutskiy-rayon` | Иркутский район | ✅ |
| `angarsk` | Ангарск | ✅ |
| `shelekhov` | Шелехов | ✅ |
| `baikal-trakt` | Байкальский тракт | ✅ |

Пустые зоны: **noindex**, не в sitemap.

---

## 7. Как работает карта

**Выбран вариант Б/В:** визуальная схема зон + список объектов.

- Нет внешней картографической библиотеки (нет зависимостей, нет API-ключей).
- `BuiltObjectsZoneMap` — карточки районов на стилизованном фоне.
- При появлении published-объектов — счётчики по зонам, фильтр по `areaSlug`.
- Координаты используются только в helpers для будущей интеграции; публично — `locationLabel`.

---

## 8. Fallback без настоящей карты

Если данных нет: зоны-architecture + empty state + CTA на каталог/калькулятор.

Если данные есть: переключатель «Список / Зоны», фильтры синхронизированы.

---

## 9. Фильтры

Материал, площадь, этажность, сценарий, статус (построен/в процессе), «есть кейс», район/зона.

Helper: `filterBuiltObjectsList()` в `src/lib/built-objects.ts`.

---

## 10. Карточка объекта

`BuiltObjectCard`: фото (или честная заглушка), title, locationLabel, specs, tags, CTA кейс/проект/заявка/каталог.

---

## 11. Связь с кейсами

- `caseSlug` + `allowedPublicFields.caseLink`
- `getBuiltObjectByCaseSlug()` — кнопка «Посмотреть на карте» на странице кейса (только published)
- `/cases` — блок «Смотреть карту объектов» при наличии published-объектов
- **Не** auto-create map object from case draft

---

## 12. Связь с каталогом

`ProjectRelatedBuiltObjects` на карточке проекта — `getBuiltObjectsForProject()`.

---

## 13. Связь с коммерческими страницами

`ServiceRelatedBuiltObjects` — по material/floors/region из `calculatorParams`.

---

## 14. Форма заявки

`buildBuiltObjectLeadComment()` передаёт: source, objectSlug, areaSlug, material, floors, caseSlug, projectSlugs, selectedCTA.

Поле «район участка» — через `comment` / area field в форме.

---

## 15. Аналитика

`trackObjectsMapEvent()` → Yandex Metrika reachGoal (no-op без YM_ID):

- `objects_map_viewed`
- `objects_map_filter_used`
- `objects_map_object_clicked`
- `objects_map_case_clicked`
- `objects_map_project_clicked`
- `objects_map_lead_form_opened` (TODO при открытии формы)
- `objects_map_lead_submitted` (TODO при submit hook)
- `objects_map_area_clicked`

---

## 16. Metadata и schema

- Title/Description адаптированы под empty/published state
- BreadcrumbList + FAQPage на index
- BreadcrumbList на зонах
- **Без** Place/geo/Review/Offer с неподтверждёнными данными

---

## 17. Sitemap / noindex

- `/objects-map` — в sitemap (полезный контент + FAQ + privacy)
- Зоны — только если есть published-объекты в зоне
- Draft-объекты — не в sitemap

---

## 18. Mobile UX

- Фильтры в аккордеон-блоке, wrap chips
- Переключатель Список/Зоны
- Список объектов — основной интерфейс на мобильных
- Карта-схема — компактные карточки зон

---

## 19. Навигация

- **Footer:** «Карта объектов»
- **Header:** не добавлен (нет published — не перегружаем меню)
- **Cases:** ссылка при наличии объектов

---

## 20. Шаблон анкеты для объекта карты

1. Название объекта  
2. Связь с кейсом?  
3. Связь с проектом каталога?  
4. Можно ли публиковать на карте?  
5. Можно ли публиковать точную локацию?  
6. Какую зону указать?  
7. Можно ли публиковать фото?  
8–12. Площадь, материал, год, срок, бюджет  
13–18. Особенности, сценарий, участок  
19–20. Фото результата / этапов  
21. Что нельзя раскрывать  
22–24. CTA, проекты, коммерческие страницы  

---

## 21. Компоненты

| Компонент | Путь |
|---|---|
| ObjectsMapHero, SeoText, TrustBlock | `objects-map-sections.tsx` |
| ObjectsMapEmptyState | `objects-map-empty-state.tsx` |
| BuiltObjectsMapClient | `built-objects-map-client.tsx` |
| BuiltObjectsZoneMap | `built-objects-zone-map.tsx` |
| BuiltObjectCard | `built-object-card.tsx` |
| BuiltObjectsStatsBlock | `built-objects-stats.tsx` |
| ObjectsMapFAQ | `objects-map-faq.tsx` |
| RelatedBuiltObjects | `related-built-objects.tsx` |
| ObjectsMapViewTracker | `objects-map-view-tracker.tsx` |

---

## 22. Таблица статуса

| Зона | Что сделано | Что осталось |
|---|---|---|
| Страница карты | Hero, empty state, FAQ, SEO, форма | Published-объекты |
| Data-модель | BuiltObject + areas + drafts | Сбор данных |
| Зоны/районы | 6 зон, area pages noindex | Контент при объектах |
| Фильтры | 7 групп | — |
| Карточки | BuiltObjectCard | Реальные фото |
| Privacy | helpers + docs | Legal checklist |
| Связь с кейсами | getBuiltObjectByCaseSlug | Первый linked published |
| Связь с каталогом | ProjectRelatedBuiltObjects | Показ после publish |
| SEO | metadata, FAQ schema | — |
| Формы | LeadForm + payload | CRM parsing |
| Аналитика | trackObjectsMapEvent | lead submit hook |
| Mobile UX | list-first, toggle | — |

---

## 23. Таблица объектов

| Объект | Slug | Статус | Публикация? | Точная точка? | Кейс? | Что добавить |
|---|---|---|---|---|---|---|
| Шаблон | `shablon-obekta-karty` | draft | ❌ | ❌ | ❌ | Все поля |
| Барнхаус Утулик | `barnhaus-100-utulik-map-needs-data` | needs-data | ❌ | ❌ (approx only) | draft case | Разрешения, фото, verified caseLink |

---

## 24. Таблица зон

| Зона | Slug | Объекты | Индексация | Статус |
|---|---|---|---|---|
| Иркутск | irkutsk | 0 | noindex | архитектура |
| Ирк. область | irkutskaya-oblast | 0 | noindex | архитектура |
| Ирк. район | irkutskiy-rayon | 0 | noindex | архитектура |
| Ангарск | angarsk | 0 | noindex | архитектура |
| Шелехов | shelekhov | 0 | noindex | архитектура |
| Байкальский тракт | baikal-trakt | 0 | noindex | архитектура |

---

## 25. Проверки

| Команда | Результат |
|---|---|
| `npm run build` | ✅ 133 static pages |

---

## 26. Что переходит в Этап 13

- Система лид-магнитов (смета, чек-лист участка, подборка проектов)
- Универсальная форма лид-магнита
- Связь с блогом, калькулятором, планировщиком
- PDF/почтовая отправка (будущий этап)
- События аналитики лид-магнитов

---

## 27. Как опубликовать первый объект

1. Заполнить анкету с клиентом.  
2. Получить разрешения на локацию (зона), фото, caseLink.  
3. Установить `showExactCoordinates: false` unless written consent.  
4. Перенести в `publishedBuiltObjects` со status `published`.  
5. Связать с published-кейсом если есть.  
6. Проверить sitemap, блоки на проекте/услугах, кнопку на кейсе.
