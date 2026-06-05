import type { BlogPost } from "@/types/blog";

const author = "Строительная артель Александра Войткевича";
const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&h=630&q=80`;

/** Новые статьи Этапа 10 */
export const stage10Articles: BlogPost[] = [
  {
    slug: "skolko-stoit-postroit-dom-v-irkutske",
    title: "Сколько стоит построить дом в Иркутске",
    h1: "Сколько стоит построить дом в Иркутске",
    excerpt:
      "Предварительный ориентир: от чего зависит цена, почему без вводных нет точной суммы и как получить расчёт.",
    shortAnswer:
      "Точную стоимость без участка, проекта и комплектации назвать нельзя. Онлайн — предварительный диапазон; точная смета — после уточнения вводных.",
    content: `
## Короткий ответ

**Точной цены «под ключ» без вводных не существует.** Ориентир зависит от площади, материала, фундамента, инженерии, отделки и участка. [Калькулятор](/calculator?source=blog&cluster=cost) даёт предварительный диапазон; [смета](/smeta-na-stroitelstvo-doma) — после детализации.

## Почему нельзя назвать точную цену сразу

На одном участке и том же проекте смета может отличаться из‑за геологии, логистики, комплектации и инженерии. Цена за м² без состава работ часто вводит в заблуждение.

## Основные факторы стоимости

| Фактор | Как влияет |
|--------|------------|
| Площадь и этажность | Больше метров — больше работ и материалов |
| Материал стен | Брус, каркас, газобетон — разная логика сметы |
| Фундамент | Зависит от грунта и проекта |
| Кровля и окна | Конфигурация меняет бюджет |
| Инженерия | Отопление, электрика, вода |
| Отделка | «Под ключ» — разный набор работ |
| Участок | Удалённость, уклон, коммуникации |

## Примеры по площади — только как ориентир

- **До 100 м²** — компактные дома; бюджет сильнее зависит от комплектации.
- **100–150 м²** — популярный диапазон; [каталог 100–150 м²](/catalog/kategoriya/100-150-m2).
- **150–200 м²** — больше инженерии; нужна детальная смета.
- **200+ м²** — критичны проект и контроль этапов.

## Что часто не входит в «красивую цену»

Геология, подъезд, коммуникации, благоустройство, изменения проекта после старта.

## Как получить более точный расчёт

1. [Калькулятор](/calculator?source=blog&cluster=cost)
2. [Каталог](/catalog)
3. [Предварительная смета](/smeta-na-stroitelstvo-doma)
    `.trim(),
    coverImage: img("1600596542815-ffad4c1539a9"),
    category: "Стоимость строительства",
    categorySlug: "cost",
    clusterId: "cost",
    intent: "commercial",
    funnelStage: "hot",
    priority: "high",
    status: "published",
    publishedAt: "2026-05-01",
    updatedAt: "2026-05-01",
    readTime: 10,
    author,
    badge: "Для расчёта бюджета",
    needsRegularUpdate: true,
    seo: {
      title: "Сколько стоит построить дом в Иркутске — ориентир и расчёт",
      description:
        "От чего зависит стоимость дома в Иркутске: факторы, смета, предварительный расчёт без фиксированной цены.",
    },
    faqs: [
      {
        question: "Можно ли узнать точную стоимость дома онлайн?",
        answer:
          "Онлайн можно получить предварительный диапазон. Точная смета зависит от участка, проекта, фундамента, инженерии и комплектации.",
      },
      {
        question: "Почему у разных компаний разная цена за м²?",
        answer: "В «м²» входят разные работы. Сравнивайте сметы по разделам, а не только итог.",
      },
      {
        question: "Входит ли участок в стоимость?",
        answer: "Нет. Смета подрядчика — строительство на вашем участке, не покупка земли.",
      },
    ],
    relatedServicePages: ["/calculator", "/smeta-na-stroitelstvo-doma", "/doma-pod-klyuch-do-10-mln"],
    relatedProjectFilters: { sort: "featured" },
    relatedPosts: ["smeta-na-stroitelstvo-doma-iz-chego-sostoit", "dom-pod-klyuch-do-10-mln-chto-realno"],
    leadMagnetId: "budget-project-selection",
    heroCTA: { label: "Рассчитать стоимость дома", href: "/calculator?source=blog&cluster=cost" },
  },
  {
    slug: "smeta-na-stroitelstvo-doma-iz-chego-sostoit",
    title: "Смета на строительство дома: из чего состоит",
    h1: "Смета на строительство дома: из чего состоит",
    excerpt: "Разделы сметы, скрытые работы и как читать документ до договора.",
    shortAnswer:
      "Смета — детализированный список работ и материалов по этапам. Она важнее красивой цены за м².",
    content: `
