"use client";

import Link from "next/link";
import type { ExternalPublication } from "@/types/content-distribution";
import { PublicationStatusBadge } from "./PublicationStatusBadge";
import { getExternalPlatform } from "@/data/external-content-platforms";

export function PublicationTable({ items }: { items: ExternalPublication[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border p-6 text-center text-sm text-muted">
        Публикаций пока нет. Создайте draft из опубликованного материала с teaser.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted-bg text-left text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3">Материал</th>
            <th className="px-4 py-3">Площадка</th>
            <th className="px-4 py-3">Статус</th>
            <th className="px-4 py-3">Дата</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t hover:bg-muted-bg/40">
              <td className="px-4 py-3">
                <Link
                  href={`/dashboard/content/distribution/publications/${item.id}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {item.payload.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-xs">
                {getExternalPlatform(item.platformId)?.title ?? item.platformId}
              </td>
              <td className="px-4 py-3">
                <PublicationStatusBadge status={item.status} />
              </td>
              <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                {new Date(item.createdAt).toLocaleString("ru-RU")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
