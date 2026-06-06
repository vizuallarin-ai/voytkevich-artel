import { allBuiltObjects } from "@/data/built-objects";
import { getBuiltObjectsForProject, getBuiltObjectsForService } from "@/lib/built-objects";
import { BuiltObjectCard } from "./built-object-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function RelatedBuiltObjectsSection({
  objects,
  title = "Построенные объекты",
  id = "related-built-objects",
}: {
  objects: ReturnType<typeof getBuiltObjectsForProject>;
  title?: string;
  id?: string;
}) {
  if (!objects.length) return null;
  return (
    <section aria-labelledby={id} className="mt-16">
      <h2 id={id} className="heading-section text-2xl">
        {title}
      </h2>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {objects.map((item) => (
          <BuiltObjectCard key={item.slug} item={item} />
        ))}
      </div>
      <Button asChild variant="outline" className="mt-8">
        <Link href="/objects-map">Карта объектов</Link>
      </Button>
    </section>
  );
}

export function ProjectRelatedBuiltObjects({ projectSlug }: { projectSlug: string }) {
  const objects = getBuiltObjectsForProject(allBuiltObjects, projectSlug);
  if (!objects.length) return null;
  return (
    <RelatedBuiltObjectsSection
      objects={objects}
      title="Где строили похожие дома"
      id="project-built-objects"
    />
  );
}

export function ServiceRelatedBuiltObjects({ serviceSlug }: { serviceSlug: string }) {
  const objects = getBuiltObjectsForService(allBuiltObjects, serviceSlug);
  if (!objects.length) return null;
  return (
    <RelatedBuiltObjectsSection
      objects={objects}
      title="Объекты по этой услуге"
      id="service-built-objects"
    />
  );
}
