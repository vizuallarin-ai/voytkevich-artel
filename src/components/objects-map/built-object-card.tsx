import Link from "next/link";
import Image from "next/image";
import type { BuiltObject } from "@/types/built-object";
import { Button } from "@/components/ui/button";
import {
  buildCatalogLinkForObject,
  builtObjectTypeLabel,
  getPublicCoverImage,
  trackObjectsMapEvent,
} from "@/lib/built-objects";

export function BuiltObjectCard({ item }: { item: BuiltObject }) {
  const cover = getPublicCoverImage(item);
  const showCaseLink = item.caseSlug && item.allowedPublicFields.caseLink;

  const handleCaseClick = () => {
    trackObjectsMapEvent("objects_map_case_clicked", {
      objectSlug: item.slug,
      caseSlug: item.caseSlug,
      material: item.house.material,
      floors: item.house.floors,
    });
  };

  const handleProjectClick = () => {
    trackObjectsMapEvent("objects_map_project_clicked", {
      objectSlug: item.slug,
      material: item.house.material,
    });
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-sm border border-graphite/10">
      <div className="relative aspect-[16/10] bg-sand/40">
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-xs text-muted">
            Фото объекта будет добавлено после согласования с заказчиком
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-wood/10 px-2 py-0.5 text-xs text-wood">
            {builtObjectTypeLabel(item.objectType)}
          </span>
          {item.house.material ? (
            <span className="rounded-full bg-sand px-2 py-0.5 text-xs text-muted">
              {item.house.material}
            </span>
          ) : null}
          {item.timeline?.year ? (
            <span className="rounded-full bg-sand px-2 py-0.5 text-xs text-muted">
              {item.timeline.year}
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 font-display text-lg">{item.title}</h3>
        <p className="mt-1 text-sm text-muted">{item.location.locationLabel}</p>
        <p className="mt-2 text-sm text-muted">
          {[item.house.area ? `${item.house.area} м²` : null, item.house.floors ? `${item.house.floors} эт.` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <p className="mt-3 flex-1 text-sm text-muted line-clamp-3">{item.summary}</p>
        {(item.tags ?? item.house.features)?.length ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {(item.tags ?? item.house.features ?? []).slice(0, 4).map((tag) => (
              <li key={tag} className="rounded-full bg-sand px-2 py-0.5 text-xs text-muted">
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-5 flex flex-col gap-2">
          {showCaseLink ? (
            <Button asChild variant="outline" size="sm" onClick={handleCaseClick}>
              <Link href={`/cases/${item.caseSlug}`}>Смотреть кейс</Link>
            </Button>
          ) : null}
          {item.project?.projectSlug ? (
            <Button asChild variant="ghost" size="sm" className="justify-start px-0" onClick={handleProjectClick}>
              <Link href={`/catalog/${item.project.projectSlug}`}>
                Проект: {item.project.projectTitle ?? item.project.projectSlug}
              </Link>
            </Button>
          ) : null}
          <Button asChild size="sm">
            <Link
              href={`#objects-map-lead`}
              onClick={() =>
                trackObjectsMapEvent("objects_map_object_clicked", {
                  objectSlug: item.slug,
                  material: item.house.material,
                  floors: item.house.floors,
                })
              }
            >
              {item.leadCTA?.label ?? "Хочу похожий дом"}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={buildCatalogLinkForObject(item)}>Смотреть похожие проекты</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
