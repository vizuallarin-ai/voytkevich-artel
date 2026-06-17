import type { TechnicalDisclaimer } from "@/types/technical-content";

export const technicalDisclaimers: TechnicalDisclaimer[] = [
  {
    id: "general-technical",
    title: "Общий технический дисклеймер",
    text: "Материал носит информационный характер и отражает редакционное/экспертное мнение. Конкретное решение по конструкции, утеплению, фундаменту, кровле, инженерии или смете нужно принимать после анализа проекта, участка, грунта, материалов, климатических условий и требований специалистов.",
    appliesTo: "all",
  },
  {
    id: "insulation",
    title: "Дисклеймер для утепления",
    text: "Информация об утеплении дана для общего понимания принципов. Толщину утеплителя, пирог конструкции, пароизоляцию, вентиляционные зазоры и узлы примыкания нужно подбирать под конкретный проект, регион, материалы и условия эксплуатации.",
    appliesTo: ["roof", "walls", "floor", "insulation", "vapor-barrier"],
  },
  {
    id: "foundation",
    title: "Дисклеймер для фундамента",
    text: "Материал не заменяет инженерный расчёт. Тип фундамента нужно выбирать после анализа грунта, рельефа, уровня воды, нагрузки от дома и особенностей участка.",
    appliesTo: ["foundation", "land-plot"],
  },
  {
    id: "estimate",
    title: "Дисклеймер для сметы",
    text: "Ориентиры по стоимости не являются финальной сметой. Итоговая цена зависит от проекта, участка, фундамента, комплектации, инженерии, логистики и выбранных материалов.",
    appliesTo: ["estimate"],
  },
  {
    id: "regulatory",
    title: "Дисклеймер для нормативных тем",
    text: "Материал не является юридической консультацией. Перед принятием решений по документам, нормам и требованиям нужно проверять актуальные источники и консультироваться со специалистами.",
    appliesTo: ["contract", "quality-control"],
  },
];

export function getTechnicalDisclaimerById(id: string): TechnicalDisclaimer | undefined {
  return technicalDisclaimers.find((d) => d.id === id);
}

export function resolveDisclaimerForCluster(category: string): TechnicalDisclaimer {
  const specific = technicalDisclaimers.find(
    (d) => d.appliesTo !== "all" && (d.appliesTo as string[]).includes(category),
  );
  return specific ?? technicalDisclaimers.find((d) => d.id === "general-technical")!;
}
