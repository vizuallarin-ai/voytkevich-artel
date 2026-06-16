# Конверсионный аудит и доработки — stroistroy.ru

Дата: 2026-06-05  
Цель: превратить сайт в конверсионную воронку «SEO/реклама → посадочная → инструмент → форма → CRM → менеджер».

---

## 1. Что было найдено

| Проблема | Где | Риск |
| -------- | --- | ---- |
| Honeypot с label «Website» в sr-only | `honeypot-field.tsx` | Путаница при сбое CSS / a11y-инспектор |
| Дубли статистики «127 127» | `stat-display.tsx` + `AnimatedCounter` | Потеря доверия на блоке trust |
| Заявки FAQ → CRM как «главная» | `faq/page.tsx`, `id="lead"` | Менеджер не видит источник |
| Калькулятор без `context.calculator` | `calculator-lead-section.tsx` | CRM без structured data |
| Кнопки «Далее» без смысла | `lead-form.tsx`, wizard | Слабая мотивация к шагу |
| Три sticky-бара на mobile | global + project + messenger | Перекрытие UI |
| CTA-клики не в analytics dashboard | `trackCta` не использовался | Слепая оптимизация |
| Калькулятор: только YM, не internal store | `calculator-analytics.ts` | Воронка не в CRM analytics |
| Empty states «готовится» | cases, objects-map | Ощущение пустого сайта |
| FAQ: 7 вопросов, не все из чек-листа | `data/faq.ts` | Незакрытые страхи |

---

## 2. Что исправлено

### P0 — срочно

- **Honeypot** — absolute off-screen, без видимого label «Website».
- **StatDisplay** — одно визуальное значение + `aria-label`; counter стартует с 0 (без flash «127»).
- **Статистика** — подписи: `127+`, `98%`, `4.9`, `5 лет`.
- **Калькулятор** — skeleton loading, fallback-форма без JS, блок «расчёт готов», CTA «Отправить расчёт специалисту», полный `context.calculator` в CRM.
- **FAQ** — +5 вопросов из чек-листа; форма с `sourceType: faq`.
- **Формы** — контекстные подписи шагов вместо «Далее».

### P1 — рост заявок

- **Mobile sticky bar** — `Позвонить | WhatsApp | Рассчитать/Заявка` (контекст по URL).
- **Messenger FAB** — только desktop; mobile через sticky bar.
- **Каталог-категории** — `CatalogPickerBlock` с `categorySlug` в lead payload.
- **FAQ / process / blog / cases** — явный `leadConfig` и правильный `sourceType`.
- **Footer** — WhatsApp + Telegram.
- **Empty states** — честный продающий текст + CTA на смету/подбор.

### P2 — воронка

- **Hero H1/subheadline** — обновлены в `positioning.ts` (конверсионная формулировка).
- **Hero CTA** — вторичная кнопка «Подобрать проект под участок» → `/#lead`.
- **Лид-магниты** — уже были (`estimate-example`, `land-checklist` и др.); размещения без изменений архитектуры.

---

## 3. CTA — замены

| Было | Стало | Где |
| ---- | ----- | --- |
| «Далее» | «Указать площадь и участок» / контекст шага | `lead-form.tsx` |
| «Далее» (кальк.) | «Начать расчёт», «Выбрать комплектацию»… | `calculator-wizard.tsx` |
| «Оставить заявку» | «Хочу похожий дом» | `cases/page.tsx` |
| «Смотреть проекты» (hero) | «Подобрать проект под участок» | `hero.tsx` |
| Generic catalog form | «Подобрать проект под мой участок» | `catalog-picker-block.tsx` |

---

## 4. Формы — обновления

| Форма | leadConfig / контекст |
| ----- | --------------------- |
| FAQ | `sourceType: faq`, CTA «Получить консультацию» |
| Process | `sourceType: process` |
| Blog index | `sourceType: blog-post`, `context.blog` |
| Cases index | `sourceType: case-page` |
| Calculator | `context.calculator` (area, material, totals, package…) |
| Catalog picker | `catalog-category` + `categorySlug` |
| Home | без изменений (уже был leadConfig) |
| Project | без изменений (уже полный context) |

---

## 5. Sticky CTA (mobile)

| Страница | Третья кнопка |
| -------- | ------------- |
| Главная | Рассчитать → `/#lead` |
| Каталог проекта | Расчёт → `#project-lead` |
| Калькулятор | Заявка → `#calculator-lead` |
| Планировщик | Разбор → `#planner-lead` |
| Остальные | Рассчитать → `/calculator` |

