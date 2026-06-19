import type { ContentCalendarView } from "@/types/content-calendar";

export type CalendarViewConfig = {
  id: ContentCalendarView;
  label: string;
  route: string;
  description: string;
};

export const contentCalendarViews: CalendarViewConfig[] = [
  {
    id: "day",
    label: "День",
    route: "/dashboard/content/calendar",
    description: "Публикации на выбранный день",
  },
  {
    id: "week",
    label: "Неделя",
    route: "/dashboard/content/calendar/week",
    description: "Недельный обзор слотов и материалов",
  },
  {
    id: "month",
    label: "Месяц",
    route: "/dashboard/content/calendar/month",
    description: "Месячный обзор плотности публикаций",
  },
  {
    id: "queue",
    label: "Очередь",
    route: "/dashboard/content/calendar/queue",
    description: "Approved материалы без расписания",
  },
];

export const DEFAULT_TIMEZONE = "Asia/Irkutsk";

export const DEFAULT_PUBLICATION_HOURS = [9, 11, 14, 17];

export const DEFAULT_PUBLICATION_DAYS = [1, 2, 3, 4, 5];
