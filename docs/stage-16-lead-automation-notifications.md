# Этап 16 — Автоматизация обработки лидов и уведомления менеджеру

Дата: 2026-06-05  
Сайт: https://voytkevich-artel.vercel.app/

Предыдущие этапы: [stage-14](./stage-14-crm-lead-analytics-context-system.md), [stage-15](./stage-15-leads-dashboard-simple-crm.md)

---

## 1. Что сделано на Этапе 16

- **Automation pipeline** `handleNewLeadAutomation()` — запускается после сохранения каждого лида.
- **Приоритет** (urgent / high / normal / low) на основе score, readiness, источника и контекста.
- **SLA** с дедлайнами реакции и логикой просрочки.
- **Recommended next action** — автоматический следующий шаг по типу заявки.
- **Уведомления** через Telegram, email (Resend), webhook/n8n, mock (dev).
- **Notification service** с graceful degradation — падение одного канала не ломает заявку.
- **Automation status** сохраняется в `lead.automation` + timeline events.
- **Dashboard** — приоритет, SLA, просрочки, блок автоматизации, фильтры.
- **Logger** server-side без утечки PII.

---

## 2. Роль автоматизации

1. Мгновенно уведомить менеджера.
2. Дать readable summary, не JSON.
3. Приоритизировать горячих лидов.
4. Создать следующий шаг.
5. Контролировать SLA и просрочки.
6. Подготовить интеграцию с n8n / amoCRM / Битрикс.

---

## 3. Automation pipeline

```
POST /api/leads
  → buildLeadFromInput()
  → persistLead()           // сохранение в file store
  → handleNewLeadAutomation()
       → getLeadPriority()
       → calculateLeadSLA()
       → getRecommendedNextAction()
       → sendLeadNotifications()
       → applyLeadAutomation()  // automation + timeline + nextAction
  → success response (без internal errors)
```

Функция: `src/lib/leads/lead-automation.ts`

Spam-лиды: уведомления не отправляются, только лог.

---

## 4. Lead priority

Файл: `src/lib/leads/lead-routing.ts` → `getLeadPriority()`

| Priority | Условия (упрощённо) |
|---|---|
| urgent | hot + score ≥ 75 + телефон + калькулятор/проект/услуга + бюджет/участок/смета |
| high | score 60+ или калькулятор/проект или смета/расчёт |
| normal | score 30+ или лид-магнит/блог/планировщик |
| low | мало данных, общий вопрос |

---

## 5. SLA-правила

Файл: `src/lib/leads/lead-sla.ts`

| Priority | Целевая реакция |
|---|---|
| urgent | 15 минут |
| high | 30 минут |
| normal | 2 часа |
| low | 24 часа |

Просрочка: status `new` или `qualified`, deadline прошёл, не spam/lost/won.

Функции: `calculateLeadSLA`, `isLeadOverdue`, `getOverdueMinutes`, `formatSLAStatus`, `getOverdueLeads`.

**Business hours:** заготовка `DEFAULT_BUSINESS_HOURS` (Asia/Irkutsk), `enabled: false` — TODO.

---

## 6. Recommended next action

Файл: `src/lib/leads/lead-tasks.ts` → `getRecommendedNextAction()`

| Тип | Action type | Title |
|---|---|---|
| calculator | review-calculator | Разобрать расчёт |
| project | prepare-estimate | Рассчитать проект |
| planner | review-planner | Разобрать планировку |
| lead-magnet (estimate) | send-lead-magnet | Отправить пример сметы |
| lead-magnet (land) | clarify-land | Уточнить участок |
| lead-magnet (mortgage) | mortgage-consultation | Обсудить ипотеку |
| blog | follow-up | Уточнить интерес после статьи |
| case-like | prepare-estimate | Обсудить похожий дом |
| objects-map | clarify-land | Уточнить район и участок |
| unknown | call | Связаться и уточнить вводные |

---

## 7. Notification channels

| Канал | Env | Статус | Что делает |
|---|---|---|---|
| Telegram | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | ✅ | Markdown-сообщение менеджеру |
| Email | `LEADS_NOTIFICATION_EMAIL`, `RESEND_API_KEY`, `EMAIL_FROM` | ✅ | Resend API |
| n8n webhook | `N8N_LEAD_NOTIFICATION_WEBHOOK_URL` или `N8N_LEAD_WEBHOOK_URL` | ✅ | JSON payload с automation |
| Mock | dev only | ✅ | Structured log через logger |

