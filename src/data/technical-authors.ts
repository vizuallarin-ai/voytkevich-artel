import type { TechnicalAuthor } from "@/types/technical-content";

export const technicalAuthors: TechnicalAuthor[] = [
  {
    id: "editorial-stroistroy",
    name: "Редакция СтройСтрой",
    type: "brand-voice",
    publicLabel: "Редакция СтройСтрой",
    role: "Официальный редакционный голос сайта",
    style: ["структурно", "без перегруза", "с акцентом на риски"],
    default: true,
  },
  {
    id: "anton-korobkov",
    name: "Антон Коробков",
    type: "editorial-persona",
    publicLabel: "редакционный технический автор",
    role: "Объясняет строительные технологии простым языком",
    style: ["спокойно", "структурно", "без лишней воды", "с акцентом на риски"],
    limitations: "Не выдавать за реального инженера",
  },
  {
    id: "ivan-samodelkin",
    name: "Иван Самоделкин",
    type: "editorial-persona",
    publicLabel: "авторская редакционная рубрика",
    role: "Объясняет бытовые вопросы строительства понятным языком",
    style: ["просто", "по делу", "с примерами"],
    limitations: "Не превращать статьи в инструкции «делай сам без специалиста»",
  },
];

export function getTechnicalAuthorById(id: string): TechnicalAuthor | undefined {
  return technicalAuthors.find((a) => a.id === id);
}

export function getDefaultTechnicalAuthor(): TechnicalAuthor {
  return technicalAuthors.find((a) => a.default) ?? technicalAuthors[0];
}
