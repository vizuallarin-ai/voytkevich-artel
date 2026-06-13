import type { StoredLead } from "@/types/lead";

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

export const demoLeads: StoredLead[] = [
  {
    id: "demo_calc_001",
    isDemo: true,
    status: "new",
    source: {
      sourceType: "calculator",
      formName: "Калькулятор стоимости",
      currentUrl: "https://stroistroy.ru/calculator",
      ctaLabel: "Получить предварительный расчёт",
    },
    contact: { name: "Алексей", phone: "+79001234567", messenger: "Telegram" },
    request: {
      type: "calculator-result",
      title: "Расчёт калькулятора",
      selectedCTA: "Получить предварительный расчёт",
      comment: "Хочу понять смету по этапам",
    },
    context: {
      calculator: {
        area: 140,
        floors: 1,
        material: "газобетон",
        finish: "под ключ",
        total: 9200000,
        perSqm: 65714,
        durationMinMonths: 8,
      },
    },
    qualification: { readiness: "hot", leadScore: 75, desiredArea: 140, desiredMaterial: "газобетон" },
    analytics: { utm: { source: "yandex", medium: "cpc", campaign: "dom-irkutsk" } },
    meta: { createdAt: daysAgo(1), currentUrl: "/calculator" },
    comments: [],
    timeline: [{ id: "t1", leadId: "demo_calc_001", type: "created", title: "Заявка создана", createdAt: daysAgo(1) }],
    automation: {
      priority: "urgent",
      processingType: "calculator",
      sla: {
        priority: "urgent",
        targetResponseMinutes: 15,
        responseDeadlineAt: daysAgo(0.01),
        isOverdue: true,
        overdueMinutes: 120,
      },
      recommendedAction: {
        type: "review-calculator",
        title: "Разобрать расчёт",
        description: "Уточнить участок, комплектацию, фундамент и подготовить более точную смету.",
        status: "open",
        createdBy: "system",
      },
      notifications: [{ channel: "mock", success: true, sentAt: daysAgo(1) }],
      lastAutomationAt: daysAgo(1),
    },
    nextAction: {
      type: "review-calculator",
      title: "Разобрать расчёт",
      description: "Уточнить участок, комплектацию, фундамент.",
      status: "overdue",
      createdBy: "system",
    },
  },
  {
    id: "demo_project_002",
    isDemo: true,
    status: "contacted",
    source: { sourceType: "project-page", pageSlug: "angara-100-gotovyj-proekt-dvuhetazhnogo-doma", formName: "Расчёт проекта" },
    contact: { name: "Марина", phone: "+79007654321" },
    request: { type: "project-estimate", title: "Заявка по проекту", selectedCTA: "Отправить проект на расчёт" },
    context: {
      project: { slug: "angara-100-gotovyj-proekt-dvuhetazhnogo-doma", title: "Ангара 100", area: 100, material: "брус", floors: 2, priceFrom: 6500000 },
    },
    qualification: { readiness: "warm", leadScore: 55, desiredArea: 100 },
    analytics: {},
    meta: { createdAt: daysAgo(3), currentUrl: "/catalog/angara-100-gotovyj-proekt-dvuhetazhnogo-doma" },
    comments: [{ id: "c1", leadId: "demo_project_002", text: "Позвонила, уточняем участок в Иркутском районе", authorName: "Менеджер", createdAt: daysAgo(2) }],
    timeline: [
      { id: "t2", leadId: "demo_project_002", type: "created", title: "Заявка создана", createdAt: daysAgo(3) },
      { id: "t3", leadId: "demo_project_002", type: "status_changed", title: "Статус: Связались", createdAt: daysAgo(2) },
    ],
    nextAction: { type: "call", at: daysAgo(-2), comment: "Уточнить комплектацию и участок" },
  },
  {
    id: "demo_magnet_003",
    isDemo: true,
    status: "new",
    source: { sourceType: "lead-magnet", pageSlug: "smeta-na-stroitelstvo-doma-iz-chego-sostoit" },
    contact: { name: "Игорь", phone: "+79001112233" },
    request: { type: "lead-magnet", title: "Пример сметы", selectedCTA: "Получить пример сметы" },
    context: {
      leadMagnet: { id: "estimate-example", title: "Пример сметы на строительство дома", type: "pdf", fileStatus: "future" },
      blog: { slug: "smeta-na-stroitelstvo-doma-iz-chego-sostoit", title: "Смета на строительство дома: из чего состоит", clusterId: "estimate" },
    },
    qualification: { readiness: "warm", leadScore: 40 },
    analytics: { utm: { source: "google", medium: "organic" } },
    meta: { createdAt: daysAgo(5), currentUrl: "/blog/smeta-na-stroitelstvo-doma-iz-chego-sostoit" },
    comments: [],
    timeline: [{ id: "t4", leadId: "demo_magnet_003", type: "created", title: "Заявка создана", createdAt: daysAgo(5) }],
  },
  {
    id: "demo_planner_004",
    isDemo: true,
    status: "in_discussion",
    source: { sourceType: "planner", formName: "Планировщик дома" },
    contact: { name: "Светлана", phone: "+79003334455" },
    request: { type: "planner-review", title: "Разбор планировки", selectedCTA: "Отправить планировку" },
    context: {
      planner: {
        scenario: "family_with_kids",
        targetArea: 150,
        totalArea: 152,
        floors: 1,
        rooms: [
          { type: "bedroom", name: "Спальня", area: 16 },
          { type: "bedroom", name: "Детская", area: 14 },
          { type: "kitchen_living", name: "Кухня-гостиная", area: 32 },
        ],
        recommendations: ["Добавить второй санузел", "Проверить террасу под участок"],
      },
    },
    qualification: { readiness: "hot", leadScore: 70, hasLand: "yes", landLocation: "Иркутский район" },
    analytics: {},
    meta: { createdAt: daysAgo(2), currentUrl: "/planirovka" },
    comments: [],
    timeline: [{ id: "t5", leadId: "demo_planner_004", type: "created", title: "Заявка создана", createdAt: daysAgo(2) }],
  },
];

export function shouldIncludeDemoLeads(realCount: number): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.LEADS_USE_DEMO === "true") return true;
  return realCount === 0 && process.env.NODE_ENV === "development";
}
