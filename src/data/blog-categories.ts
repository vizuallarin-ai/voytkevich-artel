import type { BlogCategory } from "@/types/blog";

export const blogCategories: BlogCategory[] = [
  {
    slug: "cost",
    title: "Стоимость строительства",
    description:
      "Разбираем, из чего складывается стоимость дома, почему цена в калькуляторе предварительная, что входит в смету и как не попасть на скрытые доплаты.",
    seoTitle: "Стоимость строительства дома — блог",
    seoDescription:
      "Статьи о цене строительства дома в Иркутске: смета, бюджет, комплектации и предварительный расчёт.",
    relatedClusters: ["cost", "estimate"],
    primaryCTA: "Рассчитать стоимость дома",
    primaryCTAHref: "/calculator?source=blog&cluster=cost",
    relatedServicePages: [
      "/calculator",
      "/smeta-na-stroitelstvo-doma",
      "/doma-pod-klyuch-do-10-mln",
      "/stroitelstvo-domov-pod-klyuch-irkutsk",
    ],
  },
  {
    slug: "materials",
    title: "Материалы и технологии",
    description:
      "Сравнение бруса, каркаса, газобетона и других технологий строительства для Иркутска и Иркутской области.",
    seoTitle: "Материалы для строительства дома — блог",
    seoDescription:
      "Сравнение технологий строительства домов: брус, каркас, газобетон — для климата Иркутской области.",
    relatedClusters: ["materials", "comparisons"],
    primaryCTA: "Сравнить материалы на проекте",
    primaryCTAHref: "/calculator?source=blog&cluster=materials",
    relatedServicePages: [
      "/stroitelstvo-domov-iz-brusa",
      "/karkasnye-doma-pod-klyuch",
      "/stroitelstvo-domov-iz-gazobetona",
      "/catalog",
    ],
  },
  {
    slug: "foundation-land",
    title: "Фундамент и участок",
    description:
      "Как выбрать участок, что проверить до строительства, какой фундамент нужен и почему геология влияет на смету.",
    seoTitle: "Фундамент и участок — блог о строительстве",
    seoDescription:
      "Проверка участка, геология, фундамент и логистика — материалы перед строительством дома в Иркутской области.",
    relatedClusters: ["foundation", "land"],
    primaryCTA: "Проверить вводные участка",
    primaryCTAHref: "/stroitelstvo-domov-v-irkutskoy-oblasti",
    relatedServicePages: [
      "/stroitelstvo-domov-v-irkutskoy-oblasti",
      "/calculator",
      "/proektirovanie-domov",
      "/planirovka",
    ],
  },
  {
    slug: "planning-projects",
    title: "Планировки и проекты",
    description:
      "Как выбрать проект, продумать планировку, площадь, спальни, санузлы, котельную, террасу и сценарии жизни.",
    seoTitle: "Планировки и проекты домов — блог",
    seoDescription:
      "Выбор проекта дома, планировка, площадь и адаптация под участок в Иркутске.",
    relatedClusters: ["planning", "projects", "floors"],
    primaryCTA: "Собрать планировку",
    primaryCTAHref: "/planirovka?source=blog&cluster=planning",
    relatedServicePages: ["/planirovka", "/proektirovanie-domov", "/catalog", "/odnoetazhnye-doma-pod-klyuch"],
  },
  {
    slug: "estimate-contract-control",
    title: "Смета, договор и контроль",
    description:
      "Как читать смету, что фиксировать в договоре, как принимать этапы и контролировать стройку без хаоса.",
    seoTitle: "Смета и контроль строительства — блог",
    seoDescription:
      "Смета на дом, договор, этапы строительства и удалённый контроль — материалы для заказчиков.",
    relatedClusters: ["estimate", "contract", "mistakes"],
    primaryCTA: "Получить предварительную смету",
    primaryCTAHref: "/smeta-na-stroitelstvo-doma",
    relatedServicePages: ["/smeta-na-stroitelstvo-doma", "/calculator", "/process"],
  },
  {
    slug: "mortgage-documents",
    title: "Ипотека и документы",
    description:
      "Что учитывать при строительстве дома через банк, какие строительные вводные могут понадобиться. Условия банка уточняются отдельно.",
    seoTitle: "Ипотека на строительство дома — блог",
    seoDescription:
      "Подготовка к строительству дома в ипотеку: проект, смета, этапы. Без обещаний одобрения.",
    relatedClusters: ["mortgage"],
    primaryCTA: "Обсудить строительство в ипотеку",
    primaryCTAHref: "/stroitelstvo-doma-v-ipoteku",
    relatedServicePages: ["/stroitelstvo-doma-v-ipoteku", "/smeta-na-stroitelstvo-doma", "/catalog"],
  },
  {
    slug: "mistakes",
    title: "Ошибки и разборы",
    description:
      "Типичные ошибки при выборе проекта, подрядчика, участка, материала и сметы — и как их избежать.",
    seoTitle: "Ошибки при строительстве дома — блог",
    seoDescription:
      "Дорогие ошибки заказчиков и как снизить риски при строительстве дома в Иркутске.",
    relatedClusters: ["mistakes"],
    primaryCTA: "Разобрать мой случай",
    primaryCTAHref: "#blog-lead",
    relatedServicePages: ["/stroitelstvo-domov-pod-klyuch-irkutsk", "/smeta-na-stroitelstvo-doma", "/calculator"],
  },
  {
    slug: "cases-experience",
    title: "Кейсы и опыт",
    description:
      "Разборы реальных объектов и этапов строительства. Материалы появятся по мере публикации подтверждённых кейсов.",
    seoTitle: "Кейсы строительства домов — блог",
    seoDescription:
      "Опыт строительства домов в Иркутской области — без выдуманных объектов.",
    relatedClusters: ["cases"],
    primaryCTA: "Смотреть проекты",
    primaryCTAHref: "/catalog",
    relatedServicePages: ["/catalog", "/about", "/process"],
  },
];

export function getBlogCategoryBySlug(slug: string): BlogCategory | undefined {
  return blogCategories.find((c) => c.slug === slug);
}

export function getCategoryTitle(categorySlug: string): string {
  return getBlogCategoryBySlug(categorySlug)?.title ?? categorySlug;
}
