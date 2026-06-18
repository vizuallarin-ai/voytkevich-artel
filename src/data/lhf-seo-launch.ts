/** Низкочастотные geo/material страницы — первая волна индексации. */
export type LhfSeoLaunchPage = {
  url: string;
  targetKeyword: string;
  h1?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export const lhfSeoLaunchPages: LhfSeoLaunchPage[] = [
  {
    url: "/stroitelstvo-domov/sayansk",
    targetKeyword: "строительство дома в саянске",
    h1: "Строительство домов в Саянске",
    seoTitle: "Строительство дома в Саянске под ключ",
    seoDescription:
      "Строим дома под ключ в Саянске: проект, смета по этапам, каркас, брус, газобетон. Ориентир по бюджету после вводных.",
  },
  {
    url: "/stroitelstvo-domov/tulun",
    targetKeyword: "строительство дома в тулуне",
    h1: "Строительство домов в Тулуне",
    seoTitle: "Строительство дома в Тулуне под ключ",
    seoDescription:
      "Дома под ключ в Тулуне и районе: расчёт, проект, стройка по этапам. Работаем по Иркутской области с фотоотчётами.",
  },
  {
    url: "/stroitelstvo-domov/baikal",
    targetKeyword: "строительство каркасных домов на байкале",
    h1: "Строительство домов на Байкале и в Прибайкалье",
    seoTitle: "Строительство каркасных домов на Байкале",
    seoDescription:
      "Каркасные и другие дома на Байкале: участок, логистика, смета и этапы до сдачи. Консультация по строительству в прибрежных посёлках.",
  },
  {
    url: "/stroitelstvo-domov/angarsk",
    targetKeyword: "строительство дома в ангарске",
    seoTitle: "Строительство дома в Ангарске под ключ",
    seoDescription:
      "Строительство домов в Ангарске: подбор проекта, предварительный расчёт, договор и сдача по этапам.",
  },
  {
    url: "/stroitelstvo-domov/shelehov",
    targetKeyword: "строительство дома в шелехове",
    seoTitle: "Дом под ключ в Шелехове",
    seoDescription:
      "Строим дома в Шелехове и пригороде: смета, этапы, фотоотчёты с объекта.",
  },
  {
    url: "/stroitelstvo-domov/usole-sibirskoe",
    targetKeyword: "строительство дома в усолье-сибирском",
    h1: "Строительство домов в Усолье-Сибирском",
    seoTitle: "Строительство дома в Усолье-Сибирском",
    seoDescription:
      "Дома под ключ в Усолье-Сибирском: проект, бюджет, стройка с понятной сметой.",
  },
  {
    url: "/stroitelstvo-domov/bratsk",
    targetKeyword: "строительство дома в братске",
    h1: "Строительство домов в Братске",
    seoTitle: "Строительство дома в Братске под ключ",
    seoDescription:
      "Строительство загородных домов в Братске и районе — от расчёта до сдачи.",
  },
  {
    url: "/stroitelstvo-domov/mamony",
    targetKeyword: "строительство дома в мамонах",
    seoTitle: "Дом под ключ в Мамонах",
    seoDescription:
      "Строительство домов в п. Мамоны: адаптация проекта под участок и бюджет.",
  },
  {
    url: "/stroitelstvo-domov/homutovo",
    targetKeyword: "строительство дома в хомутово",
    seoTitle: "Дом под ключ в Хомутово",
    seoDescription:
      "Строим дома в Хомутово: ориентир по смете, этапы и контроль работ.",
  },
  {
    url: "/stroitelstvo-domov/markova",
    targetKeyword: "строительство дома в маркове",
    seoTitle: "Дом под ключ в Маркове",
    seoDescription:
      "Строительство домов в п. Маркова — проект, смета, стройка под ключ.",
  },
  {
    url: "/stroitelstvo-domov/baikal-trakt",
    targetKeyword: "строительство дома байкальский тракт",
    seoTitle: "Дом по Байкальскому тракту",
    seoDescription:
      "Загородные дома вдоль Байкальского тракта: логистика, участок, смета по этапам.",
  },
  {
    url: "/proekty-domov/karkasnye-doma",
    targetKeyword: "каркасные дома под ключ иркутск",
    seoTitle: "Каркасные дома под ключ в Иркутске и области",
    seoDescription:
      "Проекты каркасных домов: планировки, сроки, ориентир по стоимости. Строительство в Иркутске и области.",
  },
  {
    url: "/proekty-domov/doma-iz-gazobetona",
    targetKeyword: "дома из газобетона иркутск",
    seoTitle: "Дома из газобетона под ключ",
    seoDescription:
      "Газобетонные дома: проекты, смета, сроки строительства в Иркутске и области.",
  },
  {
    url: "/proekty-domov/karkasnye-doma-v-baikal",
    targetKeyword: "каркасные дома на байкале",
    h1: "Каркасные дома на Байкале",
    seoTitle: "Каркасные дома на Байкале под ключ",
    seoDescription:
      "Проекты и строительство каркасных домов на Байкале: участок, доставка материалов, смета и этапы.",
  },
];

export const lhfSeoLaunchUrlSet = new Set(lhfSeoLaunchPages.map((p) => p.url));
