# Этап 15 — Админка лидов / простой CRM-кабинет

Дата: 2026-06-05  
Сайт: https://voytkevich-artel.vercel.app/

Предыдущий этап: [stage-14-crm-lead-analytics-context-system.md](./stage-14-crm-lead-analytics-context-system.md)

---

## 1. Что сделано на Этапе 15

- Внутренний CRM-кабинет `/dashboard` для просмотра и обработки заявок с полным контекстом.
- Список лидов с фильтрами, поиском, сортировкой и пагинацией.
- Карточка лида с резюме, контекстными блоками, комментариями, следующим шагом и историей.
- Статусы, readiness, leadScore, переходы между статусами.
- Метрики dashboard: новые, горячие, за 7/30 дней, по источникам.
- File store (`.data/leads.json`) + demo-лиды только в dev.
- Защита через middleware + `DASHBOARD_ACCESS_TOKEN`.
- API: `GET/PATCH /api/leads`, `POST /api/leads/[id]/comments`, `GET /api/dashboard/export`.
- CSV-экспорт (только для авторизованных запросов).

---

## 2. Роль CRM-кабинета

1. **Не терять заявки** — единый список всех лидов с сайта.
2. **Быстро понимать суть** — резюме за 10–20 секунд.
3. **Видеть контекст** — калькулятор, проект, планировщик, лид-магнит и т.д.
4. **Управлять статусом** — pipeline от «Новый» до «Выиграно/Потерян».
5. **Базовая аналитика** — какие страницы и CTA дают лиды.

---

## 3. Структура dashboard

```
/dashboard              — обзор, метрики, последние лиды
/dashboard/leads        — список лидов
/dashboard/leads/[id]   — карточка лида
/dashboard/login        — вход по токену
```

---

## 4. Доступ и безопасность

| Механизм | Описание |
|---|---|
| `DASHBOARD_ACCESS_TOKEN` | Env-переменная; совпадает с токеном при входе |
| Cookie `dashboard_token` | Устанавливается POST `/api/dashboard/auth` |
| Middleware | Защищает `/dashboard/*` (кроме login) и GET/PATCH API лидов |
| Dev без token | В development доступ открыт, если token не задан |
| Production без token | Доступ закрыт (401 / redirect на login) |

### Что нужно сделать перед production

1. Задать **`DASHBOARD_ACCESS_TOKEN`** в Vercel env (длинный случайный секрет).
2. Подключить **Supabase** или другую БД для персистентного хранения лидов.
3. Рассмотреть **Supabase Auth / NextAuth** вместо shared token для нескольких менеджеров.
4. Не добавлять ссылку на dashboard в публичное меню.
5. Ограничить CSV export только авторизованным пользователям (реализовано через middleware).

---

## 5. Страницы

| Страница | URL | Назначение | Статус |
|---|---|---|---|
| Обзор | `/dashboard` | Метрики, последние лиды, источники | ✅ |
| Список лидов | `/dashboard/leads` | Таблица, фильтры, поиск | ✅ |
| Карточка лида | `/dashboard/leads/[leadId]` | Полный контекст, действия | ✅ |
| Вход | `/dashboard/login` | Авторизация по токену | ✅ |

---

## 6. Модель лида

Расширение `Lead` → `StoredLead` в `src/types/lead.ts`:

- `id`, `status`, `comments[]`, `timeline[]`, `nextAction`
- `lostReason` (optional)
- `assignedTo` (optional, TODO для multi-user auth)
- `isDemo` — флаг demo-данных

CRM-поля добавлены к существующей модели Этапа 14 без breaking changes для форм.

---

## 7. Статусы лида

Файл: `src/lib/leads/lead-status.ts`

| Status | Label | Группа |
|---|---|---|
| `new` | Новый | новые |
| `qualified` | Квалифицирован | в работе |
| `contacted` | Связались | в работе |
| `in_discussion` | В обсуждении | в работе |
| `estimate_requested` | Нужна смета | смета |
| `proposal_sent` | КП отправлено | КП |
| `won` | Сделка выиграна | успех |
| `lost` | Потерян | потеряно |
| `spam` | Спам | спам |

Разрешённые переходы описаны в `LEAD_STATUS_TRANSITIONS`.

---

## 8. Readiness и leadScore

- **hot / warm / cold / unknown** — из `lead.qualification.readiness` (Этап 14).
- **leadScore** — числовой скор из `lead-score.ts`.
- В списке и карточке — badge + число.

---

## 9. Список лидов

Колонки: дата, имя, телефон, статус, готовность, score, источник, интерес, CTA, следующий шаг.

