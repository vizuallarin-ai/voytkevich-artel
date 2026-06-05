export type BlogLeadMagnet = {
  id: string;
  title: string;
  description: string;
  cta: string;
  clusterIds: string[];
  formTitle: string;
  submitLabel: string;
  /** TODO: PDF generation or file delivery */
  deliveryNote: string;
};

export const blogLeadMagnets: BlogLeadMagnet[] = [
  {
    id: "estimate-example",
    title: "Пример структуры сметы на дом",
    description:
      "Покажем, из каких разделов обычно состоит смета — без фиктивных сумм. Точные цифры только после ваших вводных.",
    cta: "Получить пример сметы",
    clusterIds: ["cost", "estimate"],
    formTitle: "Получить пример структуры сметы",
    submitLabel: "Получить пример сметы",
    deliveryNote: "TODO: отправка PDF или письма менеджером после заявки.",
  },
  {
    id: "land-checklist",
    title: "Чек-лист проверки участка",
    description: "Что проверить на участке до проекта и сметы: подъезд, коммуникации, геология, посадка дома.",
    cta: "Получить чек-лист участка",
    clusterIds: ["foundation-land", "land"],
    formTitle: "Получить чек-лист проверки участка",
    submitLabel: "Получить чек-лист",
    deliveryNote: "TODO: PDF чек-листа после интеграции CRM.",
  },
  {
    id: "budget-project-selection",
    title: "Подборка проектов под бюджет",
    description: "Подберём ориентиры по проектам с учётом площади, материала и заявленного бюджета.",
    cta: "Получить подборку проектов",
    clusterIds: ["cost", "planning"],
    formTitle: "Подбор проектов под бюджет",
    submitLabel: "Получить подборку",
    deliveryNote: "TODO: автоматическая подборка из каталога.",
  },
  {
    id: "layout-review",
    title: "Разбор планировки",
    description: "Отправьте черновик планировки или параметры — обсудим площадь, зонирование и следующий шаг.",
    cta: "Отправить планировку на разбор",
    clusterIds: ["planning"],
    formTitle: "Отправить планировку на разбор",
    submitLabel: "Отправить на разбор",
    deliveryNote: "Связка с /planirovka draft — TODO.",
  },
  {
    id: "material-comparison",
    title: "Сравнение технологий под ваш дом",
    description: "Поможем сопоставить брус, каркас и газобетон с учётом участка и сценария проживания.",
    cta: "Получить сравнение материалов",
    clusterIds: ["materials", "comparisons"],
    formTitle: "Сравнить материалы для моего дома",
    submitLabel: "Получить сравнение",
    deliveryNote: "Консультация менеджера после заявки.",
  },
  {
    id: "mistakes-checklist",
    title: "10 ошибок при строительстве дома",
    description: "Чек-лист типичных ошибок заказчиков — чтобы обсудить свой проект до старта.",
    cta: "Получить чек-лист ошибок",
    clusterIds: ["mistakes"],
    formTitle: "Получить чек-лист ошибок",
    submitLabel: "Получить чек-лист",
    deliveryNote: "TODO: PDF после CRM.",
  },
];

export function getLeadMagnetById(id: string): BlogLeadMagnet | undefined {
  return blogLeadMagnets.find((m) => m.id === id);
}

export function getLeadMagnetsForCluster(clusterId: string): BlogLeadMagnet[] {
  return blogLeadMagnets.filter((m) => m.clusterIds.includes(clusterId));
}
