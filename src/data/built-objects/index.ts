import type { BuiltObject } from "@/types/built-object";
import { builtObjectDrafts } from "./drafts";

/** Опубликованные объекты карты — только подтверждённые с разрешениями */
export const publishedBuiltObjects: BuiltObject[] = [];

export const allBuiltObjects: BuiltObject[] = [...publishedBuiltObjects, ...builtObjectDrafts];

export function getBuiltObjectBySlug(slug: string): BuiltObject | undefined {
  return allBuiltObjects.find((o) => o.slug === slug);
}
