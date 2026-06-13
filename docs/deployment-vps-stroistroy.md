# Деплой на VPS — stroistroy.ru

Production-инструкция для Next.js приложения с persistent storage лидов и аналитики.

---

## Требования

- VPS: 2 vCPU, 2 GB RAM (минимум), Ubuntu 22.04+
- Домен `stroistroy.ru` с доступом к DNS
- Docker + Docker Compose

---

## 1. Подготовка сервера

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin nginx certbot python3-certbot-nginx git
sudo usermod -aG docker $USER
```

---

## 2. Клонирование и env

```bash
git clone <repo-url> /opt/stroistroy
cd /opt/stroistroy
cp .env.example .env
nano .env
```

Обязательно задайте:

| Переменная | Назначение |
|------------|------------|
| `NEXT_PUBLIC_SITE_URL` | `https://stroistroy.ru` |
| `DASHBOARD_ACCESS_TOKEN` | длинный случайный токен |
| `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` | уведомления о заявках |
| `LEADS_STORAGE=file` | file store на volume (рекомендуется на VPS) |
| `ANALYTICS_STORAGE=file` | аналогично |

Опционально: `RESEND_API_KEY`, `NEXT_PUBLIC_YM_ID`, Supabase keys.

---

## 3. Запуск Docker

```bash
docker compose up -d --build
docker compose logs -f web
```

Приложение слушает `127.0.0.1:3000`. Данные в volume `stroistroy-data` → `/app/.data/`.

---

## 4. nginx + SSL

```bash
sudo cp deploy/nginx.stroistroy.ru.conf /etc/nginx/sites-available/stroistroy.ru
sudo ln -s /etc/nginx/sites-available/stroistroy.ru /etc/nginx/sites-enabled/
sudo nginx -t
sudo certbot --nginx -d stroistroy.ru -d www.stroistroy.ru
sudo systemctl reload nginx
```

---

## 5. DNS

| Запись | Значение |
|--------|----------|
| A `@` | IP VPS |
| A `www` | IP VPS (или CNAME на apex) |

Проверка: `curl -I https://stroistroy.ru`

---

## 6. CRM dashboard

URL: `https://stroistroy.ru/dashboard/login`  
Токен: значение `DASHBOARD_ACCESS_TOKEN` из `.env`

---

## 7. Обновление деплоя

```bash
cd /opt/stroistroy
git pull
docker compose up -d --build
```

Volume сохраняет `.data/` между пересборками.

---

## 8. Бэкап

File store:

```bash
docker run --rm -v stroistroy_stroistroy-data:/data -v $(pwd):/backup alpine \
  tar czf /backup/stroistroy-data-$(date +%F).tar.gz -C /data .
```

Cron (ежедневно):

```cron
0 3 * * * cd /opt/stroistroy && docker run --rm -v stroistroy_stroistroy-data:/data -v /opt/backups:/backup alpine tar czf /backup/stroistroy-$(date +\%F).tar.gz -C /data .
```

---

## 9. Supabase (опционально)

Если нужна БД вместо file store:

1. Применить `docs/supabase-leads-migration.sql` и `docs/supabase-analytics-events-migration.sql`
2. В `.env`: `LEADS_STORAGE=supabase`, `ANALYTICS_STORAGE=supabase`
3. Перезапуск: `docker compose up -d`

---

## 10. Smoke test

- [ ] Главная открывается по HTTPS
- [ ] `sitemap.xml` и `robots.txt` с доменом stroistroy.ru
- [ ] Форма на `/calculator` → лид в `/dashboard/leads`
- [ ] Telegram-уведомление пришло
- [ ] `/dashboard/analytics` показывает `page_viewed`
- [ ] Demo-данные **не** отображаются в production

---

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| Лиды не сохраняются | Проверить volume: `docker volume inspect stroistroy_stroistroy-data` |
| Dashboard 401 | Задать `DASHBOARD_ACCESS_TOKEN`, перелогиниться |
| 502 nginx | `docker compose ps`, проверить логи `web` |
| Sitemap с wrong URL | `NEXT_PUBLIC_SITE_URL=https://stroistroy.ru` при build |
