import type { AnalyticsReport } from "@/types/analytics";

function csvCell(value: string | number | null | undefined): string {
  const raw = value == null ? "" : String(value);
  if (/[",\n\r]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

function section(title: string, headers: string[], rows: (string | number)[][]): string {
  const lines = [`\n# ${title}`, headers.map(csvCell).join(",")];
  for (const row of rows) {
    lines.push(row.map(csvCell).join(","));
  }
  return lines.join("\n");
}

export function analyticsReportToCsv(report: AnalyticsReport): string {
  const parts: string[] = [
    `# Analytics export — ${report.range.label}`,
    `# Generated: ${new Date().toISOString()}`,
  ];

  parts.push(
    section(
      "KPI",
      ["metric", "value"],
      [
        ["pageViews", report.kpis.pageViews],
        ["leads", report.kpis.leads],
        ["hotLeads", report.kpis.hotLeads],
        ["avgLeadScore", report.kpis.avgLeadScore],
        ["formSubmitRate", report.kpis.formSubmitRate ?? ""],
        ["overdueSLA", report.kpis.overdueSLA],
        ["topSource", report.kpis.topSource ?? ""],
        ["topPage", report.kpis.topPage ?? ""],
        ["topCTA", report.kpis.topCTA ?? ""],
      ],
    ),
  );

  parts.push(
    section(
      "Pages",
      ["path", "pageType", "views", "ctaClicks", "leads", "conversion", "score", "hot"],
      report.pages.map((p) => [
        p.path,
        p.pageType,
        p.views,
        p.ctaClicks,
        p.leads,
        p.conversionRate ?? "",
        p.leadQualityAvg,
        p.hotLeads,
      ]),
    ),
  );

  parts.push(
    section(
      "Sources",
      ["source", "medium", "campaign", "leads", "hot", "score", "sessions"],
      report.sources.map((s) => [
        s.source,
        s.medium ?? "",
        s.campaign ?? "",
        s.leads,
        s.hotLeads,
        s.averageLeadScore,
        s.sessions ?? "",
      ]),
    ),
  );

  parts.push(
    section(
      "CRM status",
      ["status", "count"],
      Object.entries(report.crm.byStatus).map(([status, count]) => [status, count]),
    ),
  );

  return `\uFEFF${parts.join("\n")}\n`;
}
