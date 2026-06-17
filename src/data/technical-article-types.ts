import type { TechnicalArticleType } from "@/types/technical-content";

export type TechnicalArticleTypeMeta = {
  type: TechnicalArticleType;
  title: string;
  description: string;
  exampleQueries: string[];
};

export const technicalArticleTypes: TechnicalArticleTypeMeta[] = [
  {
    type: "how-to",
    title: "How-to",
    description: "Пошаговое объяснение принципов без опасных DIY-инструкций",
    exampleQueries: ["как утеплить кровлю", "как выбрать фундамент", "как проверить участок"],
  },
  {
    type: "guide",
    title: "Гайд",
    description: "Большой разбор темы с вариантами, сравнением и чек-листом",
    exampleQueries: ["гид по утеплению дома", "как выбрать материал", "подготовка к строительству"],
  },
  {
    type: "checklist",
    title: "Чек-лист",
    description: "Практический список проверок с лид-магнитом",
    exampleQueries: ["чек-лист участка", "чек-лист сметы"],
  },
  {
    type: "mistakes",
    title: "Ошибки",
    description: "Типовые ошибки, последствия и снижение рисков",
    exampleQueries: ["ошибки при утеплении кровли", "ошибки при выборе фундамента"],
  },
  {
    type: "comparison",
    title: "Сравнение",
    description: "Сравнение технологий и сценариев выбора",
    exampleQueries: ["каркас или брус", "газобетон или каркас"],
  },
  {
    type: "cost-explainer",
    title: "Разбор стоимости",
    description: "Факторы цены без обещания точной сметы онлайн",
    exampleQueries: ["от чего зависит стоимость фундамента", "почему меняется смета"],
  },
  {
    type: "process-explainer",
    title: "Как устроен процесс",
    description: "Этапы и логика строительства",
    exampleQueries: ["как строится каркасный дом", "что входит в дом под ключ"],
  },
  {
    type: "material-explainer",
    title: "Материал",
    description: "Плюсы, минусы и сценарии применения материала",
    exampleQueries: ["дом из бруса плюсы и минусы", "дом из газобетона"],
  },
  {
    type: "local-technical-guide",
    title: "Локальный гайд",
    description: "Особенности строительства в Иркутской области",
    exampleQueries: ["строительство в Иркутской области", "сезонность в Иркутске"],
  },
  {
    type: "opinion",
    title: "Мнение редакции",
    description: "Редакционный разбор без выдачи за норматив",
    exampleQueries: [],
  },
];

export function getTechnicalArticleTypeMeta(type: TechnicalArticleType) {
  return technicalArticleTypes.find((t) => t.type === type);
}