Project/Calculator page-specific sticky bars **отключены** на mobile — единый bar.

---

## 6. Калькулятор

- Loading: skeleton + текст «Загрузка калькулятора стоимости…»
- Fallback: форма заявки если JS недоступен (`noscript`)
- После результата: блок «Ваш предварительный расчёт готов» + форма с CRM context
- Analytics: события идут в Metrika **и** internal store через `events.ts`

---

## 7. FAQ

12 вопросов с ответами в `data/faq.ts`, schema на `/faq`, accordion Radix.

---

## 8. Категории каталога

Карточки проектов рендерятся через `CatalogClient` при `filtered.length > 0`.  
Форма подбора передаёт `categorySlug` в `context.catalog`.

---

## 9. Карточки проектов

Без изменений в этом спринте — stage-5 блоки уже на месте (packages, FAQ, lead section, sidebar).  
TODO: реальные цены комплектаций, floor plans (контент заказчика).

---

## 10. Кейсы и карта объектов

Обновлены empty states — честный текст, CTA: пример сметы, подбор проекта, расчёт.

---

## 11. Analytics events

| Событие | Где | Payload |
| ------- | --- | ------- |
| `lead_form_viewed` | mount LeadForm | formId, pageType, ctaLabel |
| `lead_form_started` | step 0→1 | formId, pageType |
| `lead_form_submitted/success/error` | submitLead | как было |
| `cta_clicked` | `cta-tracking.ts` | ctaLabel, pageType |
| `phone_clicked` | sticky bar | sourceSection |
| `whatsapp_clicked` | sticky bar, messenger | sourceSection |
| `telegram_clicked` | messenger FAB | sourceSection |
| `sticky_cta_clicked` | sticky bar | action, pageType |
| `calculator_*` | wizard | area, material, totals + internal store |

Файл: `src/lib/analytics/cta-tracking.ts`

---

## 12. Lead payload

Калькулятор теперь заполняет:

```ts
context.calculator: {
  area, floors, material, packageType, foundation,
  totalMin, totalMax, total, pricePerM2Min/Max,
  durationMinMonths/Max, hasLand, landLocation,
  projectSlug, projectTitle
}
```

Категории: `context.catalog.categorySlug`

---

## 13. Ручная проверка

1. Mobile: sticky bar не перекрывает формы (padding `pb-[4.5rem]` на main).
2. `/faq` → заявка → CRM: источник FAQ, не home.
3. Калькулятор → заявка → timeline + context.calculator.
4. `/catalog/kategoriya/odnoetazhnye` — карточки видны.
5. Telegram на prod (отдельная задача deploy).
6. Metrika goals в интерфейсе Яндекса.

---

## 14. Данные от заказчика

- Реальные кейсы с фото этапов
- Verified объекты на карте
- PDF пример сметы / чек-листы для автоматической отправки
- Подтверждение цифр 127 / 98% / 4.9 (сейчас с TODO в positioning — не усилены как новый факт)
- Документы СРО/ISO для `/about` (в data есть placeholder licenses)
- Partner logos (сейчас placehold.co)

---

## 15. TODO (осталось)

- [ ] Deploy на VPS + Telegram fix
- [ ] Wire `trackCtaClicked` на все inline CTA (blog, project-inline) — частично
- [ ] Planner analytics → internal store (как calculator)
- [ ] A/B CTA на главной
- [ ] Реальные PDF лид-магнитов (Resend attachment)
- [ ] About: блок «Документы» с реальными файлами
- [ ] Process: детализация этапов (документ/акт на каждый) — контент

---

## Таблица — страницы и CTA

| Страница | Главный CTA | Вторичный CTA | Lead context |
| -------- | ----------- | ------------- | ------------ |
| Главная | Рассчитать стоимость | Подобрать под участок | home |
| Каталог | Смотреть проекты | Подбор форма | catalog / catalog-category |
| Проект | Получить расчёт проекта | Адаптировать | project.* |
| Калькулятор | Отправить расчёт специалисту | Каталог | calculator.* |
| FAQ | Получить консультацию | — | faq |
| Блог | Лид-магнит / консультация | Калькулятор | blog-post |
| Кейсы | Хочу похожий дом | Каталог | case-page |

---

## Проверки

```bash
npm run build  # ✅ passed
```

Lint: не запускался отдельно; TypeScript strict — без ошибок в build.