Фильтры (query params):

- `status`, `readiness`, `sourceType`, `search`
- `group=new|hot|estimate` — быстрые группы из навигации

Сортировка: новые сверху (default).

---

## 10. Карточка лида

Приоритет блоков:

1. Header (контакт, статус, кнопки звонка/копирования)
2. Быстрое резюме (`generateLeadSummary`)
3. Следующий шаг + смена статуса
4. Контекстные карточки
5. Квалификация и UTM
6. Комментарии
7. История (timeline)
8. Raw payload (accordion)

Кнопка **«Скопировать резюме»** — `formatLeadForManager(lead)`.

---

## 11. Контекстные блоки

| Компонент | Данные | Файл |
|---|---|---|
| ProjectContextCard | project.* | `lead-context-cards.tsx` |
| CalculatorContextCard | calculator.* | |
| PlannerContextCard | planner.* | |
| LeadMagnetContextCard | leadMagnet.* | |
| ServiceContextCard | service.* | |
| BlogContextCard | blog.* | |
| CaseContextCard | case.* | |
| ObjectMapContextCard | objectMap.* | |

Пустые блоки не рендерятся.

---

## 12. Фильтры и поиск

Файл: `src/lib/leads/lead-filters.ts`

- `filterLeads()` — status, readiness, sourceType, search, hasBudget, hasLand, etc.
- `filterByStatusGroup()` — new / hot / estimate
- `paginateLeads()` — page, limit
- `leadsToCsv()` — экспорт

---

## 13. Комментарии менеджера

```typescript
type LeadComment = {
  id: string
  leadId: string
  text: string
  authorId?: string
  authorName?: string
  createdAt: string
}
```

- POST `/api/leads/[id]/comments`
- Сохраняется в file store (demo-лиды — только in-memory на сессию)
- Добавляется событие в timeline

---

## 14. Следующий шаг

```typescript
type LeadNextAction = {
  type: "call" | "message" | "prepare-estimate" | "send-proposal" | "follow-up" | "meeting" | "no-action"
  at?: string
  comment?: string
}
```

PATCH `/api/leads/[id]` с `{ nextAction }`.

---

## 15. История лида

```typescript
type LeadTimelineEvent = {
  id: string
  leadId: string
  type: "created" | "status_changed" | "comment_added" | "next_action_set" | "manager_assigned" | "lead_updated"
  title: string
  description?: string
  createdAt: string
  createdBy?: string
}
```

---

## 16. Метрики dashboard

Файл: `src/lib/leads/lead-metrics.ts` — `getLeadMetrics(leads)`

- total, newCount, hotCount, warmCount, coldCount
- last7DaysCount, last30DaysCount
- bySourceType, byStatus, byRequestType
- averageLeadScore, hotShare

---

## 17. CSV export

`GET /api/dashboard/export` — требует auth.

Поля: createdAt, name, phone, status, readiness, leadScore, sourceType, projectTitle, budget, comment и др.

Raw payload не экспортируется.

---

## 18. Mock/demo режим

- `src/data/demo-leads.ts` — 4 demo-лида с разными источниками.
- Показываются только в **development** при пустом store (`shouldIncludeDemoLeads`).
- Badge **Demo data** в dashboard shell.
- `isDemo: true` — изменения не персистятся в file store.

---

## 19. API / dashboard service

| Endpoint | Method | Назначение |
|---|---|---|
| `/api/leads` | GET | Список лидов (фильтры) |
| `/api/leads` | POST | Создание (Этап 14, публичный) |
| `/api/leads/[id]` | GET | Один лид |
| `/api/leads/[id]` | PATCH | status, nextAction, patch |
| `/api/leads/[id]/comments` | POST | Комментарий |
| `/api/dashboard/auth` | POST/DELETE | Login/logout |
| `/api/dashboard/export` | GET | CSV |

Facade: `src/lib/leads/lead-service.ts`

---

## 20. Backend adapters

| Adapter | Файл | Статус |
|---|---|---|
| File store | `adapters/file-store.ts` | ✅ `.data/leads.json` |
| Supabase | `adapters/supabase.ts` | TODO (SQL готов) |
| Webhook/Telegram | `lead-storage.ts` | ✅ доставка при POST |
| Demo | `data/demo-leads.ts` | ✅ dev only |

`persistLead()` (Этап 14) → `saveLeadRecord()` + webhook/telegram.

---

## 21. Empty / loading / error states

- Empty: «Заявок пока нет» + подсказка про формы/webhook
- No filter results: «По выбранным фильтрам лидов нет»
- Missing storage: предупреждение в dashboard shell
- 404 на несуществующий leadId

