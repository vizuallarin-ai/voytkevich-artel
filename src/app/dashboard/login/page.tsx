import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardLoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "CRM — вход",
  robots: { index: false, follow: false },
};

export default function DashboardLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted-bg">
          <p className="text-muted">Загрузка…</p>
        </div>
      }
    >
      <DashboardLoginForm />
    </Suspense>
  );
}
