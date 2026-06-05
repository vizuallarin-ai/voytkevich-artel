import type { BlogPost } from "@/types/blog";

const author = "Строительная артель Александра Войткевича";

/** Устаревшие материалы — noindex, заменены новыми статьями Этапа 10 */
export const legacyNoindexPosts: BlogPost[] = [
  {
    slug: "stoimost-stroitelstva-2026",
    title: "Сколько стоит построить дом в 2026 году в Иркутске",
    h1: "Сколько стоит построить дом в 2026 году в Иркутске",
    excerpt: "Материал устарел — актуальная версия без фиктивных цен за м².",
    shortAnswer: "Актуальная статья: «Сколько стоит построить дом в Иркутске» — с честным разбором без псевдоточных цен.",
    content: `
Материал снят с индексации: в нём были ориентиры за м², которые могут вводить в заблуждение без контекста комплектации.

Читайте актуальную версию: [Сколько стоит построить дом в Иркутске](/blog/skolko-stoit-postroit-dom-v-irkutske).

Или сразу [рассчитайте предварительный ориентир](/calculator?source=blog&cluster=cost).
    `.trim(),
    coverImage:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&h=630&q=80",
    category: "Стоимость строительства",
    categorySlug: "cost",
    clusterId: "cost",
    intent: "commercial",
    funnelStage: "hot",
    priority: "low",
    status: "needs-update",
    publishedAt: "2026-02-15",
    updatedAt: "2026-05-01",
    readTime: 3,
    author,
    noindex: true,
    needsRegularUpdate: true,
    seo: {
      title: "Сколько стоит построить дом в Иркутске (архив)",
      description: "Материал обновлён — см. актуальную статью о стоимости строительства дома.",
    },
    relatedPosts: ["skolko-stoit-postroit-dom-v-irkutske"],
    heroCTA: { label: "Актуальная статья", href: "/blog/skolko-stoit-postroit-dom-v-irkutske" },
  },
  {
    slug: "sravnenie-tehnologij",
    title: "Каркас, газобетон или брус: сравнение технологий",
    h1: "Каркас, газобетон или брус: сравнение технологий",
    excerpt: "Материал заменён расширенной версией без фиксированных цен за м².",
    shortAnswer: "Актуальное сравнение — в статье «Брус, каркас или газобетон».",
    content: `
Эта версия снята с индексации из‑за конкретных цен за м² без контекста комплектации.

Актуальное сравнение: [Брус, каркас или газобетон](/blog/brus-karkas-ili-gazobeton).
    `.trim(),
    coverImage:
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&h=630&q=80",
    category: "Материалы и технологии",
    categorySlug: "materials",
    clusterId: "comparisons",
    intent: "comparison",
    funnelStage: "warm",
    priority: "low",
    status: "needs-update",
    publishedAt: "2025-12-10",
    updatedAt: "2026-05-05",
    readTime: 2,
    author,
    noindex: true,
    seo: {
      title: "Сравнение технологий строительства (архив)",
      description: "Актуальное сравнение бруса, каркаса и газобетона — в новой статье блога.",
    },
    relatedPosts: ["brus-karkas-ili-gazobeton"],
    heroCTA: { label: "Читать актуальное сравнение", href: "/blog/brus-karkas-ili-gazobeton" },
  },
  {
    slug: "ipoteka-na-izhs",
    title: "Ипотека на строительство дома: как получить в 2026",
    h1: "Ипотека на строительство дома: как получить в 2026",
    excerpt: "Материал заменён версией без обещаний по банкам и ставкам.",
    shortAnswer: "Актуальная статья — «Строительство дома в ипотеку: что подготовить».",
    content: `
Предыдущая версия содержала конкретные банки и обобщения по одобрению — мы её сняли с индексации.

Актуальный материал: [Строительство дома в ипотеку: что подготовить](/blog/stroitelstvo-doma-v-ipoteku-chto-podgotovit).

Коммерческая страница: [строительство в ипотеку](/stroitelstvo-doma-v-ipoteku).
    `.trim(),
    coverImage:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&h=630&q=80",
    category: "Ипотека и документы",
    categorySlug: "mortgage-documents",
    clusterId: "mortgage",
    intent: "informational",
    funnelStage: "warm",
    priority: "low",
    status: "needs-update",
    publishedAt: "2025-11-05",
    updatedAt: "2026-05-10",
    readTime: 2,
    author,
    noindex: true,
    needsRegularUpdate: true,
    seo: {
      title: "Ипотека на строительство дома (архив)",
      description: "Актуальный материал о подготовке к строительству дома в ипотекu.",
    },
    relatedPosts: ["stroitelstvo-doma-v-ipoteku-chto-podgotovit"],
    heroCTA: { label: "Актуальная статья", href: "/blog/stroitelstvo-doma-v-ipoteku-chto-podgotovit" },
  },
];