## Что такое смета

**Смета** — перечень работ, материалов, объёмов и стоимости по разделам. Основа [договора](/process) и контроля.

## Разделы типичной сметы

- подготовка площадки;
- фундамент;
- коробка;
- кровля;
- окна и двери;
- инженерия;
- отделка;
- логистика.

Подробнее — [смета на строительство](/smeta-na-stroitelstvo-doma).

## Что часто не учитывают

Геология, подъезд, внешние коммуникации, изменения проекта.

## Как читать смету

Проверьте разделы, объёмы, материалы, резерв. Итог без детализации — повод задать вопросы.

## Следующий шаг

[Предварительная смета](/smeta-na-stroitelstvo-doma) · [калькулятор](/calculator?source=blog&cluster=estimate).
    `.trim(),
    coverImage: img("1454165804606-c3d57bc86b40"),
    category: "Смета, договор и контроль",
    categorySlug: "estimate-contract-control",
    clusterId: "estimate",
    intent: "informational",
    funnelStage: "warm",
    priority: "high",
    status: "published",
    publishedAt: "2026-05-02",
    readTime: 9,
    author,
    badge: "Важно перед сметой",
    seo: {
      title: "Смета на строительство дома: из чего состоит",
      description: "Разделы сметы, скрытые работы и как читать документ перед договором.",
    },
    faqs: [
      {
        question: "Можно ли получить точную смету онлайн?",
        answer: "Калькулятор даёт ориентир. Детальная смета — после уточнения участка и комплектации.",
      },
      {
        question: "Почему смета может измениться?",
        answer: "После геологии или уточнения проекта — при фиксации изменений до работ это нормально.",
      },
    ],
    relatedServicePages: ["/smeta-na-stroitelstvo-doma", "/calculator", "/stroitelstvo-domov-pod-klyuch-irkutsk"],
    relatedPosts: ["kak-chitat-smetu-na-dom", "skolko-stoit-postroit-dom-v-irkutske"],
    leadMagnetId: "estimate-example",
    heroCTA: { label: "Получить предварительную смету", href: "/smeta-na-stroitelstvo-doma" },
  },
  {
    slug: "dom-pod-klyuch-do-10-mln-chto-realno",
    title: "Дом под ключ до 10 млн ₽: что реально возможно",
    h1: "Дом под ключ до 10 млн ₽: что реально возможно",
    excerpt: "Честный разбор бюджета до 10 млн: площадь, комплектация и ограничения.",
    shortAnswer:
      "10 млн ₽ — ориентир для ряда проектов, но «под ключ» может означать разный набор работ. Точный ответ — в смете.",
    content: `
## Честный разбор

**10 миллионов — ориентир, не гарантия** для любого дома. Влияют площадь, материал, участок, инженерия, отделка.

## Площади и проекты

Смотрите [проекты до 10 млн](/catalog/kategoriya/do-10-mln) и [коммерческую страницу](/doma-pod-klyuch-do-10-mln).

## Что может не войти

