export type ConversionGoalId =
  | "form_submit"
  | "callback_request"
  | "project_request"
  | "calculator_submit"
  | "planner_submit"
  | "lead_magnet_submit"
  | "service_page_submit"
  | "blog_submit"
  | "case_like_request"
  | "objects_map_request"
  | "catalog_project_selection"
  | "estimate_request"
  | "mortgage_request";

export type ConversionGoal = {
  id: ConversionGoalId;
  goalName: string;
  humanName: string;
  trigger: string;
  requiredPayload?: string[];
};

export const conversionGoals: ConversionGoal[] = [
  { id: "form_submit", goalName: "form_submit", humanName: "Отправка формы", trigger: "Любая успешная заявка" },
  { id: "callback_request", goalName: "callback_request", humanName: "Заявка на звонок", trigger: "Главная / общая форма" },
  { id: "project_request", goalName: "project_request", humanName: "Заявка по проекту", trigger: "Карточка проекта", requiredPayload: ["projectSlug"] },
  { id: "calculator_submit", goalName: "calculator_submit", humanName: "Расчёт калькулятора", trigger: "Калькулятор", requiredPayload: ["calculator"] },
  { id: "planner_submit", goalName: "planner_submit", humanName: "Планировка", trigger: "Планировщик", requiredPayload: ["planner"] },
  { id: "lead_magnet_submit", goalName: "lead_magnet_submit", humanName: "Лид-магнит", trigger: "LeadMagnetForm", requiredPayload: ["leadMagnetId"] },
  { id: "service_page_submit", goalName: "service_page_submit", humanName: "Коммерческая страница", trigger: "ServiceLeadSection" },
  { id: "blog_submit", goalName: "blog_submit", humanName: "Статья блога", trigger: "BlogFinalLeadForm" },
  { id: "case_like_request", goalName: "case_like_request", humanName: "Похожий дом", trigger: "Кейс" },
  { id: "objects_map_request", goalName: "objects_map_request", humanName: "Карта объектов", trigger: "/objects-map" },
  { id: "catalog_project_selection", goalName: "catalog_project_selection", humanName: "Подбор проекта", trigger: "Каталог" },
  { id: "estimate_request", goalName: "estimate_request", humanName: "Запрос сметы", trigger: "Смета / estimate lead magnet" },
  { id: "mortgage_request", goalName: "mortgage_request", humanName: "Ипотека", trigger: "Ипотечная страница / lead magnet" },
];

export function getConversionGoal(id: ConversionGoalId): ConversionGoal | undefined {
  return conversionGoals.find((g) => g.id === id);
}

export function inferConversionGoal(sourceType?: string, requestType?: string): ConversionGoalId {
  if (requestType === "calculator-result") return "calculator_submit";
  if (requestType === "planner-review") return "planner_submit";
  if (requestType === "lead-magnet") return "lead_magnet_submit";
  if (requestType === "project-estimate") return "project_request";
  if (requestType === "case-like") return "case_like_request";
  if (requestType === "object-map") return "objects_map_request";
  if (requestType === "service-page") return "service_page_submit";
  if (requestType === "project-selection") return "catalog_project_selection";
  if (sourceType === "blog-post") return "blog_submit";
  if (sourceType === "home") return "callback_request";
  return "form_submit";
}
