import type { LeadStatus } from "@/types/lead";

export type LeadStatusMeta = {
  label: string;
  description: string;
  badgeClass: string;
};

export const LEAD_STATUS_META: Record<LeadStatus, LeadStatusMeta> = {
  new: {
    label: "Новый",
    description: "Заявка только поступила",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
  qualified: {
    label: "Квалифицирован",
    description: "Лид соответствует целевому профилю",
    badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  contacted: {
    label: "Связались",
    description: "Первый контакт состоялся",
    badgeClass: "bg-sky-100 text-sky-800 border-sky-200",
  },
  in_discussion: {
    label: "В обсуждении",
    description: "Идёт диалог по проекту и вводным",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-200",
  },
  estimate_requested: {
    label: "Нужна смета",
    description: "Ожидает расчёт или смету",
    badgeClass: "bg-orange-100 text-orange-900 border-orange-200",
  },
  proposal_sent: {
    label: "КП отправлено",
    description: "Коммерческое предложение отправлено",
    badgeClass: "bg-violet-100 text-violet-900 border-violet-200",
  },
  won: {
    label: "Сделка выиграна",
    description: "Клиент принял решение строить",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-200",
  },
  lost: {
    label: "Потерян",
    description: "Лид не конвертировался",
    badgeClass: "bg-muted text-muted-foreground border-graphite/15",
  },
  spam: {
    label: "Спам",
    description: "Нецелевая или подозрительная заявка",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
  },
};

export const LEAD_STATUS_ORDER: LeadStatus[] = [
  "new",
  "qualified",
  "contacted",
  "in_discussion",
  "estimate_requested",
  "proposal_sent",
  "won",
  "lost",
  "spam",
];

const ALLOWED_TRANSITIONS: Partial<Record<LeadStatus, LeadStatus[]>> = {
  new: ["contacted", "qualified", "spam"],
  qualified: ["contacted", "in_discussion", "estimate_requested", "spam"],
  contacted: ["in_discussion", "lost", "estimate_requested", "spam"],
  in_discussion: ["estimate_requested", "proposal_sent", "lost"],
  estimate_requested: ["proposal_sent", "lost"],
  proposal_sent: ["won", "lost"],
  lost: ["in_discussion"],
  spam: ["new"],
  won: [],
};

export function getLeadStatusLabel(status: LeadStatus): string {
  return LEAD_STATUS_META[status]?.label ?? status;
}

export function canTransitionStatus(from: LeadStatus, to: LeadStatus): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAllowedNextStatuses(status: LeadStatus): LeadStatus[] {
  return ALLOWED_TRANSITIONS[status] ?? [];
}

export const READINESS_META = {
  hot: { label: "Горячий", badgeClass: "bg-red-100 text-red-800 border-red-200" },
  warm: { label: "Тёплый", badgeClass: "bg-amber-100 text-amber-900 border-amber-200" },
  cold: { label: "Холодный", badgeClass: "bg-slate-100 text-slate-700 border-slate-200" },
  unknown: { label: "Не определено", badgeClass: "bg-muted text-muted-foreground border-graphite/15" },
} as const;

export const NEXT_ACTION_LABELS: Record<string, string> = {
  call: "Позвонить",
  message: "Написать",
  "prepare-estimate": "Подготовить смету",
  "send-proposal": "Отправить КП",
  "send-project-selection": "Подбор проектов",
  "review-calculator": "Разобрать расчёт",
  "review-planner": "Разобрать планировку",
  "send-lead-magnet": "Отправить лид-магнит",
  "clarify-land": "Уточнить участок",
  "clarify-budget": "Уточнить бюджет",
  "mortgage-consultation": "Ипотека",
  "follow-up": "Повторный контакт",
  meeting: "Встреча",
  "no-action": "Без действия",
};

export const PRIORITY_META = {
  urgent: { label: "Срочный", badgeClass: "bg-red-100 text-red-900 border-red-300" },
  high: { label: "Высокий", badgeClass: "bg-orange-100 text-orange-900 border-orange-200" },
  normal: { label: "Обычный", badgeClass: "bg-blue-50 text-blue-800 border-blue-200" },
  low: { label: "Низкий", badgeClass: "bg-slate-100 text-slate-600 border-slate-200" },
} as const;

export const LOST_REASON_LABELS: Record<string, string> = {
  no_answer: "Не дозвонились",
  too_expensive: "Дорого",
  no_land: "Нет участка",
  postponed: "Отложил строительство",
  competitor: "Выбрал другого подрядчика",
  not_target: "Нецелевой",
  spam: "Спам",
  other: "Другое",
};
