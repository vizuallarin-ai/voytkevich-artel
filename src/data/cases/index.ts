import type { CaseItem } from "@/types/case";
import { caseDrafts } from "./drafts";

/** Опубликованные кейсы — добавлять только подтверждённые объекты */
export const publishedCases: CaseItem[] = [];

export const allCases: CaseItem[] = [...publishedCases, ...caseDrafts];

export function getCaseBySlug(slug: string): CaseItem | undefined {
  return allCases.find((c) => c.slug === slug);
}
