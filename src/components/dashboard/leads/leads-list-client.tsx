"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LEAD_STATUS_ORDER, LEAD_STATUS_META } from "@/lib/leads/lead-status";
import type { LeadListResult } from "@/types/lead";
import { LeadsTable } from "./leads-table";

export function LeadsListClient({ initial }: { initial: LeadListResult }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const apply = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([k, v]) => {
        if (!v) params.delete(k);
        else params.set(k, v);
      });
      router.push(`/dashboard/leads?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="heading-section text-3xl">Лиды</h1>
          <p className="mt-1 text-sm text-muted">
            {initial.total} заявок · страница {initial.page} из {initial.totalPages}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/api/dashboard/export?${searchParams.toString()}`}>Экспорт CSV</a>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 rounded-sm border border-graphite/10 bg-background p-4 md:grid-cols-4">
        <Input
          placeholder="Поиск: имя, телефон, проект..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply({ search, page: "1" })}
        />
        <select
          className="rounded-sm border border-graphite/15 bg-background px-3 py-2 text-sm"
          value={searchParams.get("status") ?? ""}
          onChange={(e) => apply({ status: e.target.value || null, page: "1" })}
        >
          <option value="">Все статусы</option>
          {LEAD_STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {LEAD_STATUS_META[s].label}
            </option>
          ))}
        </select>
        <select
          className="rounded-sm border border-graphite/15 bg-background px-3 py-2 text-sm"
          value={searchParams.get("readiness") ?? ""}
          onChange={(e) => apply({ readiness: e.target.value || null, page: "1" })}
        >
          <option value="">Любая готовность</option>
          <option value="hot">Горячий</option>
          <option value="warm">Тёплый</option>
          <option value="cold">Холодный</option>
        </select>
        <select
          className="rounded-sm border border-graphite/15 bg-background px-3 py-2 text-sm"
          value={searchParams.get("sourceType") ?? ""}
          onChange={(e) => apply({ sourceType: e.target.value || null, page: "1" })}
        >
          <option value="">Все источники</option>
          <option value="calculator">Калькулятор</option>
          <option value="project-page">Проект</option>
          <option value="lead-magnet">Лид-магнит</option>
          <option value="planner">Планировщик</option>
          <option value="service-page">Услуга</option>
          <option value="blog-post">Блог</option>
          <option value="home">Главная</option>
        </select>
        <select
          className="rounded-sm border border-graphite/15 bg-background px-3 py-2 text-sm"
          value={searchParams.get("priority") ?? ""}
          onChange={(e) => apply({ priority: e.target.value || null, page: "1" })}
        >
          <option value="">Любой приоритет</option>
          <option value="urgent">Срочный</option>
          <option value="high">Высокий</option>
          <option value="normal">Обычный</option>
          <option value="low">Низкий</option>
        </select>
      </div>

      <LeadsTable leads={initial.leads} />

      {initial.totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={initial.page <= 1}
            onClick={() => apply({ page: String(initial.page - 1) })}
          >
            Назад
          </Button>
          <span className="text-sm text-muted">
            {initial.page} / {initial.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={initial.page >= initial.totalPages}
            onClick={() => apply({ page: String(initial.page + 1) })}
          >
            Далее
          </Button>
        </div>
      ) : null}
    </div>
  );
}
