import type { Metadata } from "next";
import { editorialAuthors } from "@/data/editorial-authors";
import { technicalAuthors } from "@/data/technical-authors";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CRM — Авторы",
  robots: { index: false, follow: false },
};

export default function ContentAuthorsPage() {
  const all = [
    ...editorialAuthors.map((a) => ({ ...a, source: "editorial" as const })),
    ...technicalAuthors.map((a) => ({ ...a, source: "technical" as const })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content" className="text-sm text-muted underline-offset-4 hover:underline">
          ← Контент CMS
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Авторы</h1>
        <p className="mt-2 text-sm text-muted">
          Реальные эксперты и редакционные персонажи. Вымышленные авторы требуют disclaimer.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-graphite/10 text-xs text-muted">
              <th className="py-2 pr-3">Имя</th>
              <th className="py-2 pr-3">Тип</th>
              <th className="py-2 pr-3">Вымышленный</th>
              <th className="py-2 pr-3">Label</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {all.map((author) => (
              <tr key={`${author.source}-${author.id}`} className="border-b border-graphite/5">
                <td className="py-2 pr-3 font-medium">{author.name}</td>
                <td className="py-2 pr-3 text-xs">{author.type}</td>
                <td className="py-2 pr-3 text-xs">
                  {"isFictional" in author && author.isFictional ? "да" : "нет"}
                </td>
                <td className="py-2 pr-3 text-xs text-muted">{author.publicLabel}</td>
                <td className="py-2 text-xs">
                  {"status" in author ? author.status : author.source}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