Конфиг: `src/lib/notifications/notification-config.ts`

Env:
- `LEAD_NOTIFICATIONS_URGENT_ONLY` — только urgent/high
- `LEAD_NOTIFICATIONS_SEND_LOW_PRIORITY` — отправлять low (default: true)
- `LEAD_NOTIFICATIONS_SEND_SPAM` — default: false

---

## 8–10. Adapters

- `src/lib/notifications/adapters/telegram.ts`
- `src/lib/notifications/adapters/email.ts`
- `src/lib/notifications/adapters/webhook.ts`
- `src/lib/notifications/adapters/mock.ts`

Timeout: 8 секунд. Ошибки → `success: false` + error code.

---

## 11. Readable notification summary

`formatLeadNotificationSummary()` — `src/lib/leads/lead-notification-formatters.ts`

Telegram: `formatTelegramLeadMessage()` — контакт, суть, источник, UTM, SLA, шаг, ссылка на CRM.

Email: subject + body через `formatEmailSubject` / `formatEmailBody`.

---

## 12. Automation status в Lead

```typescript
automation?: {
  priority?: LeadPriority
  sla?: LeadSLA
  recommendedAction?: LeadNextAction
  notifications?: LeadAutomationNotification[]
  lastAutomationAt?: string
  processingType?: LeadProcessingType
}
```

Сохраняется в file store через `applyLeadAutomation()`.

---

## 13. Timeline events

Новые типы: `automation_started`, `notification_sent`, `notification_failed`, `sla_assigned`, `sla_overdue` (TODO для cron).

---

## 14. Dashboard updates

- Метрики: срочные, просроченные, без следующего шага.
- Фильтры: priority, group=overdue|urgent.
- Таблица: колонки приоритет, SLA deadline.
- Карточка: `LeadAutomationPanel` — priority, SLA, уведомления, recommended action.
- Badges: `LeadPriorityBadge`, `OverdueBadge`, `NotificationStatusBadge`.

---

## 15. Overdue logic

Вычисляется при загрузке dashboard (`enrichLeadSLA` в `getAllLeads`).

Фильтр: `/dashboard/leads?group=overdue`

Scheduled reminders — TODO (Этап 17).

---

## 16. Автоматические задачи

Одна активная `nextAction` на лид, создаётся системой при automation.

Тип `LeadTask` подготовлен для будущего task manager.

---

## 17. Notification preferences

См. `notification-config.ts`. Spam не отправляется. Urgent-only mode через env.

---

## 18. Error handling

- Lead saved → user sees success всегда (кроме storage failure).
- Notification failed → warning в dashboard + logger, не в UI клиента.
- Webhook timeout → controlled error, не блокирует pipeline.

---

## 19. Business hours TODO

`DEFAULT_BUSINESS_HOURS` — timezone Asia/Irkutsk, disabled. Перенос SLA на рабочее время — будущий этап.

---

## 20. Автоответ клиенту TODO

`CLIENT_AUTO_REPLY.enabled = false`. Не отправлять без согласия и настроенных каналов.

---

## 21. Обновления API /api/leads

POST flow:
1. validate
2. persistLead → StoredLead
3. handleNewLeadAutomation
4. return `{ ok, leadId, message }` — без channel/errors

---

## 22. Env-переменные

```env
# Уведомления
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
LEADS_NOTIFICATION_EMAIL=
RESEND_API_KEY=
EMAIL_FROM=leads@voytkevich-artel.ru
N8N_LEAD_NOTIFICATION_WEBHOOK_URL=
N8N_LEAD_WEBHOOK_URL=

# Политика
LEAD_NOTIFICATIONS_URGENT_ONLY=false
LEAD_NOTIFICATIONS_SEND_LOW_PRIORITY=true
LEAD_NOTIFICATIONS_SEND_SPAM=false

# Dashboard URL в уведомлениях
NEXT_PUBLIC_SITE_URL=https://voytkevich-artel.vercel.app

# CRM (Этап 15)
DASHBOARD_ACCESS_TOKEN=
LEADS_FILE_STORE=true
```

