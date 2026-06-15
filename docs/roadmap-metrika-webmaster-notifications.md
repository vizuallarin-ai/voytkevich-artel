# Дорожная карта: Метрика, Вебмастер, уведомления (Telegram / SMTP)

Пошаговая инструкция для **stroistroy.ru** на VPS Beget (`/opt/stroistroy`).

**Кто что делает**

| Блок | Где настраивается | Кто |
|------|-------------------|-----|
| Яндекс.Метрика | Яндекс + `.env` на VPS + rebuild | Вы + deploy |
| Яндекс.Вебмастер | webmaster.yandex.ru + DNS Beget | Вы |
| Telegram | BotFather + `.env` на VPS | Вы |
| SMTP | Beget/Yandex почта + `.env` на VPS | Вы (опционально) |

**Рекомендуемый порядок:** Метрика → Вебмастер → Telegram (или SMTP) → smoke-test.

---

## Карта файлов проекта

### Где прописываются ключи (production)

| Файл | Роль | В git? |
|------|------|--------|
| **`/opt/stroistroy/.env`** на VPS | **Главный файл** — все секреты и ID | ❌ Никогда |
| **`.env.example`** в репозитории | Шаблон переменных (без секретов) | ✅ |
| **`docker-compose.yml`** | Подключает `env_file: .env` к контейнеру | ✅ |
| **`Dockerfile`** | Сборка Next.js — см. ⚠️ про `NEXT_PUBLIC_*` ниже | ✅ |

> Локально на Windows ключи **не нужны**, если не тестируете отправку писем/бота. Для prod — только `.env` на VPS.

### Где ключи читаются в коде

| Переменная | Файл(ы) | Назначение |
|------------|---------|------------|
| `NEXT_PUBLIC_YM_ID` | `src/lib/analytics.ts`, `src/components/analytics/ya-metrika.tsx`, `src/app/api/health/route.ts` | Счётчик Метрики + `reachGoal` |
| `NEXT_PUBLIC_GA_ID` | `src/lib/analytics/events.ts` | Google Analytics (опционально) |
| `NEXT_PUBLIC_SITE_URL` | `src/lib/seo.ts`, sitemap, canonical, ссылки в письмах | Должен быть `https://stroistroy.ru` |
| `TELEGRAM_BOT_TOKEN` | `src/lib/notifications/adapters/telegram.ts` | Telegram Bot API |
| `TELEGRAM_CHAT_ID` | `src/lib/notifications/adapters/telegram.ts` | Куда слать заявки |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | `src/lib/notifications/adapters/email.ts` | Yandex SMTP |
| `LEADS_NOTIFICATION_EMAIL` | `email.ts`, `notification-config.ts` | Кому приходит письмо |
| `EMAIL_FROM` | `email.ts` | От кого (обычно `info@stroistroy.ru`) |
| `RESEND_API_KEY` | `email.ts` | Альтернатива SMTP (если не Yandex) |
| `DASHBOARD_ACCESS_TOKEN` | `src/lib/dashboard/auth.ts` | Вход в CRM |

Шаблон всех переменных: **`.env.example`** (строки 4–60).

---

## ⚠️ Важно: Docker и `NEXT_PUBLIC_YM_ID`

Переменные с префиксом **`NEXT_PUBLIC_`** в Next.js попадают в **клиентский JS при сборке** (`npm run build` внутри Docker).

**Недостаточно** только добавить ID в `.env` и сделать `docker compose restart` — нужен **rebuild**:

```bash
cd /opt/stroistroy
docker compose up -d --build
```

Если после rebuild счётчик не появился в исходном коде страницы — проверьте, что `NEXT_PUBLIC_YM_ID` был в `.env` **до** команды `--build`.

Проверка на VPS:

```bash
curl -s http://127.0.0.1:3000/ | grep -o 'mc.yandex.ru/metrika/tag.js' || echo "Метрика не в HTML — нужен rebuild с YM_ID в .env"
```

---

# Блок 1. Яндекс.Метрика

**Цель:** счётчик на всех страницах + цели конверсий (`reachGoal`).

**Время:** ~20–30 минут.

## Шаг 1.1 — Создать счётчик