/** Обновлённые legacy-статьи с полной моделью Этапа 10 */
export const legacyUpgradedPosts: BlogPost[] = [
  {
    slug: "kak-vybrat-dom",
    title: "Как выбрать проект дома: 7 критериев",
    h1: "Как выбрать проект дома: 7 критериев",
    excerpt:
      "Площадь, ориентация, технология и бюджет — на что смотреть до подписания договора.",
    shortAnswer:
      "Выбирайте проект после вводных по участку и сценарию жизни — не по картинке. Сравните площадь, материал, инженерию и прозрачность сметы.",
    content: `
## 1. Определите реальную площадь

Не закладывайте «про запас» более 20% — каждый лишний метр стоит на стройке и в эксплуатации.

## 2. Ориентация по солнцу

Гостиная и детские — на юг и юго-восток. Техпомещения — на север.

## 3. Технология

Сравните [брус, каркас и газобетон](/blog/brus-karkas-ili-gazobeton) под ваш участок и бюджет — «лучшего для всех» нет.

## 4. Инженерия сразу

Закладывайте электрику, отопление и вентиляцию на этапе проекта — переделки обходятся дороже.

## 5. Смета с разбивкой

Требуйте детализированную [смету по этапам](/blog/smeta-na-stroitelstvo-doma-iz-chego-sostoit), а не одну цифру «под ключ».

## 6. Сроки в договоре

Фиксируйте календарный график с промежуточными актами — см. [процесс](/process).

## 7. Репутация подрядчика

Смотрите реальные объекты и прозрачность этапов — [как выбрать подрядчика](/blog/kak-vybrat-podryadchika-dlya-stroitelstva-doma).

## Следующий шаг

[Каталог проектов](/catalog) · [планировщик](/planirovka?source=blog&cluster=planning) · [калькулятор](/calculator?source=blog&cluster=projects).
    `.trim(),
    coverImage:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&h=630&q=80",
    category: "Планировки и проекты",
    categorySlug: "planning-projects",
    clusterId: "projects",
    intent: "informational",
    funnelStage: "warm",
    priority: "high",
    status: "published",
    publishedAt: "2026-03-01",
    updatedAt: "2026-05-12",
    readTime: 8,
    author,
    badge: "Поможет выбрать проект",
    seo: {
      title: "Как выбрать проект дома — 7 критериев",
      description: "Критерии выбора проекта загородного дома: площадь, материал, смета, подрядчик.",
    },
    faqs: [
      {
        question: "С чего начать — каталог или планировщик?",
        answer: "Если есть понимание площади — каталог. Если нужно собрать зонирование — планировщик, затем проект.",
      },
      {
        question: "Можно ли взять типовой проект без адаптации?",
        answer: "Можно, но посадку и инженерию лучше проверить под участок до старта.",
      },
    ],
    relatedServicePages: ["/catalog", "/proektirovanie-domov", "/planirovka"],
    relatedPosts: ["kak-vybrat-proekt-doma-pod-uchastok", "odnoetazhnyy-ili-dvuhetazhnyy-dom"],
    heroCTA: { label: "Подобрать проект", href: "/catalog" },
  },
  {
    slug: "oshibki-pri-stroitelstve",
    title: "Ошибки при строительстве дома, которые дорого обходятся",
    h1: "Ошибки при строительстве дома, которые дорого обходятся",
    excerpt: "Типичные ошибки заказчиков: геология, проект, смета, подрядчик и контроль этапов.",
    shortAnswer:
      "Дорогие ошибки чаще связаны с участком, сметой и отсутствием проекта — не только с «дешёвым подрядчиком».",
    content: `
## Почему ошибки дорогие

Переделка фундамента, инженерии или планировки на стройке стоит кратно дороже, чем подготовка до старта.

## 1. Экономия на геологии

Без данных об участке тип фундамента — догадка. [Что проверить на участке](/blog/chto-proverit-na-uchastke-pered-stroitelstvom).

## 2. Нет проекта под участок

Типовая картинка без посадки ведёт к изменениям на стройке. [Каталог](/catalog) + [адаптация](/proektirovanie-domov).

## 3. Смета без разбивки

Одна строка «под ключ» скрывает риски. [Как читать смету](/blog/kak-chitat-smetu-na-dom).

## 4. Изменения по ходу

Каждое изменение после фундамента умножает стоимость. Зафиксируйте планировку в [планировщике](/planirovka).

## 5. Выбор только по цене

[Как выбрать подрядчика](/blog/kak-vybrat-podryadchika-dlya-stroitelstva-doma) — смотрите этапы и договор.

## 6. Нет контроля этапов

Фотоотчёты и акты — не формальность. [Процесс](/process) · [удалённый контроль](/blog/kak-kontrolirovat-stroitelstvo-doma-udalenno).

## Чек-лист

- [ ] Участок проверен
- [ ] Проект согласован
- [ ] Смета по разделам
- [ ] Договор с этапами
- [ ] План приёмки

## Следующий шаг

[Разобрать свой случай](#blog-lead) или [рассчитать ориентир](/calculator?source=blog&cluster=mistakes).
    `.trim(),
    coverImage:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&h=630&q=80",
    category: "Ошибки и разборы",
    categorySlug: "mistakes",
    clusterId: "mistakes",
    intent: "informational",
    funnelStage: "warm",
    priority: "high",
    status: "published",
    publishedAt: "2026-01-20",
    updatedAt: "2026-05-07",
    readTime: 9,
    author,
    badge: "Ошибки",
    seo: {
      title: "Ошибки при строительстве дома — Иркутск",
      description: "Дорогие ошибки заказчиков и как снизить риски при строительстве дома.",
    },
    faqs: [
      {
        question: "Какая ошибка самая дорогая?",
        answer: "Часто — неправильный фундамент из‑за отсутствия данных об участке.",
      },
      {
        question: "Можно ли исправить ошибки на стройке?",
        answer: "Можно, но это дороже и дольше. Лучше зафиксировать вводные до старта.",
      },
    ],
    relatedServicePages: ["/stroitelstvo-domov-pod-klyuch-irkutsk", "/smeta-na-stroitelstvo-doma", "/calculator"],
    relatedPosts: ["kak-vybrat-podryadchika-dlya-stroitelstva-doma"],
    leadMagnetId: "mistakes-checklist",
    heroCTA: { label: "Разобрать мой случай", href: "#blog-lead" },
  },
  {
    slug: "planirovka-doma-s-chego-nachat",
    title: "Планировка дома: с чего начать",
    h1: "Планировка дома: с чего начать",
    excerpt: "Сценарии жизни, зонирование и ориентация — как не ошибиться с планировкой.",
    shortAnswer:
      "Начните со сценариев жизни семьи, затем зонирование и ориентация по сторонам света — до выбора проекта из каталога.",
    content: `
## Начните с сценариев жизни

Утренний маршрут: спальня → санузел → кухня. Вечерний: гостиная → терраса. Чем короче пути — тем удобнее дом.

## Зонирование

Дневная, ночная и техническая зоны. Ночную зону — подальше от улицы.

## Стороны света

- Кухня — восток
- Гостиная — юг/юго-запад
- Спальни — север/восток

## Инструменты

[Планировщик](/planirovka?source=blog&cluster=planning) · [каталог](/catalog) · [планировка для семьи](/blog/planirovka-doma-dlya-semi-s-detmi).

## Следующий шаг

Соберите черновик в планировщике и сравните с готовыми проектами.
    `.trim(),
    coverImage:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&h=630&q=80",
    category: "Планировки и проекты",
    categorySlug: "planning-projects",
    clusterId: "planning",
    intent: "informational",
    funnelStage: "warm",
    priority: "medium",
    status: "published",
    publishedAt: "2026-04-10",
    updatedAt: "2026-05-09",
    readTime: 8,
    author,
    seo: {
      title: "Планировка дома — с чего начать",
      description: "Принципы планировки: зонирование, ориентация, сценарии жизни.",
    },
    faqs: [
      {
        question: "Нужен ли архитектор сразу?",
        answer: "Можно начать с планировщика и каталога, затем адаптировать проект под участок.",
      },
    ],
    relatedServicePages: ["/planirovka", "/proektirovanie-domov", "/catalog"],
    relatedPosts: ["planirovka-doma-dlya-semi-s-detmi", "odnoetazhnyy-ili-dvuhetazhnyy-dom"],
    leadMagnetId: "layout-review",
    heroCTA: { label: "Собрать планировку", href: "/planirovka?source=blog&cluster=planning" },
  },
  {
    slug: "fundament-pod-dom-v-sibiri",
    title: "Какой фундамент выбрать для дома в Сибири",
    h1: "Какой фундамент выбрать для дома в Сибири",
    excerpt: "Лента, плита, сваи — почему выбор зависит от геологии, а не от советов соседа.",
    shortAnswer:
      "Тип фундамента уточняется после анализа участка и проекта. Без геологии любой выбор — риск.",
    content: `
## Геология — первый шаг

В Иркутской области встречаются разные грунты — поведение у них разное. [Что проверить на участке](/blog/chto-proverit-na-uchastke-pered-stroitelstvom).

## Ленточный фундамент

Универсальный вариант при стабильных грунтах. Глубина заложения — по расчёту и нормам для региона.

## Монолитная плита

Распределяет нагрузку — часто рассматривают на пучинистых грунтах. Дороже ленты, но снижает риск неравномерной осадки.

## Свайный фундамент

На слабых и обводнённых грунтах. Совместимость с материалом дома проверяют в проекте.

## Ошибки

- выбор «как у соседа»;
- старт без геологии;
- экономия на проекте фундамента.

Подробнее: [Какой фундамент выбрать для частного дома](/blog/kakoy-fundament-vybrat-dlya-chastnogo-doma).

## Следующий шаг

[Рассчитать дом с учётом участка](/calculator?source=blog&cluster=foundation-land) · [область](/stroitelstvo-domov-v-irkutskoy-oblasti).
    `.trim(),
    coverImage:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&h=630&q=80",
    category: "Фундамент и участок",
    categorySlug: "foundation-land",
    clusterId: "foundation",
    intent: "informational",
    funnelStage: "warm",
    priority: "medium",
    status: "published",
    publishedAt: "2026-03-25",
    updatedAt: "2026-05-06",
    readTime: 7,
    author,
    seo: {
      title: "Фундамент для дома в Иркутске и Сибири",
      description: "Выбор фундамента для частного дома: геология, типы, ошибки.",
    },
    faqs: [
      {
        question: "Можно ли выбрать фундамент без геологии?",
        answer: "Можно получить ориентир, но финальное решение — после данных об участке.",
      },
    ],
    relatedServicePages: ["/stroitelstvo-domov-v-irkutskoy-oblasti", "/calculator", "/proektirovanie-domov"],
    relatedPosts: ["kakoy-fundament-vybrat-dlya-chastnogo-doma", "chto-proverit-na-uchastke-pered-stroitelstvom"],
    leadMagnetId: "land-checklist",
    heroCTA: { label: "Проверить вводные участка", href: "/stroitelstvo-domov-v-irkutskoy-oblasti" },
  },
];