Сложная геология, премиальная отделка, гараж/баня, удалённая логистика, изменения проекта.

## Следующий шаг

[Подбор под бюджет](/doma-pod-klyuch-do-10-mln) · [калькулятор](/calculator?source=blog&cluster=cost).
    `.trim(),
    coverImage: img("1613490493576-7fde63acd811"),
    category: "Стоимость строительства",
    categorySlug: "cost",
    clusterId: "cost",
    intent: "commercial",
    funnelStage: "hot",
    priority: "high",
    status: "published",
    publishedAt: "2026-05-03",
    readTime: 8,
    author,
    badge: "Для расчёта бюджета",
    needsRegularUpdate: true,
    seo: {
      title: "Дом под ключ до 10 млн ₽ — что реально возможно",
      description: "Разбор бюджета до 10 млн на дом в Иркутске без обещания фиксированной цены.",
    },
    faqs: [
      {
        question: "Реально ли построить дом под ключ до 10 млн?",
        answer: "Для ряда проектов — да. Точный ответ даёт смета после вводных.",
      },
    ],
    relatedServicePages: ["/doma-pod-klyuch-do-10-mln", "/calculator", "/smeta-na-stroitelstvo-doma"],
    relatedProjectFilters: { priceMax: 10_000_000, sort: "price-asc" },
    relatedPosts: ["skolko-stoit-postroit-dom-v-irkutske"],
    leadMagnetId: "budget-project-selection",
    heroCTA: { label: "Подобрать проект под бюджет", href: "/doma-pod-klyuch-do-10-mln" },
  },
  {
    slug: "odnoetazhnyy-ili-dvuhetazhnyy-dom",
    title: "Одноэтажный или двухэтажный дом: что выбрать",
    h1: "Одноэтажный или двухэтажный дом: что выбрать",
    excerpt: "Удобство, участок, фундамент и бюджет — без мифа «одноэтажный всегда дешевле».",
    shortAnswer:
      "Одноэтажный — без лестниц, двухэтажный — компактнее на участке. Что дешевле — только в смете с одинаковыми вводными.",
    content: `
## Короткий вывод

**Нет универсально лучшего варианта.**

## Одноэтажный

[Одноэтажные дома](/odnoetazhnye-doma-pod-klyuch) · [каталог](/catalog/kategoriya/odnoetazhnye). Плюсы: доступность, без лестниц. Минусы: больше пятно застройки.

## Двухэтажный

[Двухэтажные](/dvuhetazhnye-doma-pod-klyuch) · [каталог](/catalog/kategoriya/dvukhetazhnye). Плюсы: компактность, зонирование. Минусы: лестница, перекрытия.

## Сравнение

| Критерий | 1 этаж | 2 этажа |
|----------|--------|---------|
| Участок | Просторнее | Компактнее |
| Лестница | Не нужна | Нужна |
| Смета | Сравнивать целиком | Сравнивать целиком |

## Следующий шаг

[Планировщик](/planirovka?source=blog&cluster=planning) · [калькулятор](/calculator?source=blog&cluster=floors).
    `.trim(),
    coverImage: img("1600585154340-be6161a56a0c"),
    category: "Планировки и проекты",
    categorySlug: "planning-projects",
    clusterId: "floors",
    intent: "comparison",
    funnelStage: "warm",
    priority: "high",
    status: "published",
    publishedAt: "2026-05-04",
    readTime: 9,
    author,
    seo: {
      title: "Одноэтажный или двухэтажный дом — что выбрать",
      description: "Сравнение этажности: участок, бюджет, планировка.",
    },
    faqs: [
      {
        question: "Одноэтажный дом дешевле?",
        answer: "Не всегда. Сравнивайте полные сметы на одну полезную площадь.",
      },
    ],
    relatedServicePages: ["/odnoetazhnye-doma-pod-klyuch", "/dvuhetazhnye-doma-pod-klyuch", "/planirovka"],
    relatedProjectFilters: { floors: [1, 2] },
    relatedPosts: ["planirovka-doma-dlya-semi-s-detmi"],
    heroCTA: { label: "Собрать планировку", href: "/planirovka?source=blog&cluster=planning" },
  },
  {
    slug: "brus-karkas-ili-gazobeton",
    title: "Брус, каркас или газобетон: что выбрать для дома",
    h1: "Брус, каркас или газобетон: что выбрать для дома",
    excerpt: "Сравнение технологий для Иркутска без «лучшего материала для всех».",
    shortAnswer:
      "Выбор зависит от бюджета, участка, сценария жизни и комплектации. Сравните в калькуляторе с одинаковой площадью.",
    content: `
