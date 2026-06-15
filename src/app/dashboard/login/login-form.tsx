"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_DASHBOARD_USERNAME } from "@/lib/dashboard/auth";

export function DashboardLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState(DEFAULT_DASHBOARD_USERNAME);
  const [password, setPassword] = useState("");
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
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setError("Неверный логин или пароль");
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
        <p className="mt-2 text-sm text-muted">Внутренний кабинет заявок. Доступ только для команды.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="dashboard-username" className="text-sm font-medium text-foreground">
              Логин
            </label>
            <Input
              id="dashboard-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="dashboard-password" className="text-sm font-medium text-foreground">
              Пароль
            </label>
            <Input
              id="dashboard-password"
              type="password"
              autoComplete="current-password"
              placeholder="Пароль из настроек сервера"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Входим…" : "Войти"}
          </Button>
        </form>
      </div>
    </div>
  );
}
