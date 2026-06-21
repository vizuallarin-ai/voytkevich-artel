export type SynonymRelationType =
  | "exact-synonym"
  | "close-synonym"
  | "alias"
  | "abbreviation"
  | "related-term"
  | "deprecated-term";

export type SearchSynonymEntry = {
  term: string;
  variants: string[];
  relation: SynonymRelationType;
  context?: string;
};

/** Curated synonyms from taxonomy and entity registry — not all similar terms are interchangeable. */
export const searchSynonyms: SearchSynonymEntry[] = [
  {
    term: "дом под ключ",
    variants: ["строительство дома под ключ", "дома под ключ", "строительство под ключ"],
    relation: "exact-synonym",
  },
  {
    term: "газобетон",
    variants: ["газоблок", "газобетонные блоки"],
    relation: "alias",
    context: "material",
  },
  {
    term: "каркас",
    variants: ["каркасная технология", "каркасный дом", "каркасное строительство"],
    relation: "close-synonym",
    context: "technology",
  },
  {
    term: "одноэтажный",
    variants: ["1 этаж", "одноэтажный дом", "1-этажный"],
    relation: "alias",
  },
  {
    term: "двухэтажный",
    variants: ["2 этажа", "двухэтажный дом", "2-этажный"],
    relation: "alias",
  },
  {
    term: "иркутский район",
    variants: ["иркутский р-н", "иркутский р-n"],
    relation: "alias",
    context: "location",
  },
  {
    term: "иркутск",
    variants: ["irkutsk"],
    relation: "alias",
    context: "location",
  },
  {
    term: "баня",
    variants: ["бани", "строительство бани", "баня под ключ"],
    relation: "close-synonym",
  },
  {
    term: "калькулятор",
    variants: ["расчёт стоимости", "рассчитать стоимость", "калькулятор стоимости"],
    relation: "related-term",
    context: "conversion",
  },
];

export const SEARCH_QUERY_MAX_LENGTH = 200;
export const SEARCH_RESULTS_PAGE_SIZE = 20;
export const EMBEDDING_MODEL_LOCAL = "local-bow-v1";
export const EMBEDDING_DIMENSION = 128;
