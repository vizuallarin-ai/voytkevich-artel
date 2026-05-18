# NordHaus — премиальный сайт строительства домов

Production-ready Next.js приложение для компании по строительству малоэтажных домов под ключ (Иркутск).

## Стек

- **Next.js 16** (App Router, SSG/SSR)
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** — reveal, stagger, gallery
- **Lenis** — smooth scroll
- **Radix UI** — accordion, slider, dialog-ready
- **CMS adapter** — локальные данные, готово к Sanity / Strapi / Payload

## Запуск

```bash
npm install
cp .env.example .env.local
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## Структура

```
src/
├── app/                    # Страницы (App Router)
│   ├── page.tsx            # Главная
│   ├── catalog/            # Каталог + [slug]
│   ├── about/              # О компании
│   ├── process/            # Этапы стройки
│   ├── calculator/         # Калькулятор
│   ├── blog/               # SEO-блог + [slug]
│   ├── faq/
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── animations/         # Reveal, counter, magnetic
│   ├── catalog/            # Карточки, фильтры
│   ├── project/            # Галерея, планировки
│   ├── home/               # Hero + калькулятор
│   ├── forms/              # Лид-форма, квиз
│   ├── widgets/            # Sticky CTA, мессенджеры
│   ├── seo/                # JSON-LD, breadcrumbs
│   └── ui/                 # Design system
├── data/                   # Mock CMS (projects, blog, faq)
├── lib/
│   ├── cms/                # Adapter pattern
│   ├── calculator.ts
│   ├── filters.ts
│   └── seo.ts
├── hooks/                  # favorites, recently viewed, autosave
└── types/
```

## Ключевые фичи

| Раздел | Реализация |
|--------|------------|
| Hero | Cinematic bg, калькулятор площади, CTA, stats |
| Каталог | SEO URL-параметры, фильтры, сортировка, избранное, сравнение |
| Проект | Fullscreen gallery, интерактивные планировки, комплектации, FAQ |
| О компании | Команда, timeline, карта объектов |
| Калькулятор | Полный расчёт + лид на PDF |
| SEO | Schema.org, sitemap, meta, breadcrumbs, блог SILO |
| CRO | Квиз, sticky CTA, WhatsApp/Telegram, многошаговая форма |

## CMS

Подключение внешней CMS — замените `localCMS` в `src/lib/cms/local.ts` на адаптер Sanity/Strapi/Payload, реализовав интерфейс `CMSAdapter`.

## Дизайн

Палитра: sand, graphite, off-white, wood accents.  
Принципы: воздух, крупная типографика, минимализм, glassmorphism.

## Лицензия

Private — NordHaus.