1. Откройте [metrika.yandex.ru](https://metrika.yandex.ru/) под аккаунтом, которому доверяете доступ к аналитике.
2. **Добавить счётчик**.
3. Параметры:
   - **Адрес сайта:** `https://stroistroy.ru`
   - **Автоматические цели:** можно включить (дополнительно к нашим JS-целям)
   - **Вебвизор:** по желанию (полезно для CRO, больше нагрузка)
   - **Кросс-домен:** не нужен, если один домен
4. Сохраните. Скопируйте **номер счётчика** (только цифры, например `123456789`).

## Шаг 1.2 — Записать ID в `.env` на VPS

На сервере (Beget → SSH или веб-консоль):

```bash
cd /opt/stroistroy
nano .env
```

Добавьте или измените строку:

```env
NEXT_PUBLIC_YM_ID=123456789
```

Замените `123456789` на ваш реальный ID.

Убедитесь, что также задано:

```env
NEXT_PUBLIC_SITE_URL=https://stroistroy.ru
```

Сохраните (`Ctrl+O`, Enter, `Ctrl+X`).

## Шаг 1.3 — Пересобрать контейнер

```bash
cd /opt/stroistroy
docker compose up -d --build
```

Подождите 1–3 минуты.

## Шаг 1.4 — Проверить, что счётчик работает

**A. Health API** (если задеплоена свежая версия):

```bash
curl -s https://stroistroy.ru/api/health | python3 -m json.tool
```

Ожидается:

```json
"analytics": {
  "yandexMetrika": true,
  "googleAnalytics": false
}
```

**B. В браузере**

1. Откройте `https://stroistroy.ru` в режиме инкognito.
2. DevTools → Network → фильтр `metrika` — должен грузиться `tag.js`.
3. Или «Просмотр кода страницы» → поиск `mc.yandex.ru`.

**C. В интерфейсе Метрики**

Через 15–30 минут: **Отчёты → Стандартные → Посещаемость** — должны появиться визиты.

## Шаг 1.5 — Настроить цели в Метрике (рекомендуется)

Сайт шлёт цели через `ym(ID, "reachGoal", "<имя>")`. Список имён — **`src/lib/analytics/conversion-goals.ts`**.

| ID цели (как в коде) | Человекочитаемое | Когда срабатывает |
|----------------------|------------------|-------------------|
| `form_submit` | Любая заявка | Успешная отправка формы |
| `callback_request` | Заявка на звонок | Главная |
| `calculator_submit` | Калькулятор | `/calculator` |
| `planner_submit` | Планировщик | `/planirovka` |
| `project_request` | Заявка по проекту | Карточка каталога |
| `lead_magnet_submit` | Лид-магнит | LeadMagnetForm |
| `service_page_submit` | Коммерческая страница | SEO-услуги |
| `blog_submit` | Блог | Форма в статье |
| `case_like_request` | Похожий дом | Кейс |
| `objects_map_request` | Карта объектов | `/objects-map` |
| `catalog_project_selection` | Подбор проекта | Каталог |
| `estimate_request` | Запрос сметы | Лид-магнит сметы |
| `mortgage_request` | Ипотека | Ипотечные формы |

**В Метрике:** Настройки → **Цели** → **Добавить цель** → тип **«JavaScript-событие»** → **Идентификатор цели** = имя из таблицы (например `calculator_submit`).

Минимальный набор для старта:

1. `form_submit`
2. `calculator_submit`
3. `project_request`

## Шаг 1.6 — Тестовая конверсия

1. Откройте `/calculator`, отправьте тестовую заявку (реальный или тестовый телефон).
2. В Метрике → **Отчёты → Конверсии** (или «В real-time») — через несколько минут должна появиться цель.

---

# Блок 2. Яндекс.Вебмастер

**Цель:** подтвердить права на домен, отправить sitemap, следить за индексацией.

**Время:** ~15–20 минут (+ до 24 ч на DNS).

## Шаг 2.1 — Добавить сайт

1. [webmaster.yandex.ru](https://webmaster.yandex.ru/)
2. **Добавить сайт** → `https://stroistroy.ru`
3. Выберите способ подтверждения.

## Шаг 2.2 — Подтверждение домена (выберите один способ)

### Способ A — DNS TXT (рекомендуется, не требует деплоя)

1. Вебмастер покажет запись вида `yandex-verification: xxxxx`.
2. Beget → **Домены → stroistroy.ru → DNS** → добавить **TXT**:
   - Имя: `@` (или пусто)
   - Значение: строка из Вебмастера
3. Подождать 5–60 минут → **Проверить** в Вебмастере.

### Способ B — Meta-тег в `<head>`

1. Вебмастер даст `<meta name="yandex-verification" content="..." />`.
2. Добавить в **`src/app/layout.tsx`** внутрь `<head>` (или через `metadata` в Next.js).
3. Commit → deploy → проверить в Вебмастере.

> Если не хотите трогать код — используйте **DNS TXT**.

### Способ C — HTML-файл

1. Скачать файл вида `yandex_xxxxx.html`.
2. Положить в **`public/yandex_xxxxx.html`** в репозитории.
3. Deploy → проверить `https://stroistroy.ru/yandex_xxxxx.html`.

## Шаг 2.3 — Добавить зеркало www (если используется)

Если `www.stroistroy.ru` открывается:

- Добавьте и его в Вебмастер **или** настройте 301 с www на apex (уже должно быть через nginx/certbot).
- Главное зеркало: **`https://stroistroy.ru`** без www.

## Шаг 2.4 — Отправить sitemap

1. Вебмастер → **Индексирование → Файлы Sitemap**.
2. Добавить URL: **`https://stroistroy.ru/sitemap.xml`**
3. Статус должен стать «OK» / «Обработан».

Проверка вручную:

```bash
curl -I https://stroistroy.ru/sitemap.xml
```

Ожидается **HTTP 200** и XML с URL `https://stroistroy.ru/...`.

> Если sitemap отдаёт **500** — сначала починить на сервере (логи: `docker compose logs web`), иначе Вебмастер не примет карту.

## Шаг 2.5 — robots.txt

Проверка:

```bash
curl https://stroistroy.ru/robots.txt
```

Ожидается:

```
User-Agent: *
Allow: /
Disallow: /api/

Sitemap: https://stroistroy.ru/sitemap.xml
```

Файл генерируется из **`src/app/robots.ts`**.

## Шаг 2.6 — Регион и настройки (после подтверждения)

1. **География:** Иркутск / Иркутская область (если доступно в настройках).
2. **Главное зеркало:** `https://stroistroy.ru`.
3. Раз в неделю смотреть: **Страницы в поиске**, **Исключённые**, **Диагностика**.

## Шаг 2.7 — Связка с Метрикой

В Вебмастере: **Настройки → Связь с Метрикой** → привязать счётчик из Блока 1.

---

# Блок 3. Уведомления о заявках

**Цель:** менеджер узнаёт о лиде сразу после отправки формы.

Логика в коде: **`src/lib/notifications/notification-service.ts`** → Telegram и/или Email.

Можно использовать **только Telegram**, **только Email**, или **оба**.

---

## Вариант A — только Telegram (быстрее всего)

**Время:** ~10 минут.  
**Файлы с ключами:** только **`/opt/stroistroy/.env`** на VPS.

### A.1 — Создать бота

1. Telegram → [@BotFather](https://t.me/BotFather) → `/newbot`.
2. Имя: например `Stroistroy Leads`.
3. Username: например `stroistroy_leads_bot`.
4. Сохраните **токен** вида `7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxx`.

### A.2 — Узнать chat_id

**Личный чат с ботом:**

1. Напишите боту `/start`.
2. Откройте в браузере (подставьте свой токен):

   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```

3. Найдите `"chat":{"id":123456789` — это **TELEGRAM_CHAT_ID**.

**Группа менеджеров:**

1. Добавьте бота в группу, дайте право писать.
2. Любое сообщение в группе → снова `getUpdates`.
3. ID группы обычно **отрицательный** (например `-1001234567890`).

### A.3 — Записать в `.env` на VPS

```bash
cd /opt/stroistroy
nano .env
```

```env
TELEGRAM_BOT_TOKEN=7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TELEGRAM_CHAT_ID=123456789
```

SMTP можно **не заполнять**.

### A.4 — Перезапуск (rebuild не обязателен для Telegram)

```bash
docker compose up -d
```

Telegram читается **на сервере в runtime**, не требует `NEXT_PUBLIC_`.

### A.5 — Проверка

```bash
curl -s https://stroistroy.ru/api/health | grep telegram
```

Ожидается `"telegram": true`.

Отправьте тестовую заявку на `/calculator` → сообщение в Telegram + лид в `/dashboard/leads`.

---

## Вариант B — Email через Yandex SMTP (Beget)

**Время:** ~30–60 минут (зависит от настройки почты на домене).  
**Когда имеет смысл:** нужна почта `info@stroistroy.ru` + дублирование заявок на email.

Подробнее также: **`docs/deployment-beget-vps.md`**, раздел 5.

### B.1 — Почта на домене

1. Beget → **Домены → stroistroy.ru → Почта**.
2. Подключить **Yandex 360** / перенести MX на Yandex (инструкция Beget).
3. Создать ящик **`info@stroistroy.ru`** (или другой).

### B.2 — Пароль приложения Yandex

1. [id.yandex.ru](https://id.yandex.ru/) → **Безопасность → Пароли приложений**.
2. Создать пароль для **«Почта» / SMTP**.
3. Скопировать пароль (показывается один раз).

### B.3 — Записать в `.env` на VPS

```env
LEADS_NOTIFICATION_EMAIL=info@stroistroy.ru
EMAIL_FROM=info@stroistroy.ru
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@stroistroy.ru
SMTP_PASS=ваш-пароль-приложения
```

Код отправки: **`src/lib/notifications/adapters/email.ts`**.

### B.4 — Перезапуск

```bash
cd /opt/stroistroy
docker compose up -d
```

### B.5 — Проверка

```bash
curl -s https://stroistroy.ru/api/health
```

Ожидается:

```json
"notifications": {
  "configured": true,
  "smtp": true,
  "telegram": false
}
```

Тестовая заявка → письмо на `LEADS_NOTIFICATION_EMAIL`.

---

## Вариант C — Telegram + SMTP вместе

Заполните **оба** блока переменных в `.env`. При новой заявке уйдут оба канала (если один упал — второй может сработать).

```env
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
LEADS_NOTIFICATION_EMAIL=info@stroistroy.ru
EMAIL_FROM=info@stroistroy.ru
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@stroistroy.ru
SMTP_PASS=...
```

---

## Вариант D — только CRM (без Telegram и без SMTP)

Если `.env` без Telegram и без email — заявки **сохраняются** в file store и видны в **`/dashboard/leads`**, но мгновенных push-уведомлений не будет.

Минимум для CRM:

```env
DASHBOARD_ACCESS_TOKEN=<длинный-случайный-токен>
LEADS_STORAGE=file
```

---

# Сводная таблица переменных `.env`

| Переменная | Обязательно? | Пример | Rebuild Docker? |
|------------|--------------|--------|-----------------|
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://stroistroy.ru` | ✅ при смене |
| `NEXT_PUBLIC_YM_ID` | Рекомендуется | `123456789` | ✅ **обязательно** |
| `NEXT_PUBLIC_GA_ID` | Нет | | ✅ при добавлении |
| `DASHBOARD_ACCESS_TOKEN` | ✅ для CRM | `openssl rand -hex 32` | ❌ restart достаточно |
| `TELEGRAM_BOT_TOKEN` | Если Telegram | от BotFather | ❌ |
| `TELEGRAM_CHAT_ID` | Если Telegram | `123456789` | ❌ |
| `LEADS_NOTIFICATION_EMAIL` | Если SMTP | `info@stroistroy.ru` | ❌ |
| `EMAIL_FROM` | Если SMTP | `info@stroistroy.ru` | ❌ |
| `SMTP_*` | Если SMTP | см. выше | ❌ |
| `LEADS_STORAGE` | ✅ | `file` | ❌ |
| `ANALYTICS_STORAGE` | ✅ | `file` | ❌ |

---

# Чеклист после настройки

```bash
# На VPS или локально к prod
curl -s https://stroistroy.ru/api/health
curl -I https://stroistroy.ru/sitemap.xml
curl https://stroistroy.ru/robots.txt
bash scripts/verify-production.sh https://stroistroy.ru   # если скрипт на сервере
```

| # | Проверка | OK если |
|---|----------|---------|
| 1 | Метрика в HTML | `mc.yandex.ru/metrika/tag.js` на главной |
| 2 | Health → Metrika | `"yandexMetrika": true` |
| 3 | Вебмастер | Сайт подтверждён, sitemap принят |
| 4 | Тест-заявка | Лид в `/dashboard/leads` |
| 5 | Telegram | Сообщение в chat |
| 6 | SMTP | Письмо на inbox |
| 7 | Цель Метрики | `calculator_submit` после теста калькулятора |

---

# Troubleshooting

| Проблема | Причина | Решение |
|----------|---------|---------|
| Метрика не грузится | `NEXT_PUBLIC_YM_ID` добавили после build | `docker compose up -d --build` |
| Health без блока `analytics` | Старая версия на VPS | `git pull && docker compose up -d --build` |
| Telegram не шлёт | Неверный chat_id / бот не /start | `getUpdates`, проверить токен |
| SMTP auth failed | Обычный пароль вместо app password | Пароль приложения Yandex |
| Sitemap 500 | Ошибка на сервере при генерации | `docker compose logs web --tail 100` |
| Письма в спаме | Новый домен | SPF/DKIM в DNS Yandex/Beget |

---

# Что можно попросить Cursor сделать в коде (без ваших паролей)

- Починить **500 на sitemap.xml**
- Добавить **`Disallow: /dashboard/`** в `src/app/robots.ts`
- Добавить **meta yandex-verification** в `layout.tsx` (если выберете способ B)
- Прокинуть **`NEXT_PUBLIC_*` в Dockerfile** как build-args (чтобы rebuild был надёжнее)
- Расширить **`scripts/verify-production.sh`** проверками Metrika/sitemap

**Не может без вас:** создать счётчик Метрики, подтвердить DNS в Beget, создать бота, пароль SMTP.

---

# Связь с SEO-этапами

| Действие | Когда |
|----------|-------|
| Метрика + Вебмастер | **Сейчас** — baseline до programmatic SEO |
| Wordstat (ручной) | Перед публикацией geo-страниц (этапы 19–20) |
| Wordstat import | Этап 28 |
| Sitemap automation для mass content | Этап 29 |
