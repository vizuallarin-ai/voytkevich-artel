"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { X, Check, Minus } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types";

type Row = {
  label: string;
  get: (p: Project) => string | number | boolean;
  format?: (v: string | number | boolean) => string;
  highlight?: boolean;
};

const rows: Row[] = [
  { label: "Площадь", get: (p) => p.specs.area, format: (v) => `${v} м²`, highlight: true },
  { label: "Цена", get: (p) => p.price, format: (v) => formatPrice(v as number), highlight: true },
  { label: "Цена за м²", get: (p) => p.pricePerSqm, format: (v) => `${formatPrice(v as number)}/м²` },
  { label: "Этажей", get: (p) => p.specs.floors },
  { label: "Спален", get: (p) => p.specs.bedrooms },
  { label: "Санузлов", get: (p) => p.specs.bathrooms },
  { label: "Срок стройки", get: (p) => p.specs.buildTimeMonths, format: (v) => `${v} мес.` },
  { label: "Материал", get: (p) => p.specs.material },
  { label: "Стиль", get: (p) => p.specs.style },
  { label: "Терраса", get: (p) => p.specs.hasTerrace },
  { label: "Гараж", get: (p) => p.specs.hasGarage },
  { label: "Сауна", get: (p) => p.specs.hasSauna },
];

function CellValue({ value }: { value: string | number | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="mx-auto h-4 w-4 text-green-600" />
    ) : (
      <Minus className="mx-auto h-4 w-4 text-graphite/30" />
    );
  }
  return <span>{String(value)}</span>;
}

export function CompareModal({
  projects,
  open,
  onOpenChange,
  onRemove,
}: {
  projects: Project[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-graphite/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col bg-background focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-graphite/10 px-6 py-4">
            <Dialog.Title className="font-display text-xl">
              Сравнение проектов
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-sand"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Scrollable table */}
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[600px] border-collapse">
              {/* Project headers */}
              <thead className="sticky top-0 z-10 bg-background shadow-sm">
                <tr>
                  <th className="w-40 border-b border-graphite/10 px-4 py-4 text-left text-sm font-medium text-muted">
                    Характеристика
                  </th>
                  {projects.map((p) => (
                    <th
                      key={p.id}
                      className="border-b border-graphite/10 px-4 py-4 text-left"
                    >
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => onRemove(p.id)}
                          className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-sand transition hover:bg-graphite hover:text-background"
                          aria-label="Убрать из сравнения"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="relative aspect-[4/3] w-28 overflow-hidden rounded-sm">
                          <Image
                            src={p.images[0]}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="112px"
                          />
                        </div>
                        <p className="mt-2 font-display text-base leading-tight">{p.name}</p>
                        <p className="text-sm text-muted">{p.tagline}</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((row, i) => {
                  const values = projects.map((p) => row.get(p));
                  const allSame = values.every((v) => v === values[0]);

                  return (
                    <tr
                      key={row.label}
                      className={cn(
                        i % 2 === 0 ? "bg-background" : "bg-muted-bg",
                        row.highlight && "font-medium",
                      )}
                    >
                      <td className="border-r border-graphite/8 px-4 py-3 text-sm text-muted">
                        {row.label}
                      </td>
                      {projects.map((p, pi) => {
                        const raw = row.get(p);
                        const displayed = row.format ? row.format(raw) : raw;
                        return (
                          <td
                            key={p.id}
                            className={cn(
                              "px-4 py-3 text-sm",
                              !allSame && typeof raw === "number" && row.highlight &&
                                raw === Math.min(...(values as number[])) && "text-green-700",
                            )}
                          >
                            {row.format ? (
                              <span>{String(displayed)}</span>
                            ) : (
                              <CellValue value={raw} />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer CTA */}
          <div className="shrink-0 border-t border-graphite/10 px-6 py-4">
            <div className="flex flex-wrap gap-3">
              {projects.map((p) => (
                <Button key={p.id} asChild variant="outline" size="sm">
                  <Link href={`/catalog/${p.slug}`}>Смотреть «{p.name}»</Link>
                </Button>
              ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
