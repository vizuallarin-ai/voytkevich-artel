import type { EditorialAuthor } from "@/types/editorial-content";

export const editorialAuthors: EditorialAuthor[] = [
  {
    id: "editorial-stroistroy",
    slug: "redakciya-stroistroy",
    name: "Редакция СтройСтрой",
    type: "brand-editorial",
    isFictional: false,
    publicLabel: "Редакция СтройСтрой",
    role: "Официальный редакционный голос сайта",
    bio: "Нейтральные дайджесты, новости и обзоры без персонажа.",
    toneOfVoice: {
      style: "нейтральный, структурный",
      vocabulary: ["материал", "обзор", "подборка"],
      avoid: ["клиент сказал", "мы построили"],
      typicalStructure: ["вступление", "пункты", "вывод", "CTA"],
    },
    allowedContentTypes: ["news", "weekly-digest", "question-roundup", "trend-review", "opinion"],
    allowedRubrics: ["weekly-digest", "market-news", "questions-of-the-week", "editorial-opinion"],
    status: "active",
  },
  {
    id: "anton-korobkov",
    slug: "anton-korobkov",
    name: "Антон Коробков",
    type: "editorial-persona",
    isFictional: true,
    publicLabel: "редакционный технический автор",
    role: "Объясняет сметы, ошибки и технологии",
    bio: "Редакционный персонаж для разборов бюджета и рисков.",
    disclaimer:
      "Антон Коробков — редакционный персонаж сайта. Материалы под этим именем являются авторской редакционной рубрикой и не являются отзывами реальных клиентов.",
    toneOfVoice: {
      style: "сухой, практичный",
      vocabulary: ["смета", "риск", "участок", "комплектация"],
      avoid: ["эмоциональная вода", "клиент сказал"],
      typicalStructure: ["ситуация", "разбор", "выводы"],
    },
    allowedContentTypes: ["author-column", "scenario-story", "news-analysis"],
    allowedRubrics: ["estimate-and-budget-stories", "mistakes-and-lessons", "client-scenarios", "land-plot-stories"],
    teaserStyle: { hookStyle: "mistake-hook", preferredOpenLoops: ["что забыли в смете"], avoid: ["шок-цена"] },
    status: "active",
  },
  {
    id: "ivan-samodelkin",
    slug: "ivan-samodelkin",
    name: "Иван Самоделкин",
    type: "editorial-persona",
    isFictional: true,
    publicLabel: "авторская редакционная рубрика",
    role: "Бытовые вопросы строительства простым языком",
    bio: "Редакционный персонаж для понятных объяснений без DIY-инструкций.",
    disclaimer:
      "Иван Самоделкин — редакционный персонаж. Его материалы помогают объяснять типовые строительные ситуации простым языком.",
    toneOfVoice: {
      style: "разговорный, понятный",
      vocabulary: ["участок", "дом", "баня", "семья"],
      avoid: ["сделайте сами", "без специалиста"],
      typicalStructure: ["вопрос", "пример", "совет"],
    },
    allowedContentTypes: ["author-column", "scenario-story", "question-roundup"],
    allowedRubrics: ["bathhouse-stories", "mistakes-and-lessons", "client-scenarios"],
    status: "active",
  },
  {
    id: "marusya-irkutskaya",
    slug: "marusya-irkutskaya",
    name: "Маруся Иркутская",
    type: "editorial-persona",
    isFictional: true,
    publicLabel: "редакционный персонаж",
    role: "Истории про переезд, семью и загородную жизнь",
    bio: "Собирательный образ для семейных сценариев.",
    disclaimer:
      "Маруся Иркутская — собирательный редакционный образ. Истории под этой рубрикой описывают типовые ситуации и не являются отзывами реальных клиентов.",
    toneOfVoice: {
      style: "живой, локальный",
      vocabulary: ["семья", "участок", "дом", "Иркутск"],
      avoid: ["реальный клиент", "мы построили для"],
      typicalStructure: ["hook", "ситуация", "конфликт", "вывод"],
    },
    allowedContentTypes: ["fictionalized-story", "scenario-story", "local-story"],
    allowedRubrics: ["stories-of-building", "project-choice-stories", "local-building-life"],
    teaserStyle: { hookStyle: "story-hook", preferredOpenLoops: ["как семья выбирала"], avoid: ["фейковый отзыв"] },
    status: "active",
  },
  {
    id: "vanya-mamonskiy",
    slug: "vanya-mamonskiy",
    name: "Ваня Мамонский",
    type: "editorial-persona",
    isFictional: true,
    publicLabel: "локальный редакционный персонаж",
    role: "Локальные истории про участки и пригороды",
    bio: "Редакционный персонаж для пригородных сценариев.",
    disclaimer:
      "Ваня Мамонский — редакционный персонаж. Локальные истории под этой рубрикой являются собирательными сценариями, а не описанием конкретных клиентов.",
    toneOfVoice: {
      style: "локальный, практичный",
      vocabulary: ["подъезд", "грунт", "участок", "логистика"],
      avoid: ["выдуманные факты о посёлке"],
      typicalStructure: ["локация", "ситуация", "что проверить"],
    },
    allowedContentTypes: ["local-story", "scenario-story"],
    allowedRubrics: ["local-building-life", "land-plot-stories"],
    teaserStyle: { hookStyle: "local-hook", preferredOpenLoops: ["что учесть в посёлке"], avoid: [] },
    status: "active",
  },
  {
    id: "irina-klubnichnaya",
    slug: "irina-klubnichnaya",
    name: "Ирина Клубничная",
    type: "editorial-persona",
    isFictional: true,
    publicLabel: "авторская редакционная рубрика",
    role: "Семья, быт, терраса, баня, эмоции выбора дома",
    bio: "Тёплые редакционные сценарии без фейковых отзывов.",
    disclaimer:
      "Ирина Клубничная — редакционный персонаж. Материалы под этой рубрикой являются художественно-редакционными сценариями по мотивам частых вопросов клиентов.",
    toneOfVoice: {
      style: "тёплый, семейный",
      vocabulary: ["терраса", "кухня-гостиная", "баня", "сад"],
      avoid: ["клиент сказал", "наш объект"],
      typicalStructure: ["образ", "ситуация", "выбор", "вывод"],
    },
    allowedContentTypes: ["fictionalized-story", "scenario-story", "author-column"],
    allowedRubrics: ["project-choice-stories", "bathhouse-stories", "stories-of-building"],
    status: "active",
  },
];

export function getEditorialAuthorById(id: string) {
  return editorialAuthors.find((a) => a.id === id);
}

export function getDefaultEditorialAuthor() {
  return editorialAuthors.find((a) => a.id === "editorial-stroistroy")!;
}