## Короткий вывод

**Нет материала «лучше для всех».**

## Брус

[Дома из бруса](/stroitelstvo-domov-iz-brusa) · [каталог](/catalog/kategoriya/iz-brusa).

## Каркас

[Каркасные дома](/karkasnye-doma-pod-klyuch) · [каталог](/catalog/kategoriya/karkasnye).

## Газобетон

[Дома из газобетона](/stroitelstvo-domov-iz-gazobetona) · [каталог](/catalog/kategoriya/iz-gazobetona).

## Таблица

| | Брус | Каркас | Газобетон |
|---|------|--------|-----------|
| Эстетика | Дерево | Зависит от отделки | Зависит от фасада |
| Скорость | Средняя | Часто быстрее | Средняя |
| Климат | Утепление, усадка | Пирог стены | Фасад, теплотехника |

## Следующий шаг

[Калькулятор](/calculator?source=blog&cluster=materials) · [сравнение материалов](#blog-lead).
    `.trim(),
    coverImage: img("1518780664697-55e3ad937233"),
    category: "Материалы и технологии",
    categorySlug: "materials",
    clusterId: "comparisons",
    intent: "comparison",
    funnelStage: "warm",
    priority: "high",
    status: "published",
    publishedAt: "2026-05-05",
    readTime: 11,
    author,
    badge: "Поможет выбрать материал",
    seo: {
      title: "Брус, каркас или газобетон — что выбрать",
      description: "Сравнение технологий строительства дома в Иркутске.",
    },
    faqs: [
      {
        question: "Какой материал самый дешёвый?",
        answer: "Зависит от комплектации. Сравните сметы с одинаковым составом работ.",
      },
    ],
    relatedServicePages: [
      "/stroitelstvo-domov-iz-brusa",
      "/karkasnye-doma-pod-klyuch",
      "/stroitelstvo-domov-iz-gazobetona",
    ],
    relatedPosts: ["skolko-stoit-postroit-dom-v-irkutske"],
    leadMagnetId: "material-comparison",
    heroCTA: { label: "Рассчитать дом из материала", href: "/calculator?source=blog&cluster=materials" },
  },
  {
    slug: "kakoy-fundament-vybrat-dlya-chastnogo-doma",
    title: "Какой фундамент выбрать для частного дома",
    h1: "Какой фундамент выбрать для частного дома",
    excerpt: "Плита, лента, сваи — почему выбор зависит от геологии и проекта.",
    shortAnswer:
      "Тип фундамента уточняется после анализа участка и проектных вводных. Совет соседа — не инженерное решение.",
    content: `
## Почему нельзя выбирать «как у всех»

Грунт, уклон, материал дома и этажность определяют тип фундамента.

## Варианты

- **Лента** — при стабильных грунтах
- **Плита** — при неравномерной нагрузке / пучинистых грунтах
- **Сваи** — при слабых грунтах (совместимость с проектом обязательна)

## Ошибки

Старт без геологии, экономия на проекте фундамента.

## Связанные материалы

[Что проверить на участке](/blog/chto-proverit-na-uchastke-pered-stroitelstvom) · [фундамент в Сибири](/blog/fundament-pod-dom-v-sibiri).

## Следующий шаг

[Проверить вводные](/stroitelstvo-domov-v-irkutskoy-oblasti) · [калькулятор](/calculator?source=blog&cluster=foundation-land).
    `.trim(),
    coverImage: img("1541888946425-d81bb19240f5"),
    category: "Фундамент и участок",
    categorySlug: "foundation-land",
    clusterId: "foundation",
    intent: "informational",
    funnelStage: "warm",
    priority: "high",
    status: "published",
    publishedAt: "2026-05-06",
    readTime: 8,
    author,
    seo: {
      title: "Какой фундамент выбрать для частного дома",
      description: "Выбор фундамента: геология, типы, ошибки.",
    },
    faqs: [
      {
        question: "Кто определяет тип фундамента?",
        answer: "Проектировщик на основе геологии и проекта дома.",
      },
    ],
    relatedServicePages: ["/stroitelstvo-domov-v-irkutskoy-oblasti", "/calculator", "/proektirovanie-domov"],
    relatedPosts: ["chto-proverit-na-uchastke-pered-stroitelstvom", "fundament-pod-dom-v-sibiri"],
    leadMagnetId: "land-checklist",
    heroCTA: { label: "Проверить вводные участка", href: "/stroitelstvo-domov-v-irkutskoy-oblasti" },
  },
  {
    slug: "chto-proverit-na-uchastke-pered-stroitelstvom",
    title: "Что проверить на участке перед строительством дома",
    h1: "Что проверить на участке перед строительством дома",
    excerpt: "Чек-лист до проекта и сметы: подъезд, коммуникации, геология, посадка.",
    shortAnswer:
      "Участок определяет фундамент, логистику и смету. Проверьте подъезд, границы, коммуникации и геологию до выбора проекта.",
    content: `
## Почему до сметы

Ошибки на этапе участка дороже всего.

## Чек-лист

1. Подъезд техники
2. Границы и отступы
3. Коммуникации или план подведения
4. Уклон и рельеф
5. Геология
6. Вода и подтопление
7. Посадка дома по сторонам света

## Следующий шаг

[Чек-лист участка](#blog-lead) · [область](/stroitelstvo-domov-v-irkutskoy-oblasti).
    `.trim(),
    coverImage: img("1500386266760-9692a2e0960e"),
    category: "Фундамент и участок",
    categorySlug: "foundation-land",
    clusterId: "land",
    intent: "informational",
    funnelStage: "warm",
    priority: "high",
    status: "published",
    publishedAt: "2026-05-06",
    readTime: 8,
    author,
    badge: "Перед покупкой участка",
    seo: {
      title: "Что проверить на участке перед строительством",
      description: "Чек-лист проверки участка перед строительством дома.",
    },
    faqs: [
      {
        question: "Можно ли начать без геологии?",
        answer: "Можно получить ориентир, но тип фундамента надёжнее выбирать после данных об участке.",
      },
    ],
    relatedServicePages: ["/stroitelstvo-domov-v-irkutskoy-oblasti", "/calculator", "/planirovka"],
    relatedPosts: ["kakoy-fundament-vybrat-dlya-chastnogo-doma"],
    leadMagnetId: "land-checklist",
    heroCTA: { label: "Получить чек-лист участка", href: "#blog-lead" },
  },
  {
    slug: "kak-vybrat-podryadchika-dlya-stroitelstva-doma",
    title: "Как выбрать подрядчика для строительства дома",
    h1: "Как выбрать подрядчика для строительства дома",
    excerpt: "Смета, этапы, договор и контроль — не только цена.",
    shortAnswer: "Сравнивайте состав работ, этапы, договор и прозрачность — не только цену за м².",
    content: `
## Не только по цене

Низкая цена часто означает другой состав работ.

## Что спросить

- [Смета](/smeta-na-stroitelstvo-doma) по разделам?
- Этапы в [договоре](/process)?
- Фотоотчёты?
- Что входит в «под ключ»?

## Следующий шаг

[Обсудить строительство](/stroitelstvo-domov-pod-klyuch-irkutsk) · [разобрать случай](#blog-lead).
    `.trim(),
    coverImage: img("1600607687939-ce8a6c25118c"),
    category: "Ошибки и разборы",
    categorySlug: "mistakes",
    clusterId: "mistakes",
    intent: "commercial",
    funnelStage: "warm",
    priority: "high",
    status: "published",
    publishedAt: "2026-05-07",
    readTime: 8,
    author,
    badge: "Ошибки",
    seo: {
      title: "Как выбрать подрядчика для строительства дома",
      description: "Критерии выбора подрядчика: смета, договор, этапы.",
    },
    faqs: [
      { question: "Достаточно ли сравнить итог?", answer: "Нет. Сравнивайте разделы сметы и комплектацию." },
    ],
    relatedServicePages: ["/about", "/process", "/smeta-na-stroitelstvo-doma"],
    relatedPosts: ["oshibki-pri-stroitelstve", "kak-chitat-smetu-na-dom"],
    heroCTA: { label: "Обсудить строительство", href: "#blog-lead" },
  },
  {
    slug: "kak-chitat-smetu-na-dom",
    title: "Как читать смету на строительство дома",
    h1: "Как читать смету на строительство дома",
    excerpt: "Разделы, объёмы, материалы и красные флаги.",
    shortAnswer: "Читайте смету по разделам: работы, материалы, объёмы, этапы.",
    content: `
## С чего начать

Найдите разделы: фундамент, коробка, кровля, инженерия, отделка.

## Красные флаги

- одна строка «под ключ»;
- нет инженерии;
- нет условий после геологии.

## Связанные материалы

[Из чего состоит смета](/blog/smeta-na-stroitelstvo-doma-iz-chego-sostoit) · [страница сметы](/smeta-na-stroitelstvo-doma).

## Следующий шаг

[Пример структуры сметы](#blog-lead).
    `.trim(),
    coverImage: img("1450101499163-8842740a9f6"),
    category: "Смета, договор и контроль",
    categorySlug: "estimate-contract-control",
    clusterId: "estimate",
    intent: "informational",
    funnelStage: "warm",
    priority: "high",
    status: "published",
    publishedAt: "2026-05-08",
    readTime: 7,
    author,
    seo: {
      title: "Как читать смету на строительство дома",
      description: "Пошаговый разбор сметы: разделы, объёмы, материалы.",
    },
    faqs: [
      { question: "Можно ли сравнивать сметы?", answer: "Да, при одинаковом составе работ и комплектации." },
    ],
    relatedServicePages: ["/smeta-na-stroitelstvo-doma", "/calculator"],
    relatedPosts: ["smeta-na-stroitelstvo-doma-iz-chego-sostoit"],
    leadMagnetId: "estimate-example",
    heroCTA: { label: "Получить пример сметы", href: "#blog-lead" },
  },
  {
    slug: "planirovka-doma-dlya-semi-s-detmi",
    title: "Планировка дома для семьи с детьми",
    h1: "Планировка дома для семьи с детьми",
    excerpt: "Спальни, санузлы, кухня-гостиная и безопасность.",
    shortAnswer: "Важны короткие маршруты, достаточно спален и санузлов, место для хранения.",
    content: `
## Что заложить

- 2–3 спальни или гостевая
- 2 санузла от ~100 м²
- Кухня-гостиная
- Котельная / техпомещение
- Хранение

## Инструменты

[Планировщик](/planirovka) · [семейные проекты](/catalog/kategoriya/doma-dlya-semi).

## Следующий шаг

[Собрать планировку](/planirovka?source=blog&cluster=planning).
    `.trim(),
    coverImage: img("1503387762-592deb58ef4e"),
    category: "Планировки и проекты",
    categorySlug: "planning-projects",
    clusterId: "planning",
    intent: "informational",
    funnelStage: "warm",
    priority: "high",
    status: "published",
    publishedAt: "2026-05-09",
    readTime: 8,
    author,
    seo: {
      title: "Планировка дома для семьи с детьми",
      description: "Планировка дома для семьи: спальни, санузлы, зонирование.",
    },
    faqs: [
      { question: "Сколько спален нужно?", answer: "Зависит от состава семьи. Часто 3–4 зоны сна на 120–150 м²." },
    ],
    relatedServicePages: ["/planirovka", "/catalog/kategoriya/doma-dlya-semi", "/proektirovanie-domov"],
    relatedProjectFilters: { purpose: ["семья"] },
    relatedPosts: ["odnoetazhnyy-ili-dvuhetazhnyy-dom", "planirovka-doma-s-chego-nachat"],
    leadMagnetId: "layout-review",
    heroCTA: { label: "Собрать планировку", href: "/planirovka?source=blog&cluster=planning" },
  },
  {
    slug: "stroitelstvo-doma-v-ipoteku-chto-podgotovit",
    title: "Строительство дома в ипотеку: что подготовить",
    h1: "Строительство дома в ипотеку: что подготовить",
    excerpt: "Проект, смета, подрядчик — строительная часть. Условия банка уточняйте отдельно.",
    shortAnswer: "Мы не одобряем ипотеку — решение принимает банк. Помогаем подготовить строительные вводные.",
    content: `
## Важно

**Не обещаем одобрение и не указываем ставки.** Условия банка уточняйте актуально.

## Что может понадобиться

- документы на участок;
- проект или [готовый из каталога](/catalog);
- [смета](/smeta-na-stroitelstvo-doma) с этапами;
- договор подряда.

## Этапность

Банк может выдавать траншами — [процесс](/process) должен быть прозрачен.

## Следующий шаг

[Ипотека на строительство](/stroitelstvo-doma-v-ipoteku).
    `.trim(),
    coverImage: img("1560518883-ce09059eeffa"),
    category: "Ипотека и документы",
    categorySlug: "mortgage-documents",
    clusterId: "mortgage",
    intent: "informational",
    funnelStage: "warm",
    priority: "high",
    status: "published",
    publishedAt: "2026-05-10",
    readTime: 7,
    author,
    needsRegularUpdate: true,
    seo: {
      title: "Строительство дома в ипотеку: что подготовить",
      description: "Подготовка к строительству в ипотеку без обещаний одобрения.",
    },
    faqs: [
      { question: "Гарантируете одобрение?", answer: "Нет. Решение принимает банк." },
    ],
    relatedServicePages: ["/stroitelstvo-doma-v-ipoteku", "/smeta-na-stroitelstvo-doma", "/doma-pod-klyuch-do-10-mln"],
    heroCTA: { label: "Обсудить строительство в ипотеку", href: "/stroitelstvo-doma-v-ipoteku" },
  },
  {
    slug: "kak-kontrolirovat-stroitelstvo-doma-udalenno",
    title: "Как контролировать строительство дома удалённо",
    h1: "Как контролировать строительство дома удалённо",
    excerpt: "Этапы, фотоотчёты, приёмка — если участок далеко.",
    shortAnswer: "Контроль строится на этапах в договоре, фотоотчётах и согласовании решений до работ.",
    content: `
## Что помогает

- этапы в договоре;
- фотоотчёты до закрытия скрытых работ;
- смета по разделам;
- один канал связи с прорабом.

## Чего избегать

Старт без проекта, оплата без этапов, изменения без пересчёта.

## Следующий шаг

[Процесс](/process) · [обсудить стройку](/stroitelstvo-domov-pod-klyuch-irkutsk).
    `.trim(),
    coverImage: img("1541888946425-d81bb19240f5"),
    category: "Смета, договор и контроль",
    categorySlug: "estimate-contract-control",
    clusterId: "contract",
    intent: "informational",
    funnelStage: "warm",
    priority: "high",
    status: "published",
    publishedAt: "2026-05-11",
    readTime: 7,
    author,
    seo: {
      title: "Как контролировать строительство дома удалённо",
      description: "Этапы, фотоотчёты и договор — контроль на удалённом участке.",
    },
    faqs: [
      { question: "Достаточно ли фото?", answer: "Фото помогают, ключевые этапы лучше принимать по чек-листу и смете." },
    ],
    relatedServicePages: ["/process", "/stroitelstvo-domov-v-irkutskoy-oblasti", "/about"],
    relatedPosts: ["kak-vybrat-podryadchika-dlya-stroitelstva-doma"],
    heroCTA: { label: "Посмотреть процесс", href: "/process" },
  },
  {
    slug: "kak-vybrat-proekt-doma-pod-uchastok",
    title: "Как выбрать проект дома под участок",
    h1: "Как выбрать проект дома под участок",
    excerpt: "Подъезд, рельеф, коммуникации, посадка — до выбора картинки.",
    shortAnswer: "Сначала вводные по участку, затем проект из каталога или адаптация.",
    content: `
## Участок важнее картинки

Проект без привязки к земле ведёт к переделкам.

## Что учесть

Размер участка, подъезд, стороны света, уклон, коммуникации.

## Инструменты

[Каталог](/catalog) · [планировщик](/planirovka) · [проектирование](/proektirovanie-domov).

## Следующий шаг

[Подобрать проект](/catalog).
    `.trim(),
    coverImage: img("1613490493576-7fde63acd811"),
    category: "Планировки и проекты",
    categorySlug: "planning-projects",
    clusterId: "projects",
    intent: "informational",
    funnelStage: "warm",
    priority: "high",
    status: "published",
    publishedAt: "2026-05-12",
    readTime: 8,
    author,
    seo: {
      title: "Как выбрать проект дома под участок",
      description: "Подбор проекта с учётом участка и коммуникаций.",
    },
    faqs: [
      { question: "Можно ли адаптировать готовый проект?", answer: "Да, посадку и планировку часто корректируют под участок." },
    ],
    relatedServicePages: ["/catalog", "/proektirovanie-domov", "/planirovka"],
    relatedPosts: ["kak-vybrat-dom", "chto-proverit-na-uchastke-pered-stroitelstvom"],
    heroCTA: { label: "Подобрать проект", href: "/catalog" },
  },
  {
    slug: "chto-vhodit-v-stroitelstvo-doma-pod-klyuch",
    title: "Что входит в строительство дома под ключ",
    h1: "Что входит в строительство дома под ключ",
    excerpt: "Черновик — материал в подготовке.",
    shortAnswer: "Состав «под ключ» зависит от договора и комплектации — сравнивайте сметы по разделам.",
    content: `
Материал в подготовке. Пока см. [строительство под ключ](/stroitelstvo-domov-pod-klyuch-irkutsk) и [смету](/smeta-na-stroitelstvo-doma).
    `.trim(),
    coverImage: img("1600596542815-ffad4c1539a9"),
    category: "Смета, договор и контроль",
    categorySlug: "estimate-contract-control",
    clusterId: "turnkey",
    intent: "commercial",
    funnelStage: "hot",
    priority: "medium",
    status: "draft",
    publishedAt: "2026-05-13",
    readTime: 3,
    author,
    noindex: true,
    seo: {
      title: "Что входит в строительство дома под ключ (черновик)",
      description: "Материал в подготовке.",
    },
    relatedServicePages: ["/stroitelstvo-domov-pod-klyuch-irkutsk", "/smeta-na-stroitelstvo-doma"],
    heroCTA: { label: "Строительство под ключ", href: "/stroitelstvo-domov-pod-klyuch-irkutsk" },
  },
];
