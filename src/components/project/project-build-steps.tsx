import Link from "next/link";
import { projectBuildSteps } from "@/lib/project-content";
import { Button } from "@/components/ui/button";

export function ProjectBuildSteps() {
  return (
    <section aria-labelledby="project-steps-title">
      <h2 id="project-steps-title" className="font-display text-2xl">
        Как проходит строительство по этому проекту
      </h2>
      <ol className="mt-6 space-y-4">
        {projectBuildSteps.map((step, i) => (
          <li
            key={step.title}
            className="flex gap-4 border-b border-graphite/10 pb-4 last:border-0"
          >
            <span className="font-display text-2xl text-sand">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="font-medium">{step.title}</h3>
              <p className="mt-1 text-sm text-muted">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
      <Button asChild className="mt-8" variant="outline">
        <Link href="/process">Посмотреть весь процесс строительства</Link>
      </Button>
    </section>
  );
}
