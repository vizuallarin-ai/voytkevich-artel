import type { LeadMagnet } from "@/types/lead-magnet";

const baseAnalytics = (id: string) => ({
  viewEvent: `lead_magnet_viewed_${id}`,
  openEvent: `lead_magnet_modal_opened_${id}`,
  submitEvent: `lead_magnet_submitted_${id}`,
});

export const leadMagnets: LeadMagnet[] = [
  {
    id: "estimate-example",
    slug: "estimate-example",
    title: "Получить пример сметы на строительство дома",
    shortTitle: "Пример сметы",
    description:
      "Покажем, из каких разделов обычно складывается смета: фундамент, коробка, кровля, инженерия, отделка, логистика и уточнения.",
    type: "checklist",
    status: "active",
    clusterIds: ["cost", "estimate", "estimate-contract-control"],
    pageTypes: ["service-page", "blog-post", "calculator", "blog"],
    intent: "estimate",
    valuePromise: "Структура сметы и список разделов для проверки",
    highlights: [
      "Разделы сметы: фундамент, коробка, кровля",
      "Инженерия и отделка отдельными блоками",
      "Что часто уточняется на участке",
      "Как читать смету до договора",
    ],
    cta: {
      primaryLabel: "Получить пример сметы",
      formTitle: "Получить пример структуры сметы",
      formDescription:
        "Оставьте контакты — отправим пример структуры сметы или обсудим, какие разделы важно проверить в вашем случае.",
      successTitle: "Заявка на пример сметы отправлена",
      successMessage:
        "Мы получили ваши контакты и тему запроса. Специалист сможет отправить пример структуры сметы или обсудить, какие разделы важно учесть в вашем случае.",
    },
    formFields: { name: true, phone: true, comment: true, area: true },
    payloadDefaults: {
      leadMagnetId: "estimate-example",
      leadMagnetType: "checklist",
      defaultSource: "lead-magnet:estimate-example",
    },
    relatedPages: ["/smeta-na-stroitelstvo-doma", "/calculator", "/blog"],
    file: { hasFile: false, generationStatus: "future" },
    legalNote:
      "Материал поможет сориентироваться. Точный расчёт зависит от участка, проекта, фундамента, инженерии и комплектации.",
    analytics: baseAnalytics("estimate-example"),
  },
  {
    id: "land-checklist",
    slug: "land-checklist",
    title: "Получить чек-лист проверки участка",
    shortTitle: "Чек-лист участка",
    description:
      "Что проверить до строительства: подъезд, коммуникации, уклон, грунт, вода, ограничения, стороны света и посадку дома.",
    type: "checklist",
    status: "active",
    clusterIds: ["land", "foundation-land", "geography", "foundation"],
    pageTypes: ["blog-post", "planner", "objects-map", "service-page"],
    intent: "land",
    valuePromise: "Список вопросов по участку до проекта и сметы",
    highlights: [
      "Подъезд и логистика техники",
      "Коммуникации и ограничения",
      "Уклон, грунт, вода",
      "Посадка дома и стороны света",
    ],
    cta: {
      primaryLabel: "Получить чек-лист участка",
      formTitle: "Получить чек-лист проверки участка",
      formDescription:
        "Оставьте контакты — отправим список вопросов по участку и подскажем, что влияет на фундамент и смету.",
      successTitle: "Заявка на чек-лист участка отправлена",
      successMessage:
        "Мы получили заявку. Подготовьте, если есть: локацию участка, примерную площадь, информацию о коммуникациях и подъезде.",
    },
    formFields: {
      name: true,
      phone: true,
      landLocation: true,
      hasLand: true,
      comment: true,
    },
    payloadDefaults: {
      leadMagnetId: "land-checklist",
      leadMagnetType: "checklist",
      defaultSource: "lead-magnet:land-checklist",
    },
    relatedPages: ["/stroitelstvo-domov-v-irkutskoy-oblasti", "/planirovka", "/objects-map"],
    file: { hasFile: false, generationStatus: "future" },
    legalNote:
      "Чек-лист — ориентир. Точные решения по фундаменту и посадке — после осмотра или детальных вводных.",
    analytics: baseAnalytics("land-checklist"),
  },
  {
    id: "budget-project-selection",
    slug: "budget-project-selection",
    title: "Получить подборку проектов под бюджет",
    shortTitle: "Подбор проектов",
    description:
      "Подберём 2–3 проекта по площади, материалу, этажности, участку и ориентиру бюджета.",
    type: "selection",
    status: "active",
    clusterIds: ["projects", "cost", "catalog", "planning"],
    pageTypes: ["home", "catalog", "project-page", "blog-post", "case-page", "objects-map"],
    intent: "project-selection",
    valuePromise: "Подборка проектов под ваши вводные",
    highlights: [
      "2–3 проекта из каталога или адаптация",
      "Учёт площади и материала",
      "Ориентир бюджета без фиктивных сумм",
      "Следующий шаг: расчёт или консультация",
    ],
    cta: {
      primaryLabel: "Подобрать проекты",
      formTitle: "Подбор проектов под бюджет",
      formDescription:
        "Укажите бюджет, площадь, материал и есть ли участок — подберём варианты для обсуждения.",
      successTitle: "Заявка на подбор проектов отправлена",
      successMessage:
        "Мы получили вводные. Специалист предложит варианты после уточнения площади, бюджета, участка и материала.",
    },
    formFields: {
      name: true,
      phone: true,
      budget: true,
      area: true,
      material: true,
      hasLand: true,
    },
    payloadDefaults: {
      leadMagnetId: "budget-project-selection",
      leadMagnetType: "selection",
      defaultSource: "lead-magnet:budget-project-selection",
    },
    relatedPages: ["/catalog", "/doma-pod-klyuch-do-10-mln"],
    file: { hasFile: false, generationStatus: "manual" },
    legalNote:
      "Подборка — ориентир. Точная смета считается после участка, фундамента и комплектации.",
    analytics: baseAnalytics("budget-project-selection"),
  },
  {
    id: "layout-review",
    slug: "layout-review",
    title: "Отправить планировку на разбор",
    shortTitle: "Разбор планировки",
    description:
      "Передайте состав помещений, площадь и сценарий жизни — специалист подскажет, насколько планировка реалистична и что стоит уточнить.",
    type: "planner-review",
    status: "active",
    clusterIds: ["planning", "planning-projects", "project-design"],
    pageTypes: ["planner", "blog-post", "project-page", "service-page"],
    intent: "planning",
    valuePromise: "Предварительный разбор планировки и зонирования",
    highlights: [
      "Состав помещений и площади",
      "Сценарий жизни семьи",
      "Что уточнить до проекта",
      "Связь с планировщиком на сайте",
    ],
    cta: {
      primaryLabel: "Разобрать планировку",
      formTitle: "Отправить планировку на разбор",
      formDescription:
        "Опишите помещения, площадь и сценарий — это предварительные вводные, не финальный проект.",
      successTitle: "Планировка отправлена на разбор",
      successMessage:
        "Это предварительные вводные — точное проектное решение создаётся после анализа участка и технических требований.",
    },
    formFields: {
      name: true,
      phone: true,
      area: true,
      planningScenario: true,
      comment: true,
    },
    payloadDefaults: {
      leadMagnetId: "layout-review",
      leadMagnetType: "planner-review",
      defaultSource: "lead-magnet:layout-review",
    },
    relatedPages: ["/planirovka", "/proektirovanie-domov"],
    file: { hasFile: false, generationStatus: "manual" },
    legalNote:
      "Разбор — консультация по вводным. Проектная документация оформляется отдельно.",
    analytics: baseAnalytics("layout-review"),
  },
  {
    id: "material-comparison",
    slug: "material-comparison",
    title: "Получить сравнение материалов для дома",
    shortTitle: "Сравнение материалов",
    description:
      "Сравним брус, каркас, газобетон по стоимости, срокам, эксплуатации, рискам и применимости к вашему участку.",
    type: "comparison",
    status: "active",
    clusterIds: ["materials", "comparisons"],
    pageTypes: ["service-page", "blog-post", "calculator", "catalog"],
    intent: "materials",
    valuePromise: "Сравнение технологий под ваш сценарий",
    highlights: [
      "Брус, каркас, газобетон",
      "Сроки и эксплуатация",
      "Риски и ограничения участка",
      "Ориентир по бюджету без фиктивных цен",
    ],
    cta: {
      primaryLabel: "Сравнить материалы",
      formTitle: "Сравнить материалы для моего дома",
      formDescription:
        "Оставьте контакты — обсудим материал с учётом участка, площади и сценария проживания.",
      successTitle: "Заявка на сравнение материалов отправлена",
      successMessage:
        "Специалист свяжется с вами и поможет сопоставить технологии под ваши вводные.",
    },
    formFields: { name: true, phone: true, material: true, area: true, landLocation: true },
    payloadDefaults: {
      leadMagnetId: "material-comparison",
      leadMagnetType: "comparison",
      defaultSource: "lead-magnet:material-comparison",
    },
    relatedPages: [
      "/stroitelstvo-domov-iz-brusa",
      "/karkasnye-doma-pod-klyuch",
      "/stroitelstvo-domov-iz-gazobetona",
    ],
    file: { hasFile: false, generationStatus: "manual" },
    legalNote:
      "Сравнение — ориентир. Итоговый выбор зависит от участка, фундамента и комплектации.",
    analytics: baseAnalytics("material-comparison"),
  },
  {
    id: "mistakes-checklist",
    slug: "mistakes-checklist",
    title: "Получить чек-лист ошибок при строительстве дома",
    shortTitle: "Чек-лист ошибок",
    description:
      "Типичные ошибки: выбор по цене за м², слабая смета, участок без проверки, проект без адаптации, отсутствие контроля этапов.",
    type: "checklist",
    status: "active",
    clusterIds: ["mistakes", "trust", "estimate-contract-control"],
    pageTypes: ["home", "blog-post", "service-page", "blog"],
    intent: "mistakes",
    valuePromise: "Список ошибок до старта строительства",
    highlights: [
      "Цена за м² vs полная смета",
      "Проверка участка и проекта",
      "Договор и этапы контроля",
      "Адаптация под участок",
    ],
    cta: {
      primaryLabel: "Получить чек-лист ошибок",
      formTitle: "Получить чек-лист ошибок",
      formDescription:
        "Оставьте контакты — отправим список типичных ошибок и поможем обсудить ваш случай.",
      successTitle: "Заявка на чек-лист отправлена",
      successMessage:
        "Мы получили заявку. Специалист может обсудить, какие пункты актуальны для вашего проекта.",
    },
    formFields: { name: true, phone: true, comment: true },
    payloadDefaults: {
      leadMagnetId: "mistakes-checklist",
      leadMagnetType: "checklist",
      defaultSource: "lead-magnet:mistakes-checklist",
    },
    relatedPages: ["/stroitelstvo-domov-pod-klyuch-irkutsk", "/process"],
    file: { hasFile: false, generationStatus: "future" },
    legalNote: "Чек-лист не заменяет консультацию и детальную смету по вашему участку.",
    analytics: baseAnalytics("mistakes-checklist"),
  },
  {
    id: "mortgage-inputs",
    slug: "mortgage-inputs",
    title: "Получить список вводных для строительства дома в ипотеку",
    shortTitle: "Вводные для ипотеки",
    description:
      "Какие строительные параметры могут понадобиться: проект, смета, площадь, материал, этапность, подрядчик и документы. Условия банка уточняются отдельно.",
    type: "checklist",
    status: "active",
    clusterIds: ["mortgage", "mortgage-documents"],
    pageTypes: ["service-page", "blog-post", "project-page", "catalog"],
    intent: "mortgage",
    valuePromise: "Список строительных вводных для обсуждения с банком",
    highlights: [
      "Проект и структура сметы",
      "Площадь, материал, этапность",
      "Документы подрядчика",
      "Что уточнить в банке отдельно",
    ],
    cta: {
      primaryLabel: "Получить список вводных",
      formTitle: "Вводные для строительства в ипотеку",
      formDescription:
        "Оставьте контакты — поможем разобрать строительные вводные. Условия банка нужно уточнять отдельно.",
      successTitle: "Запрос по ипотеке отправлен",
      successMessage:
        "Мы получили запрос. Условия банка нужно уточнять отдельно, но мы поможем разобрать строительные вводные: проект, смету, этапы и параметры дома.",
    },
    formFields: { name: true, phone: true, area: true, material: true, comment: true },
    payloadDefaults: {
      leadMagnetId: "mortgage-inputs",
      leadMagnetType: "checklist",
      defaultSource: "lead-magnet:mortgage-inputs",
    },
    relatedPages: ["/stroitelstvo-doma-v-ipoteku"],
    file: { hasFile: false, generationStatus: "manual" },
    legalNote:
      "Условия банка нужно уточнять отдельно. Мы помогаем подготовить строительные вводные, не обещаем одобрение.",
    analytics: baseAnalytics("mortgage-inputs"),
  },
  {
    id: "cost-review",
    slug: "cost-review",
    title: "Получить разбор стоимости по моему дому",
    shortTitle: "Разбор стоимости",
    description:
      "Оставьте вводные: площадь, материал, участок, комплектацию и сроки. Специалист подскажет, какие факторы могут повлиять на бюджет.",
    type: "consultation",
    status: "active",
    clusterIds: ["cost", "calculator", "estimate"],
    pageTypes: ["home", "calculator", "project-page", "service-page", "blog-post", "case-page", "objects-map"],
    intent: "cost",
    valuePromise: "Разбор факторов бюджета под ваши вводные",
    highlights: [
      "Площадь, материал, комплектация",
      "Участок и фундамент",
      "Инженерия и логистика",
      "Без обещания точной цены онлайн",
    ],
    cta: {
      primaryLabel: "Получить разбор стоимости",
      formTitle: "Разбор стоимости по моему дому",
      formDescription:
        "Укажите вводные — специалист подскажет, что может повлиять на бюджет. Это не финальная смета.",
      successTitle: "Заявка на разбор стоимости отправлена",
      successMessage:
        "Мы получили вводные. Специалист свяжется с вами и обсудит факторы бюджета — без обещания точной цены без осмотра участка.",
    },
    formFields: {
      name: true,
      phone: true,
      area: true,
      material: true,
      budget: true,
      landLocation: true,
      comment: true,
    },
    payloadDefaults: {
      leadMagnetId: "cost-review",
      leadMagnetType: "consultation",
      defaultSource: "lead-magnet:cost-review",
    },
    relatedPages: ["/calculator", "/stroitelstvo-domov-pod-klyuch-irkutsk"],
    file: { hasFile: false, generationStatus: "manual" },
    legalNote:
      "Разбор — ориентир. Точный расчёт зависит от участка, проекта, фундамента, инженерии и комплектации.",
    analytics: baseAnalytics("cost-review"),
  },
];

export function getLeadMagnetByIdFromData(id: string): LeadMagnet | undefined {
  return leadMagnets.find((m) => m.id === id && m.status === "active");
}
