import Link from "next/link";
import { FloorPlanInteractive } from "@/components/project/floor-plan-interactive";
import { suggestedRooms } from "@/lib/project-content";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";

export function ProjectFloorPlanSection({ project }: { project: Project }) {
  const hasPlans = project.floorPlans.length > 0 && project.floorPlans.some((p) => p.image);
  const rooms = suggestedRooms(project);

  return (
    <section aria-labelledby="project-floorplan-title">
      <h2 id="project-floorplan-title" className="font-display text-2xl">
        Планировка проекта
      </h2>
      <p className="mt-2 text-sm text-muted">
        Планировку можно адаптировать до начала строительства.
      </p>

      {hasPlans ? (
        <div className="mt-6">
          <FloorPlanInteractive plans={project.floorPlans} />
        </div>
      ) : (
        <div className="mt-6 rounded-sm border border-dashed border-graphite/20 bg-muted-bg/40 p-6 md:p-8">
          <p className="text-muted">
            Планировка будет добавлена в карточку проекта. Пока можно оставить заявку —
            специалист уточнит состав помещений и предложит подходящий вариант.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="#project-lead">Обсудить планировку</Link>
          </Button>
        </div>
      )}

      <div className="mt-6">
        <p className="text-sm font-medium">В проекте можно предусмотреть:</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {rooms.map((r) => (
            <li key={r} className="rounded-full bg-sand px-3 py-1 text-xs capitalize">
              {r}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
