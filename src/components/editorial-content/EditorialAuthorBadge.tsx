import type { EditorialAuthor } from "@/types/editorial-content";

export function EditorialAuthorBadge({ author }: { author: EditorialAuthor }) {
  return (
    <div className="mt-6 rounded-sm border border-graphite/10 bg-background px-4 py-3">
      <p className="font-display text-sm">{author.name}</p>
      <p className="mt-1 text-xs text-muted">{author.role}</p>
      {author.isFictional ? (
        <p className="mt-2 text-xs text-amber-900">{author.publicLabel}</p>
      ) : null}
      {author.disclaimer ? (
        <p className="mt-2 text-xs leading-relaxed text-muted">{author.disclaimer}</p>
      ) : null}
    </div>
  );
}
