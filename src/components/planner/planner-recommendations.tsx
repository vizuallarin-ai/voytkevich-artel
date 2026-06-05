import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { PlannerRecommendation } from "@/lib/planner-area";

export function PlannerRecommendations({
  items,
}: {
  items: PlannerRecommendation[];
}) {
  if (!items.length) return null;

  return (
    <section aria-labelledby="planner-rec-title">
      <h2 id="planner-rec-title" className="font-display text-xl">
        Рекомендации по вашей планировке
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-sm border border-graphite/10 bg-sand/30 p-4 text-sm text-muted"
          >
            {item.text}
          </li>
        ))}
      </ul>
      <Button asChild className="mt-6" size="lg">
        <Link href="#planner-lead">Отправить планировку специалисту</Link>
      </Button>
    </section>
  );
}
