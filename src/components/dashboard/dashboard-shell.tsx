import Link from "next/link";
import { Suspense } from "react";
import { cookies } from "next/headers";
import {
  DASHBOARD_COOKIE,
  getDashboardAuthWarning,
  isDashboardAuthConfigured,
  verifyDashboardToken,
} from "@/lib/dashboard/auth";
import { DASHBOARD_ROLE_LABELS } from "@/lib/dashboard/roles";
import { getStorageStatus } from "@/lib/leads/lead-service";
import { DashboardNav } from "./dashboard-nav";
import { brand } from "@/data/brand";

export async function DashboardShell({ children }: { children: React.ReactNode }) {
  const authWarning = getDashboardAuthWarning();
  const storage = getStorageStatus();
  const token = (await cookies()).get(DASHBOARD_COOKIE)?.value;
  const role = (await verifyDashboardToken(token)) ?? "admin";

  return (
    <div className="min-h-screen bg-muted-bg lg:flex">
      <aside className="flex w-full shrink-0 flex-col border-b border-graphite/10 bg-background lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:border-b-0 lg:border-r">
        <div className="border-b border-graphite/10 px-5 py-5">
          <p className="label-caps text-[10px] text-muted">Внутренний кабинет</p>
          <p className="mt-1 font-display text-lg leading-tight">{brand.nameShort}</p>
          <p className="mt-0.5 text-xs text-muted">
            CRM · {DASHBOARD_ROLE_LABELS[role]}
          </p>
        </div>

        <Suspense fallback={<div className="px-3 py-4 text-sm text-muted lg:flex-1 lg:overflow-y-auto lg:py-4">Загрузка…</div>}>
          <DashboardNav role={role} />
        </Suspense>

        <div className="border-t border-graphite/10 p-4 lg:mt-auto">
          <Link
            href="/"
            className="flex items-center justify-center rounded-sm border border-graphite/15 px-3 py-2 text-sm text-muted transition hover:border-graphite/30 hover:text-foreground"
          >
            ← На сайт
          </Link>
          {!isDashboardAuthConfigured() && process.env.NODE_ENV === "development" && (
            <p className="mt-3 text-xs text-muted">Dev: auth выключен</p>
          )}
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:pl-64">
        {(authWarning || (!storage.fileStore && !storage.supabase) || storage.demoMode) && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-950">
            {authWarning && <p>{authWarning}</p>}
            {!storage.fileStore && !storage.supabase && (
              <p className={authWarning ? "mt-1" : undefined}>
                Хранилище лидов не настроено. На VPS: volume `.data/` или `LEADS_STORAGE=supabase`.
              </p>
            )}
            {storage.backend === "file" && !authWarning && (
              <p className="text-muted-foreground">Хранилище: file store (`.data/leads.json`)</p>
            )}
            {storage.demoMode && (
              <p className="mt-1 font-medium">Demo-данные — только для разработки.</p>
            )}
          </div>
        )}

        <main className="min-w-0 px-6 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