---

## 22. Mobile UX

- Таблица лидов → карточки на `md` breakpoint
- Фильтры — grid, stack на mobile
- Карточка лида — одноколоночный layout

Приоритет — desktop/laptop.

---

## 23. Что требует подключения backend

| Функция | Без backend |
|---|---|
| Просмотр реальных лидов | Нужен file store или Supabase |
| Персистентные комментарии | File store / Supabase |
| Multi-instance (Vercel) | File store не подходит — нужен Supabase |

---

## 24. Что требует авторизации перед production

- `DASHBOARD_ACCESS_TOKEN` обязателен
- CSV export закрыт middleware
- Рекомендуется полноценный auth для команды

---

## 25. Manual test checklist

1. [ ] Открыть `/dashboard`
2. [ ] Открыть `/dashboard/leads`
3. [ ] Проверить список лидов
4. [ ] Проверить empty state (без demo)
5. [ ] Фильтр по статусу
6. [ ] Фильтр по sourceType
7. [ ] Поиск по имени/телефону
8. [ ] Открыть карточку лида
9. [ ] Contact block
10. [ ] Lead summary
11. [ ] Project / calculator / planner / lead magnet context
12. [ ] UTM block
13. [ ] Сменить статус
14. [ ] Добавить комментарий
15. [ ] Назначить следующий шаг
16. [ ] Скопировать резюме
17. [ ] Mobile view
18. [ ] Dashboard не в публичном меню
19. [ ] Production: auth обязателен
20. [ ] Demo data не в production

---

## 26. Что переходит в Этап 16

- Уведомления менеджеру (Telegram, email, n8n)
- Readable lead summary в уведомлениях
- SLA для hot/new лидов
- Автозадачи (позвонить, отправить смету)
- Pipeline уведомлений
- Статус «просрочен следующий шаг»
- Аналитика скорости реакции
- Интеграция amoCRM / Битрикс

---

## Компоненты

| Компонент | Назначение | Где используется |
|---|---|---|
| `DashboardShell` | Layout, nav, warnings | Все CRM-страницы |
| `LeadsListClient` | Фильтры, поиск, таблица | `/dashboard/leads` |
| `LeadsTable` | Таблица/карточки лидов | List + overview |
| `LeadDetailClient` | Карточка, actions | `/dashboard/leads/[id]` |
| `LeadMetricsCards` | Метрики | `/dashboard` |
| `LeadBadges` | Status, readiness, source | Table + detail |
| `LeadContextCards` | Контекстные блоки | Detail |

---

## Действия и backend

| Действие | Backend нужен? | Статус | Комментарий |
|---|---|---|---|
| Просмотр лидов | да | ✅ | File store + demo dev |
| Изменение статуса | да | ✅ | PATCH, demo in-memory |
| Комментарии | да | ✅ | POST comments |
| Следующий шаг | да | ✅ | PATCH nextAction |
| Экспорт CSV | да + auth | ✅ | Middleware protected |
| Назначение менеджера | да + auth users | TODO | Поле есть |
| Supabase sync | да | TODO | SQL migration готов |

---

## Риски

| Риск | Почему важно | Что сделать |
|---|---|---|
| Dashboard без auth | ПДн публичны | `DASHBOARD_ACCESS_TOKEN` |
| File store на Vercel | Нет персистентности | Supabase |
| Только webhook | Нет истории в админке | Дублировать в БД |
| Shared token | Один пароль на всех | Supabase Auth |
| Demo в prod | Ложные заявки | `shouldIncludeDemoLeads` только dev |

---

## Проверки сборки

| Команда | Результат |
|---|---|
| `npm run build` | ✅ Успешно (2026-06-05). TypeScript OK, 138 страниц. |
| `npm run lint` | ⚠️ Pre-existing errors в других файлах (counter, header, planner). Новые dashboard-файлы без ошибок. |

Исправлено при сборке Этапа 15:
- TypeScript: `stored.timeline` possibly undefined в `lead-repository.ts`
- Edge/client: убран `crypto` из `auth.ts` (совместимость с middleware и client)
- Suspense boundary для `useSearchParams` на `/dashboard/login`

---

## Env variables

```env
DASHBOARD_ACCESS_TOKEN=...      # обязателен для production
LEADS_FILE_STORE=true           # default, .data/leads.json
N8N_LEAD_WEBHOOK_URL=...        # доставка заявок
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
SUPABASE_URL=...                # TODO
SUPABASE_SERVICE_ROLE_KEY=...   # TODO
```
