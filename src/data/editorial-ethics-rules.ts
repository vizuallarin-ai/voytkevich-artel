import type { EditorialContentItem, EditorialContentQueueItem } from "@/types/editorial-content";

const FAKE_CLAIM_PATTERNS = [
  /клиент сказал/i,
  /мы построили/i,
  /наш клиент/i,
  /реальный отзыв/i,
  /построили для/i,
];

export function requiresFictionNotice(
  item: Pick<EditorialContentItem, "storyMeta" | "type"> | EditorialContentQueueItem,
): boolean {
  if ("storyMeta" in item && item.storyMeta) {
    return item.storyMeta.fictionNoticeRequired || item.storyMeta.isFictionalized || item.storyMeta.isCompositeScenario;
  }
  const composite = "isCompositeScenario" in item && item.isCompositeScenario;
  const fictionalTypes: EditorialContentItem["type"][] = [
    "fictionalized-story",
    "scenario-story",
    "author-column",
    "local-story",
  ];
  return composite || fictionalTypes.includes(item.type);
}

export function requiresFactCheck(
  item: Pick<EditorialContentItem, "type" | "storyMeta" | "rubricId">,
): boolean {
  if (item.type === "news" || item.type === "news-analysis") return true;
  if (item.rubricId === "regulation-notes") return true;
  if (item.storyMeta?.sourceRequired) return true;
  return false;
}

export function canBePublishedAsRealStory(item: EditorialContentItem): boolean {
  return (
    item.storyMeta.isBasedOnRealClient &&
    item.storyMeta.hasClientPermission &&
    !item.storyMeta.isFictionalized &&
    !item.storyMeta.isCompositeScenario
  );
}

export function validateNoFakeClientClaims(content: EditorialContentItem["content"]): string[] {
  const text = JSON.stringify(content);
  const errors: string[] = [];
  for (const pattern of FAKE_CLAIM_PATTERNS) {
    if (pattern.test(text)) {
      errors.push(`Обнаружена формулировка, похожая на реальный кейс: ${pattern.source}`);
    }
  }
  return errors;
}

export const editorialEthicsRules = [
  "Вымышленная история — показывать EditorialFictionNotice",
  "Собирательный сценарий — маркировать явно",
  "Реальный клиент — только с hasClientPermission",
  "Без разрешения — не публиковать как реальную историю",
  "Без реального объекта — не писать «мы построили»",
  "Без реального отзыва — не писать «клиент сказал»",
  "Вымышленный автор — не выдавать за реального эксперта",
  "Новости — требуют source или source note",
  "Нормативные темы — требуют fact-check",
  "Сомнительная фактура — noindex/review",
];
