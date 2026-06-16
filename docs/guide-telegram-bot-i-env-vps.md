# Telegram-бот с нуля + доступ к `.env` на VPS

**Сервер:** Beget VPS, папка проекта `/opt/stroistroy`  
**Сайт:** https://stroistroy.ru  

---

## Часть 1. Как зайти на VPS и открыть `.env`

### Вариант A — терминал в панели Beget (проще всего)

1. [beget.com](https://beget.com) → войти  
2. **Облако / VPS** → ваш сервер  
3. **Терминал / SSH в браузере / VNC**  
4. Должно появиться: `root@gdliefmcvm:~#`

### Вариант B — SSH с Windows

```text
ssh root@159.194.212.82
```

Пароль — из панели Beget → VPS → пароль root.

### Открыть `.env`

```bash
cd /opt/stroistroy
ls -la .env          # файл должен существовать
nano .env            # редактор
```

| Действие | Клавиши |
|----------|---------|
| Сохранить | **Ctrl+O** → Enter |
| Выйти | **Ctrl+X** |

Строки в `.env` **без кавычек**:

```env
TELEGRAM_BOT_TOKEN=7123456789:AAHxxxxxxxxxxxxxxxx
TELEGRAM_CHAT_ID=-1004302996579
```

После любых правок:

```bash
docker compose up -d --force-recreate
```

---

## Часть 2. Создать нового бота (с нуля)

### Шаг 1 — BotFather

1. Telegram → найти **@BotFather**  
2. `/newbot`  
3. Имя бота (отображаемое): `Stroistroy Заявки`  
4. Username (латиница, на `bot`): `stroistroy_leads_bot` (или свободный)  
5. BotFather пришлёт **токен** — скопируйте целиком:

```text
7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Шаг 2 — группа для заявок

1. Создайте **группу** в Telegram (не канал).  
2. **Добавьте бота** в группу (участники → добавить).  
3. Сделайте бота **администратором** (можно без лишних прав — достаточно «отправлять сообщения»).  
4. Напишите в группе: `@ваш_бот test` (упоминание важно).

### Шаг 3 — узнать chat_id группы

На VPS:

```bash
cd /opt/stroistroy
nano .env
```

Впишите **только токен** (пока без chat_id или со старым):

```env
TELEGRAM_BOT_TOKEN=ВАШ_НОВЫЙ_ТОКЕН
```

Сохраните, затем:

```bash
set -a && source .env && set +a

# webhook мешает — удалить
curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook?drop_pending_updates=true"

# снова напишите @бот test в группе, потом:
curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?limit=5"
```

В ответе найдите:

```json
"chat": {
  "id": -1004302996579,
  "title": "Заявки Stroistroy",
  "type": "supergroup"
}
```

Число **`id`** (с минусом!) — это `TELEGRAM_CHAT_ID`.

> **Не используйте** пример `-100XXXXXXXXXX` — только реальное число из `getUpdates`.

### Шаг 4 — записать в `.env`

```bash
nano /opt/stroistroy/.env
```

```env
TELEGRAM_BOT_TOKEN=7123456789:AAH...
TELEGRAM_CHAT_ID=-1004302996579
```

```bash
docker compose up -d --force-recreate

set -a && source .env && set +a
curl -sS -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{\"chat_id\":${TELEGRAM_CHAT_ID},\"text\":\"✅ Бот настроен — заявки stroistroy.ru\",\"disable_web_page_preview\":true}"
```

Ответ: `"ok":true` — проверьте группу.

### Шаг 5 — проверка с сайта

1. Откройте https://stroistroy.ru  
2. Отправьте тестовую заявку с главной  
3. В CRM: https://stroistroy.ru/dashboard/leads — карточка должна появиться  
4. В группе Telegram — уведомление  

---

## Частые ошибки

| Ошибка | Причина | Решение |
|--------|---------|---------|
| `chat not found` | Неверный chat_id или бот не в группе | `getUpdates`, id с **минусом** |
| `Unauthorized` | Неверный токен | Новый токен от BotFather |
| `result: []` в getUpdates | Webhook или нет сообщений | `deleteWebhook`, написать в группе |
| Заявка в CRM есть, в Telegram нет | Контейнер не перечитал .env | `--force-recreate` |
| В `.env` стоит `-100XXXXXXXXXX` | Скопирован пример из инструкции | Реальный id из getUpdates |

---

## Альтернатива: узнать id группы без getUpdates

1. Добавьте в группу [@getidsbot](https://t.me/getidsbot)  
2. Он пришлёт id чата  
3. Удалите бота из группы после настройки  

---

## Полезные команды

```bash
# что в .env (токен частично скрыт)
grep '^TELEGRAM_' /opt/stroistroy/.env

# health сайта
curl -sS https://stroistroy.ru/api/health | python3 -m json.tool

# логи контейнера
docker compose -f /opt/stroistroy/docker-compose.yml logs --tail=50 web
```
