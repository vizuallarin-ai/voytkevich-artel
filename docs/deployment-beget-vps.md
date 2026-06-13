# Деплой на Beget VPS — stroistroy.ru

**VPS IP:** `159.194.212.82`  
**Домен:** Beget → `stroistroy.ru`  
**Уведомления:** Yandex-почта (Telegram не обязателен)

Полная версия: [deployment-vps-stroistroy.md](./deployment-vps-stroistroy.md)

---

## 0. Перед деплоем

Актуальный код должен быть на GitHub:

```bash
git push origin master
```

---

## 1. DNS на Beget (сделать первым)

Панель Beget → **Домены и поддомены** → `stroistroy.ru` → **DNS-записи**

Удалите или замените старые A-записи, указывающие на хостинг/Vercel.

| Тип | Имя | Значение | TTL |
|-----|-----|----------|-----|
| A | @ | `159.194.212.82` | 300 |
| A | www | `159.194.212.82` | 300 |

Проверка (с вашего ПК, через 5–30 мин):

```bash
ping stroistroy.ru
nslookup stroistroy.ru
```

---

## 2. SSH на VPS

```bash
ssh root@159.194.212.82
```

Пароль — из панели Beget → VPS.

---

## 3. Подготовка сервера

```bash
apt update && apt upgrade -y
apt install -y docker.io docker-compose-v2 nginx certbot python3-certbot-nginx git ufw

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

Если сборка падает по RAM (мало памяти):

```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## 4. Проект и `.env`

```bash
git clone https://github.com/vizuallarin-ai/voytkevich-artel.git /opt/stroistroy
cd /opt/stroistroy
cp .env.example .env
nano .env
```

### Минимум для запуска (без почты — лиды только в CRM)

```env
NEXT_PUBLIC_SITE_URL=https://stroistroy.ru
NODE_ENV=production
LEADS_STORAGE=file
ANALYTICS_STORAGE=file
DASHBOARD_ACCESS_TOKEN=<openssl rand -hex 32>
```

Токен:

```bash
openssl rand -hex 32
```

Telegram **можно не заполнять** — заявки будут в `/dashboard/leads`.

---

## 5. Yandex-почта (когда подключите)

1. Beget → домен → **Почта** → подключить **Yandex 360** / перенести MX на Yandex  
2. Создать ящик, например `info@stroistroy.ru`  
3. Yandex ID → **Пароли приложений** → SMTP  
4. В `.env` на VPS:

```env
LEADS_NOTIFICATION_EMAIL=info@stroistroy.ru
EMAIL_FROM=info@stroistroy.ru
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@stroistroy.ru
SMTP_PASS=ваш-пароль-приложения
```

Перезапуск:

```bash
cd /opt/stroistroy && docker compose up -d
```

---

## 6. Запуск Docker

```bash
cd /opt/stroistroy
docker compose up -d --build
docker compose logs -f web
```

Проверка:

```bash
curl -I http://127.0.0.1:3000
```

---

## 7. nginx + SSL

```bash
cp /opt/stroistroy/deploy/nginx.stroistroy.ru.conf /etc/nginx/sites-available/stroistroy.ru
ln -sf /etc/nginx/sites-available/stroistroy.ru /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

certbot --nginx -d stroistroy.ru -d www.stroistroy.ru
```

---

## 8. Проверка

| Шаг | URL / действие |
|-----|----------------|
| Сайт | https://stroistroy.ru |
| Заявка | /calculator → форма |
| CRM | /dashboard/login → токен из `.env` |
| Лид | /dashboard/leads |
| Почта | письмо на info@… после настройки SMTP |

---

## 9. Обновления

```bash
cd /opt/stroistroy && git pull && docker compose up -d --build
```

---

## CRM

- **URL:** https://stroistroy.ru/dashboard/login  
- **Пароль:** `DASHBOARD_ACCESS_TOKEN` из `.env`

Без Telegram и без почты заявки **не теряются** — они в CRM на VPS (volume `.data/`).
