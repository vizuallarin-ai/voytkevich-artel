"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isDashboardAuthConfigured } from "@/lib/dashboard/auth";

export function DashboardLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        setError("Неверный токен доступа");
        return;
      }
      router.push(searchParams.get("next") ?? "/dashboard");
      router.refresh();
    } catch {
      setError("Не удалось войти. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted-bg px-5">
      <div className="w-full max-w-md rounded-sm border border-graphite/10 bg-background p-8">
        <h1 className="font-display text-2xl">Вход в CRM</h1>
        <p className="mt-2 text-sm text-muted">
          Внутренний кабинет заявок. Доступ только для команды.
        </p>
        {!isDashboardAuthConfigured() ? (
          <p className="mt-4 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            В development auth может быть отключён. Для production задайте DASHBOARD_ACCESS_TOKEN в env.
          </p>
        ) : null}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Input
            type="password"
            placeholder="Токен доступа"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required={isDashboardAuthConfigured()}
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Входим…" : "Войти"}
          </Button>
        </form>
      </div>
    </div>
  );
}
