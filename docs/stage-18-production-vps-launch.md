# Этап 18 — Production launch на VPS (stroistroy.ru)

**Статус:** следующий этап после 17  
**Домен:** https://stroistroy.ru  
**Инфра:** VPS + Docker + nginx + Let's Encrypt  
**Примечание:** прежний «Этап 18 CRO/A/B» перенесён в backlog growth — сейчас приоритет запуск production.

---

## Цель

Вывести сайт на собственный VPS с персистентным хранилищем лидов и аналитики, подключить домен, уведомления и внешнюю Metrika — без потери данных между деплоями.

---

## Структура этапа 18

| Блок | Задачи | Статус |
|------|--------|--------|
| **1. VPS + Docker** | Docker, compose, volume `.data`, nginx, SSL | ✅ в репо + скрипты |
| **2. Домен** | stroistroy.ru → A-record на VPS, www → apex | ✅ Beget |
| **3. Env production** | `.env`, token, SMTP/Telegram | ⏳ SMTP/Metrika — ключи владельца |
| **4. Smoke test** | `/api/health`, форма → CRM | ✅ health; форма после деплоя |
| **5. Metrika / GA** | `NEXT_PUBLIC_YM_ID` | ⏳ нужен ID счётчика |
| **6. Контент** | Published кейс, verified объект | контент владельца |
| **7. Мониторинг** | Uptime, бэкап `.data` | ✅ `scripts/backup-stroistroy-data.sh` + cron |

---

## Что уже закрыто в коде (хвосты 1–17)

- Домен по умолчанию: `stroistroy.ru` в `brand.ts` / `NEXT_PUBLIC_SITE_URL`
- File store на VPS (persistent volume) — основной режим `LEADS_STORAGE=file`
- Supabase adapters для лидов и analytics (опционально)
- Rate limit на `/api/leads` и `/api/analytics/events`
- SLA с учётом рабочих часов (`LEADS_SLA_BUSINESS_HOURS=true`)
- Калькулятор читает `budget` / `priceMax` из URL
- `lead_magnet_viewed` через IntersectionObserver
- Resend email в notification pipeline
- Docker + nginx конфиги в `/deploy`

---

## Что остаётся контентом (не код)

- PDF смета / лид-магниты — ручная отправка до автоматизации
- 4 noindex-статьи блога — обновить или снять
- Published кейсы и verified объекты на карте
- amoCRM / Битрикс — через n8n webhook при необходимости

---

## Backlog после запуска (бывший CRO-этап)

Не блокирует launch — отдельный growth-спринт:

- A/B тесты CTA и форм
- Feature flags
- CSV export analytics
- CRM sidebar admin UI (без шапки сайта)
- `/api/health` для мониторинга
- `scripts/vps-update.sh`, `backup-stroistroy-data.sh`, `rotate-crm-token.sh`
- Страницы с трафиком и низкой конверсией

---

## Быстрый чеклист launch

1. VPS: Ubuntu 22+, Docker, docker compose
2. `git clone` → `cp .env.example .env` → заполнить secrets
3. `docker compose up -d --build`
4. nginx + certbot по `deploy/nginx.stroistroy.ru.conf`
5. DNS A `@` и `www` → IP VPS
6. Тест: заявка с `/calculator` → `/dashboard/leads`
7. Бэкап: cron `tar` volume `stroistroy-data` или Supabase

Подробно: [deployment-vps-stroistroy.md](./deployment-vps-stroistroy.md)
