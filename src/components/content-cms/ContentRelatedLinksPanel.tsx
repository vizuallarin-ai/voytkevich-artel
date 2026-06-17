import type { CMSContentItem } from "@/types/content-cms";

export function ContentRelatedLinksPanel({ item }: { item: CMSContentItem }) {
  const sections = [
    { label: "Проекты", items: item.related.projects },
    { label: "Категории", items: item.related.projectCategories },
    { label: "Technical", items: item.related.technicalArticles },
    { label: "Editorial", items: item.related.editorialContent },
    { label: "Programmatic", items: item.related.programmaticPages },
    { label: "Lead magnets", items: item.related.leadMagnets },
  ].filter((s) => s.items?.length);

  if (!sections.length) {
    return <p className="text-sm text-muted">Связанные материалы не заданы.</p>;
  }

  return (
    <ul className="space-y-3 text-sm">
      {sections.map((section) => (
        <li key={section.label}>
          <p className="font-medium">{section.label}</p>
          <ul className="mt-1 space-y-0.5 text-muted">
            {section.items!.map((link) => (
              <li key={link}>{link}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
