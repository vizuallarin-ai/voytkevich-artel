/** Общие тексты, CTA и блоки — реэкспорт из positioning + локальные блоки */

import { cta as positioningCta, pageCopy } from "./positioning";

export { pageMeta } from "./positioning";

export const cta = positioningCta;

export const microTrust =
  "127 домов · гарантия до 5 лет · с 2014 года";

export const heroCopy = pageCopy.hero;

export const trustBenefits = [
  {
    title: "Смета до старта",
    description: "Состав работ и бюджет фиксируем в договоре — до выхода на объект.",
  },
  {
    title: "Гарантия",
    description: "До 5 лет на конструктив, до 2 лет на отделку — в договоре.",
  },
  {
    title: "Фотоотчёты",
    description: "Каждые 3 дня — фото с объекта: что сделано и что дальше.",
  },
  {
    title: "По этапам",
    description: "График работ до старта — вы видите, где объект сейчас.",
  },
  {
    title: "Проект под вас",
    description: "Адаптируем планировку под участок и сценарий жизни семьи.",
  },
] as const;

export const audienceCards = [
  {
    title: "Семье с детьми",
    description: "Спальни, хранение, кухня-гостиная — удобство в быту, не на картинке.",
  },
  {
    title: "Из квартиры в дом",
    description: "От мечты к площади, проекту, смете и этапам — по шагам.",
  },
  {
    title: "Есть участок",
    description: "Проверим подъезд, грунт, коммуникации и посадку дома до старта.",
  },
  {
    title: "Из другого города",
    description: "Этапы, фото и связь — контроль без постоянных поездок.",
  },
  {
    title: "Выбор материала",
    description: "Брус, каркас, газобетон — что подходит под задачу и бюджет.",
  },
] as const;

export const turnkeyIncluded = {
  title: "Что входит в «под ключ»",
  footnote: "Состав зависит от комплектации. До договора — смета по этапам.",
  items: [
    "консультация и предварительный расчёт",
    "адаптация проекта",
    "подготовка сметы",
    "фундамент",
    "коробка дома",
    "кровля",
    "окна и двери",
    "инженерные системы",
    "отопление",
    "электрика",
    "водоснабжение",
    "канализация",
    "внутренняя отделка",
    "сдача объекта",
    "гарантийное сопровождение",
  ],
} as const;

export const catalogAdaptation = {
  title: pageCopy.catalog.adaptationTitle,
  description: pageCopy.catalog.adaptationText,
} as const;

export const projectDescriptionDefault =
  "Проект можно адаптировать под участок, бюджет и состав семьи. После консультации подготовим актуальную смету и уточним комплектацию.";

export const calculatorDisclaimer = pageCopy.calculator.disclaimer;

export const founderBlock = {
  title: "Александр Войткевич",
  description:
    "Руководитель артели. Принцип: сначала смета и этапы — потом стройка. Вы понимаете процесс и получаете дом для жизни, а не сюрпризы на объекте.",
} as const;

export const aboutIntro = {
  headline: pageCopy.about.headline,
  lead: pageCopy.about.lead,
  body: pageCopy.about.body,
} as const;

export const privacyConsent =
  "Нажимая кнопку, вы соглашаетесь на обработку персональных данных для связи по заявке. Данные не передаются третьим лицам без вашего согласия.";

export const privacyLinkText = "Политика конфиденциальности";
