import Link from "next/link";
import { LayoutGrid, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PlannerPromo({ variant = "default" }: { variant?: "default" | "compact" }) {
  if (variant === "compact") {
    return (
      <p className="text-sm text-muted">
        Уже знаете площадь и число комнат?{" "}
        <Link href="/planirovka" className="font-medium text-wood underline-offset-4 hover:underline">
          Собрать схему планировки
        </Link>{" "}
        (необязательно, ~1 мин).
      </p>
    );
  }

  return (
    <aside className="rounded-sm border border-graphite/10 bg-muted-bg/60 p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <LayoutGrid className="h-8 w-8 shrink-0 text-wood" aria-hidden />
          <div>
            <p className="font-display text-lg">Схема планировки за 1 минуту</p>
            <p className="mt-1 text-sm text-muted">
              Опциональный шаг после калькулятора: подвинуть комнаты, увидеть похожий проект из
              каталога. Не заменяет проект у архитектора.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/planirovka">
            Открыть подборщик
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </aside>
  );
}
