import Link from "next/link";
import { Button } from "@/components/ui/button";
import { plannerHero } from "@/data/planner-copy";
import { cta } from "@/data/copy";

export function PlannerHero() {
  return (
    <header className="max-w-3xl">
      <p className="label-caps">Планировщик</p>
      <h1 className="heading-section mt-2">{plannerHero.h1}</h1>
      <p className="mt-4 text-lg text-muted">{plannerHero.intro}</p>
      <p className="mt-2 text-sm text-muted">{plannerHero.micro}</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {plannerHero.quickFacts.map((fact) => (
          <li
            key={fact}
            className="rounded-full bg-sand/80 px-3 py-1 text-xs text-muted"
          >
            {fact}
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <a href="#planner-wizard">Начать планировку</a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/catalog">{cta.viewProjects}</Link>
        </Button>
      </div>
    </header>
  );
}
