import Link from "next/link";
import Image from "next/image";
import type { CaseItem } from "@/types/case";
import { Button } from "@/components/ui/button";
import { formatCaseLocation } from "@/lib/cases";

export function CaseCard({ item }: { item: CaseItem }) {
  const cover = item.gallery?.find((g) => g.type === "result") ?? item.gallery?.[0];
  const location = formatCaseLocation(item);

  return (
    <article className="flex flex-col overflow-hidden rounded-sm border border-graphite/10 bg-background shadow-sm transition hover:shadow-md">
      <Link href={`/cases/${item.slug}`} className="relative block aspect-[16/10] bg-muted-bg">
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center text-xs text-muted">
            Фото объекта будет добавлено после согласования
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2">
          {item.tags?.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-wood/10 px-2 py-0.5 text-xs text-wood"
            >
              {tag}
            </span>
          ))}
        </div>
        <h2 className="mt-3 font-display text-xl leading-snug">
          <Link href={`/cases/${item.slug}`} className="hover:text-wood hover:underline">
            {item.title}
          </Link>
        </h2>
        <p className="mt-2 flex-1 text-sm text-muted line-clamp-3">{item.excerpt}</p>
        <p className="mt-3 text-xs text-muted">
          {[
            item.house.area ? `${item.house.area} м²` : null,
            item.house.floors ? `${item.house.floors} эт.` : null,
            item.house.material,
            location,
            item.timeline?.year ? `${item.timeline.year}` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link href={`/cases/${item.slug}`}>Смотреть кейс</Link>
          </Button>
          <Button asChild size="sm" className="flex-1">
            <Link href={`/cases/${item.slug}#case-lead`}>Хочу похожий дом</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