---

## 23. Manual test checklist

1. [ ] Отправить форму с сайта
2. [ ] Лид сохранился в `.data/leads.json`
3. [ ] Automation запустилась (timeline + automation block)
4. [ ] Priority и SLA назначены
5. [ ] Recommended action создан
6. [ ] Telegram (если env)
7. [ ] Email (если env)
8. [ ] Webhook (если env)
9. [ ] Без Telegram env — no crash, mock/warning
10. [ ] Webhook error — partial success
11. [ ] Honeypot/spam — без уведомлений
12. [ ] Dashboard overdue filter
13. [ ] Automation panel в карточке
14. [ ] User success при failed notification
15. [ ] Секреты не в client bundle

---

## 24. Что требует ручной настройки

- Telegram bot + chat ID
- Resend API key + verified domain
- n8n webhook workflow
- `NEXT_PUBLIC_SITE_URL` для ссылок в уведомлениях
- Supabase для production persistence на Vercel

---

## 25. Что переходит в Этап 17

- Dashboard аналитики: трафик, конверсии, CTA, lead quality по источникам
- Связь analytics events ↔ lead records
- Conversion rate по страницам
- Среднее время реакции менеджера
- SLA overdue analytics
- Отчёты 7/30/90 дней
- Business hours SLA
- Scheduled overdue reminders
- Client auto-reply (с согласием)

---

## Таблицы

### Тип лида → Priority / SLA / Action

| Тип | Priority | SLA | Recommended action |
|---|---|---|---|
| calculator | urgent/high | 15–30 мин | review-calculator |
| project | high | 30 мин | prepare-estimate |
| planner | normal/high | 30–120 мин | review-planner |
| lead-magnet | normal | 2 ч | send-lead-magnet / clarify-land |
| blog | normal | 2 ч | follow-up |
| service-page | high | 30 мин | call |
| case-like | high | 30 мин | prepare-estimate |
| objects-map | normal | 2 ч | clarify-land |
| callback | normal/low | 2–24 ч | call |

### SourceType → Summary → Уведомление → Шаг

| SourceType | Summary | Уведомление | Следующий шаг |
|---|---|---|---|
| calculator | Расчёт дома + параметры | Telegram/email/webhook | Разобрать расчёт |
| project-page | Проект + площадь | ✓ | Рассчитать проект |
| planner | Планировка + комнаты | ✓ | Разобрать планировку |
| lead-magnet | Лид-магнит + статья | ✓ | Отправить материал |
| service-page | Коммерческая страница | ✓ | Связаться |
| blog-post | Статья + интерес | ✓ | Follow-up |

### Риски

| Риск | Что может пойти не так | Как обработано |
|---|---|---|
| Notification fail | Менеджер не узнает о лиде | Dashboard warning + retry via n8n |
| No channels configured | Тишина | Mock in dev + dashboard warning |
| Vercel file store | Нет persistence | TODO Supabase |
| Telegram markdown | Broken formatting | escapeMarkdown |
| PII in logs | Утечка | logger masks phone |

---

## Проверки сборки

| Команда | Результат |
|---|---|
| `npm run build` | ✅ Успешно (2026-06-05) |

Исправлено: broken JSX в leads-list-client, missing filterLeads import, demo-leads automation structure.

---

## Файлы Этапа 16

| Файл | Назначение |
|---|---|
| `src/lib/leads/lead-automation.ts` | Orchestrator |
| `src/lib/leads/lead-routing.ts` | Priority + processing type |
| `src/lib/leads/lead-sla.ts` | SLA + overdue |
| `src/lib/leads/lead-tasks.ts` | Recommended actions |
| `src/lib/leads/lead-notification-formatters.ts` | Telegram/email text |
| `src/lib/leads/lead-notifications.ts` | Re-exports |
| `src/lib/notifications/notification-service.ts` | Send all channels |
| `src/lib/notifications/notification-config.ts` | Policy |
| `src/lib/notifications/adapters/*` | Channel adapters |
| `src/lib/logger.ts` | Server logger |
| `src/components/dashboard/leads/lead-automation-panel.tsx` | UI block |
