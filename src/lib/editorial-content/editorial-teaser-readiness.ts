import type { EditorialContentItem } from "@/types/editorial-content";
import { getEditorialAuthorById } from "@/data/editorial-authors";
import { calculateEditorialContentQualityScore } from "@/lib/editorial-content/editorial-quality-rules";

export type TeaserStyle =
  | "story-hook"
  | "local-hook"
  | "mistake-hook"
  | "question-hook"
  | "cost-hook"
  | "digest-hook"
  | "news-hook"
  | "opinion-hook";

const CLICKBAIT_PATTERNS = [
  /вы не поверите/i,
  /шокирующ/i,
  /секрет.*который скрывают/i,
  /100%/i,
];

export function suggestTeaserStyle(item: EditorialContentItem): TeaserStyle {
  if (item.type === "weekly-digest" || item.type === "monthly-digest") return "digest-hook";
  if (item.type === "news" || item.type === "news-analysis" || item.type === "trend-review")
    return "news-hook";
  if (item.type === "question-roundup") return "question-hook";
  if (item.rubricId === "mistakes-and-lessons") return "mistake-hook";
  if (item.rubricId === "estimate-and-budget-stories") return "cost-hook";
  if (item.type === "local-story" || item.rubricId === "local-building-life") return "local-hook";
  if (item.type === "author-column" || item.type === "opinion") return "opinion-hook";

  const author = getEditorialAuthorById(item.authorId);
  if (author?.teaserStyle?.hookStyle) {
    const style = author.teaserStyle.hookStyle as TeaserStyle;
    if (style) return style;
  }

  return "story-hook";
}

export function validateNoDeceptiveClickbait(item: EditorialContentItem): string[] {
  const errors: string[] = [];
  const text = `${item.title} ${item.content.hook}`;
  for (const pattern of CLICKBAIT_PATTERNS) {
    if (pattern.test(text)) {
      errors.push(`Возможный кликбейт: ${pattern.source}`);
    }
  }
  if (item.title.length > 80) {
    errors.push("Слишком длинный заголовок для teaser");
  }
  return errors;
}

export function isEditorialContentTeaserReady(item: EditorialContentItem): boolean {
  const quality = calculateEditorialContentQualityScore(item);
  if (!quality.canPublish || quality.shouldNoindex) return false;
  if (!item.indexing.indexable) return false;
  if (validateNoDeceptiveClickbait(item).length > 0) return false;
  if (!item.content.hook || item.content.hook.length < 40) return false;
  return item.status === "published" || item.status === "approved";
}

export function buildEditorialTeaserBrief(item: EditorialContentItem) {
  const style = suggestTeaserStyle(item);
  const clickbaitIssues = validateNoDeceptiveClickbait(item);
  const ready = isEditorialContentTeaserReady(item);

  return {
    contentSlug: item.slug,
    teaserStyle: style,
    hook: item.content.hook,
    title: item.title,
    canonicalUrl: item.distribution.canonicalFullArticleUrl,
    utmCampaignId: item.distribution.utmCampaignId,
    platforms: item.distribution.platforms,
    ready,
    blockers: clickbaitIssues,
    authorId: item.authorId,
    isFictionalized: item.storyMeta.isFictionalized,
  };
}
