"use client";

import Image from "next/image";
import { X, GitCompare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types";

export function CompareBar({
  projects,
  onRemove,
  onClear,
  onOpen,
}: {
  projects: Project[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onOpen: () => void;
}) {
  if (projects.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "glass border-t border-graphite/15 shadow-2xl",
        "translate-y-0 transition-transform duration-300",
      )}
      role="region"
      aria-label="Сравнение проектов"
    >
      <div className="container-narrow flex flex-wrap items-center gap-4 px-5 py-3 md:px-10 lg:px-16">
        {/* Thumbnails */}
        <div className="flex flex-1 flex-wrap gap-3">
          {projects.map((p) => (
            <div key={p.id} className="relative flex items-center gap-2 rounded-sm border border-graphite/15 bg-background/80 pl-1 pr-3 py-1">
              <div className="relative h-10 w-14 overflow-hidden rounded-sm">
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <span className="max-w-[120px] truncate text-xs font-medium">{p.name}</span>
              <button
                type="button"
                onClick={() => onRemove(p.id)}
                className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-muted transition hover:bg-sand hover:text-foreground"
                aria-label={`Убрать ${p.name} из сравнения`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: 3 - projects.length }).map((_, i) => (
            <div
              key={i}
              className="flex h-12 w-32 items-center justify-center rounded-sm border border-dashed border-graphite/20 text-xs text-muted"
            >
              + добавить
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-muted underline-offset-4 hover:underline"
          >
            Очистить
          </button>
          <Button size="sm" onClick={onOpen} disabled={projects.length < 2}>
            <GitCompare className="mr-2 h-4 w-4" />
            Сравнить {projects.length} {projects.length === 1 ? "проект" : projects.length < 5 ? "проекта" : "проектов"}
          </Button>
        </div>
      </div>
    </div>
  );
}
