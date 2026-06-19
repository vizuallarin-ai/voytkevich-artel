export type CalendarAuditEntry = {
  id: string;
  calendarItemId?: string;
  contentItemId?: string;
  action: string;
  at: string;
  details?: string;
};

const auditLog: CalendarAuditEntry[] = [];

export const calendarAuditLog = {
  append(entry: Omit<CalendarAuditEntry, "id" | "at">): void {
    auditLog.unshift({
      ...entry,
      id: `cal-audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      at: new Date().toISOString(),
    });
  },

  list(): CalendarAuditEntry[] {
    return auditLog;
  },

  forContent(contentItemId: string): CalendarAuditEntry[] {
    return auditLog.filter((e) => e.contentItemId === contentItemId);
  },

  forCalendarItem(calendarItemId: string): CalendarAuditEntry[] {
    return auditLog.filter((e) => e.calendarItemId === calendarItemId);
  },
};
