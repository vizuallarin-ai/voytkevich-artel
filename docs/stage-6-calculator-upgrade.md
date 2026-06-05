# Этап 6 — Доработка калькулятора стоимости

Сайт: [voytkevich-artel.vercel.app](https://voytkevich-artel.vercel.app/)  
Дата: июнь 2026

---

## 1. Что изменено

Калькулятор `/calculator` превращён в пошаговый лидогенератор с диапазоном стоимости, breakdown, квалификацией лида, связью с проектами и расширенной формой заявки.

---

## 2. Структура страницы

1. Breadcrumbs  
2. Hero (`CalculatorHero`)  
3. Funnel hint  
4. Пошаговый wizard (5 шагов)  
5. Breakdown стоимости  
6. Факторы изменения сметы  
7. Похожие проекты  
8. Форма заявки  
9. FAQ  
10. SEO-текст  
11. Sticky CTA (mobile, после результата)

---

## 3. Параметры расчёта

**Дом:** площадь 50–300 м², этажность, материал, назначение, спальни, санузлы, фундамент.

**Участок:** наличие, локация, геология, подъезд, уклон, коммуникации (квалификация в заявке).

**Комплектация:** коробка, тёплый контур, предчистовая, под ключ.

**Доп. опции:** терраса, гараж, навес, кабинет, второй свет, панорамные окна, котельная, сложная кровля, утепление, инженерия.

---

## 4. Формула

`src/lib/calculator.ts`:

- Базовая ставка ₽/м² по материалу × комплектации  
- Коэффициенты: этажность, фундамент, назначение, спальни/санузлы  
- Фиксированные надбавки за доп. опции  
- Диапазон ±10–20% в зависимости от неопределённости (фундамент, геология, подъезд)

Legacy `calculateHouseCost()` сохранён для планировщика и hero-виджетов (средняя точка диапазона).

---

## 5. Breakdown

9 этапов с диапазоном суммы и долей от общей стоимости: проектирование, фундамент, коробка, кровля, окна, инженерия, отделка, логистика, резерв.

---

## 6. Связь с проектами

Query-параметры: `project`, `area`, `material`, `floors`, `package`, `bedrooms`, `source`.

Пример: `/calculator?project=angara-100&area=100&material=brus&floors=2&source=project-page`

Кнопки «Рассчитать этот проект» и «Рассчитать в комплектации» на карточках проектов.

---

## 7. Форма заявки

`CalculatorLeadSection` → `LeadForm` с `source=calculator` или `calculator-project-{slug}`.

В comment передаётся полный payload расчёта через `buildCalculatorLeadComment()`.

TODO: расширить API `/api/leads` структурированными полями.

---

## 8. Аналитика

`trackCalculatorEvent()` в `src/lib/calculator-analytics.ts`:

- calculator_started  
- calculator_step_completed  
- calculator_result_viewed  
- calculator_lead_form_opened  
- calculator_reset  

TODO: calculator_lead_submitted (в LeadForm), calculator_project_clicked.

---

## 9. Metadata

Title: «Калькулятор стоимости строительства дома в Иркутске»  
OG: отдельный заголовок и description.

---

## 10. Компоненты

| Компонент | Назначение |
|-----------|------------|
| `calculator-hero.tsx` | Hero + CTA |
| `calculator-wizard.tsx` | Пошаговая форма |
| `calculator-result.tsx` | Диапазон и параметры |
| `calculator-breakdown.tsx` | Разбивка |
| `calculator-price-factors.tsx` | Факторы сметы |
| `calculator-lead-section.tsx` | Форма |
| `calculator-related-projects.tsx` | Проекты по расчёту |
| `calculator-sticky-cta.tsx` | Mobile sticky |
| `calculator-faq.tsx` | FAQ |
| `calculator-seo-text.tsx` | SEO-блок |

---

## 11. Ограничения

- Нет генерации PDF (TODO)  
- Участок не меняет сумму напрямую — только квалификация и ширина диапазона  
- Ставки ₽/м² — ориентиры, не коммерческое предложение

---

## 12. Этап 7

- Связь планировщика с калькулятором  
- Расчёт планировки  
- Сценарии семьи/дачи/кабинета  
- Отправка планировки специалисту

---

## Таблица

| Зона | Сделано | Осталось |
|------|---------|----------|
| Параметры дома | 5 шагов, slider+input | Мансарда |
| Участок | Квалификация в заявке | Влияние на формулу |
| Комплектация | 4 формата | Реальные ставки из CRM |
| Формула | Диапазон + коэффициенты | Калибровка по сметам |
| Результат | Диапазон, срок, параметры | — |
| Breakdown | 9 этапов | — |
| Форма заявки | Comment payload | CRM fields |
| PDF-смета | — | TODO |
| Связь с проектами | Query + CTA | — |
| Аналитика | 5 событий | lead_submitted |
| SEO | Meta + текст + FAQ | FAQ schema |
| Mobile UX | Sticky CTA | — |

---

## Проверки

| Команда | Результат |
|---------|-----------|
| `npm run build` | ✅ 80 страниц |
| `npm run lint` | ⚠️ 10 pre-existing errors (не в calculator), 0 новых блокеров |
