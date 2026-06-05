import Link from "next/link";
import { adaptationOptions } from "@/lib/project-content";
import { Button } from "@/components/ui/button";

export function ProjectAdaptation() {
  return (
    <section aria-labelledby="project-adaptation-title">
      <h2 id="project-adaptation-title" className="font-display text-2xl">
        Что можно адаптировать в проекте
      </h2>
      <p className="mt-4 max-w-3xl text-muted">
        Готовый проект — это точка старта, а не жёсткий шаблон. Перед строительством его можно
        адаптировать под участок, стороны света, состав семьи, бюджет и будущий сценарий жизни.
      </p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {adaptationOptions.map((opt) => (
          <li key={opt} className="rounded-full border border-graphite/15 px-3 py-1.5 text-sm">
            {opt}
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="#project-lead">Адаптировать проект под мой участок</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/planirovka">Открыть планировщик</Link>
        </Button>
      </div>
    </section>
  );
}
