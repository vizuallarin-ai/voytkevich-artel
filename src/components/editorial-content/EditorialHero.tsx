import type { EditorialAuthor, EditorialContentItem } from "@/types/editorial-content";
import { getEditorialRubricById } from "@/data/editorial-rubrics";
import { EditorialCTA } from "./EditorialCTA";

export function EditorialHero({
  item,
  author,
}: {
  item: EditorialContentItem;
  author?: EditorialAuthor;
}) {
  const rubric = getEditorialRubricById(item.rubricId);

  return (
    <header className="mt-4">
      <p className="label-caps text-muted">{rubric?.title ?? "Редакция"}</p>
      <h1 className="mt-3 font-display text-3xl leading-tight md:text-4xl">{item.h1}</h1>
      <p className="mt-4 text-muted">{item.seoDescription}</p>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
        {author ? (
          <span>
            {author.name}
            {author.isFictional ? ` · ${author.publicLabel}` : ""}
          </span>
        ) : null}
        {item.readTimeMinutes ? <span>{item.readTimeMinutes} мин чтения</span> : null}
        {item.updatedAt ? <span>Обновлено: {item.updatedAt}</span> : null}
      </div>
      {!item.indexing.indexable ? (
        <p className="mt-4 inline-block rounded-sm bg-amber-50 px-3 py-1 text-xs text-amber-900">
          Материал в подготовке — редакционный черновик, не индексируется
        </p>
      ) : null}
      <div className="mt-6">
        <EditorialCTA item={item} position="hero" />
      </div>
    </header>
  );
}
