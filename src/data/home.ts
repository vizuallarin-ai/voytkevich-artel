/** Контент главной — лидогенерирующая воронка */

import {
  clientSegments,
  homeScenarios,
  marketPain,
  marketPosition,
  pageCopy,
  uspItems,
} from "./positioning";

export const heroTrustFacts = [
  { value: "2014", label: "год основания" },
  { value: "127+", label: "домов сдано" },
  { value: "5 лет", label: "гарантия" },
  { value: "3 дня", label: "фотоотчёты" },
] as const;

export const clientScenarios = homeScenarios;

export const keyBenefits = uspItems.slice(0, 6);

export const calculatorPromo = {
  title: "Сколько стоит ваш дом",
  description:
    "Площадь, материал, этажность, комплектация — ориентир за 2 минуты.",
  factors: [
    "площадь и этажность",
    "материал стен",
    "фундамент",
    "комплектация",
    "участок и инженерия",
  ],
  disclaimer: pageCopy.calculator.disclaimer,
  example: {
    area: 120,
    material: "газобетон",
    floors: 1,
    cta: "Рассчитать",
  },
} as const;

/** Быстрые категории каталога на главной */
export const catalogHomeCategories = [
  { slug: "odnoetazhnye", label: "Одноэтажные" },
  { slug: "dvukhetazhnye", label: "Двухэтажные" },
  { slug: "do-100-m2", label: "До 100 м²" },
  { slug: "100-150-m2", label: "100–150 м²" },
  { slug: "iz-brusa", label: "Из бруса" },
  { slug: "karkasnye", label: "Каркасные" },
  { slug: "iz-gazobetona", label: "Из газобетона" },
  { slug: "doma-dlya-semi", label: "Для семьи" },
  { slug: "s-terrasoj", label: "С террасой" },
  { slug: "do-10-mln", label: "До 10 млн ₽" },
] as const;

export const hiddenCostsBlock = {
  title: "Без скрытых доплат",
  problem: marketPain,
  position: marketPosition,
  solutions: [
    "Состав работ заранее",
    "Смета по этапам",
    "Видно, что входит и что нет",
    "Изменения — только по согласованию",
    "Фотоотчёты с объекта",
    "Сдача по этапам",
    "Риски участка — до старта",
  ],
} as const;

export const homeProcessSteps = [
  {
    id: "1",
    title: "Заявка",
    description: "Участок, площадь, бюджет, сроки — уточняем вводные.",
  },
  {
    id: "2",
    title: "Расчёт",
    description: "Ориентир по площади, материалу и комплектации.",
  },
  {
    id: "3",
    title: "Проект и смета",
    description: "Подбираем или адаптируем проект, фиксируем этапы.",
  },
  {
    id: "4",
    title: "Договор",
    description: "Условия, оплата, сроки — в одном документе.",
  },
  {
    id: "5",
    title: "Стройка",
    description: "Работы по этапам, фотоотчёты, согласования.",
  },
  {
    id: "6",
    title: "Сдача",
    description: "Дом, документы, гарантия.",
  },
] as const;

export const casesBlock = {
  title: "Реальные дома",
  disclaimer:
    "Раздел пополняется объектами и отзывами. Ниже — проекты из каталога для ориентира.",
} as const;

export const trustHomeBlock = {
  title: "Конкретные люди, не «бригада»",
  description:
    "Знаете, кто ведёт проект и кому звонить. Руководитель контролирует смету, этапы и связь с вами.",
} as const;

export const audienceSegments = clientSegments.map((s) => ({
  title: s.title,
  description: s.message,
}));

export const whatWeTakeBlock = {
  title: "Что берём на себя",
  footnote: "Состав зависит от комплектации. Можно начать с расчёта и проекта.",
  items: [
    "консультация по участку",
    "подбор проекта",
    "смета",
    "проектирование",
    "фундамент",
    "коробка",
    "кровля",
    "окна и двери",
    "инженерия",
    "отделка",
    "сдача",
    "гарантия",
  ],
} as const;

export const homeSeoText = {
  title: "Строительство домов под ключ в Иркутске",
  paragraphs: [
    "Строим малоэтажные дома под ключ: от расчёта и проекта до сдачи. Каркас, брус, газобетон — под задачу и бюджет.",
    "Начните с калькулятора, каталога или заявки — подскажем реалистичный следующий шаг под ваш участок и сроки.",
  ],
} as const;

export const homeFaqItems = [
  {
    id: "h1",
    question: "Сколько стоит дом под ключ?",
    answer:
      "Зависит от площади, материала, фундамента и комплектации. Ориентир — в калькуляторе; точная смета после вводных.",
  },
  {
    id: "h2",
    question: "Можно по готовому проекту?",
    answer: "Да. Выберите в каталоге — адаптируем под участок и семью.",
  },
  {
    id: "h3",
    question: "Что входит в «под ключ»?",
    answer: "Зависит от комплектации. До договора — смета с разбивкой по этапам.",
  },
  {
    id: "h4",
    question: "Можно изменить планировку?",
    answer: "Да, на этапе проекта — до старта стройки.",
  },
  {
    id: "h5",
    question: "Как контролировать удалённо?",
    answer: "Этапы, фотоотчёты и связь по ключевым решениям.",
  },
  {
    id: "h6",
    question: "Почему цена меняется после расчёта?",
    answer: "Первый расчёт — ориентир. Точная смета учитывает участок, геологию и инженерию.",
  },
  {
    id: "h7",
    question: "Строите в области?",
    answer: "Да, Иркутск и область. Логистику и сезон учитываем на консультации.",
  },
] as const;

export const finalLeadBlock = {
  label: "Расчёт",
  title: "Какой дом реально построить под ваш бюджет?",
  subtitle: pageCopy.forms.defaultSubtitle,
  footnote: pageCopy.forms.defaultFootnote,
} as const;
