import type { TechnicalContentCluster, TechnicalContentQueueItem } from "@/types/technical-content";

export function buildTechnicalFaq(
  item: TechnicalContentQueueItem,
  cluster: TechnicalContentCluster,
): { question: string; answer: string }[] {
  return [
    {
      question: `Можно ли применить советы из статьи без специалиста?`,
      answer:
        "Материал помогает понять принципы и задать правильные вопросы. Конкретное решение по конструкции, утеплению, фундаменту или смете нужно принимать после разбора проекта и участка со специалистом.",
    },
    {
      question: `Почему нельзя назвать точную цену по этой теме?`,
      answer:
        "Итог зависит от проекта, участка, грунта, комплектации, инженерии и логистики. Предварительный расчёт возможен после уточнения вводных.",
    },
    {
      question: `Актуально ли это для Иркутской области?`,
      answer:
        cluster.category === "materials" || cluster.primaryIntent === "local"
          ? "Да, с учётом климата, сезонности и логистики региона — но финальные решения зависят от конкретного участка."
          : "Принципы универсальны; для Иркутской области дополнительно учитывают сезонность, грунт и удалённость участка.",
    },
  ];
}
