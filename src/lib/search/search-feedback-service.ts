import type { SearchFeedbackRecord } from "@/lib/search/search-store";
import { searchStore } from "@/lib/search/search-store";

export type SubmitSearchFeedbackInput = {
  queryId?: string;
  documentId?: string;
  chunkId?: string;
  feedbackType: SearchFeedbackRecord["feedbackType"];
  message?: string;
};

export function submitSearchFeedback(input: SubmitSearchFeedbackInput): SearchFeedbackRecord {
  return searchStore.saveFeedback({
    ...input,
    status: "queued",
  });
}

export function getFeedbackReviewQueue(limit = 100): SearchFeedbackRecord[] {
  return searchStore.listFeedback("queued").slice(0, limit);
}

export function markSearchFeedbackReviewed(
  feedbackId: string,
  status: "reviewed" | "dismissed" = "reviewed",
): SearchFeedbackRecord | null {
  return searchStore.updateFeedbackStatus(feedbackId, status);
}

export const searchFeedbackService = {
  submitSearchFeedback,
  getFeedbackReviewQueue,
  markSearchFeedbackReviewed,
};
