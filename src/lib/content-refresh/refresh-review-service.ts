import { randomUUID } from "crypto";
import type { ContentVersion } from "@/types/content-version";
import type { ContentUpdateBrief } from "@/types/content-update-brief";
import { refreshStore, type RefreshReview, type RefreshReviewType } from "@/lib/content-refresh/refresh-store";
import { refreshAnalytics } from "@/lib/content-refresh/refresh-analytics";

export function requestRefreshReview(
  versionId: string,
  reviewType: RefreshReviewType,
): RefreshReview {
  const review: RefreshReview = {
    id: randomUUID(),
    versionId,
    reviewType,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  refreshStore.saveReview(review);

  const version = refreshStore.getVersion(versionId);
  refreshAnalytics.trackRefreshReviewRequested({
    versionId,
    contentItemId: version?.contentItemId,
    reviewType,
  });

  return review;
}

export function approveRefreshReview(reviewId: string, actor: string): RefreshReview | null {
  const review = refreshStore.getReview(reviewId);
  if (!review) return null;
  const updated: RefreshReview = {
    ...review,
    status: "approved",
    actorId: actor,
    updatedAt: new Date().toISOString(),
  };
  refreshStore.saveReview(updated);

  const version = refreshStore.getVersion(review.versionId);
  refreshAnalytics.trackRefreshReviewApproved({
    versionId: review.versionId,
    contentItemId: version?.contentItemId,
    reviewType: review.reviewType,
  });

  return updated;
}

export function rejectRefreshReview(
  reviewId: string,
  actor: string,
  reason: string,
): RefreshReview | null {
  const review = refreshStore.getReview(reviewId);
  if (!review) return null;
  const updated: RefreshReview = {
    ...review,
    status: "rejected",
    actorId: actor,
    comments: reason,
    updatedAt: new Date().toISOString(),
  };
  refreshStore.saveReview(updated);

  const version = refreshStore.getVersion(review.versionId);
  refreshAnalytics.trackRefreshReviewRejected({
    versionId: review.versionId,
    contentItemId: version?.contentItemId,
    reviewType: review.reviewType,
    reason,
  });

  return updated;
}

export function requestChanges(reviewId: string, comments: string): RefreshReview | null {
  const review = refreshStore.getReview(reviewId);
  if (!review) return null;
  const updated: RefreshReview = {
    ...review,
    status: "changes-requested",
    comments,
    updatedAt: new Date().toISOString(),
  };
  refreshStore.saveReview(updated);
  return updated;
}

export function getPendingRefreshReviews(actor?: string): RefreshReview[] {
  return refreshStore
    .listReviews()
    .filter((r) => r.status === "pending" && (!actor || !r.actorId || r.actorId === actor));
}

function requiredReviewTypes(version: ContentVersion, brief?: ContentUpdateBrief): RefreshReviewType[] {
  const types: RefreshReviewType[] = ["editorial"];
  if (brief?.requiredReviews.seo) types.push("seo");
  if (brief?.requiredReviews.expert) types.push("expert");
  if (brief?.requiredReviews.legal) types.push("legal");
  types.push("final");
  return types;
}

export function validateRequiredReviews(versionId: string): {
  complete: boolean;
  missing: RefreshReviewType[];
  pending: RefreshReviewType[];
} {
  const version = refreshStore.getVersion(versionId);
  if (!version) return { complete: false, missing: ["editorial"], pending: [] };

  const brief = version.updateBriefId
    ? refreshStore.getBrief(version.updateBriefId)
    : undefined;
  const required = requiredReviewTypes(version, brief);
  const reviews = refreshStore.getReviewsByVersion(versionId);

  const approved = new Set(
    reviews.filter((r) => r.status === "approved").map((r) => r.reviewType),
  );
  const pending = required.filter(
    (t) => !approved.has(t) && reviews.some((r) => r.reviewType === t && r.status === "pending"),
  );
  const missing = required.filter((t) => !approved.has(t));

  return {
    complete: missing.length === 0,
    missing,
    pending,
  };
}

export function canPublishRefreshVersion(versionId: string): {
  allowed: boolean;
  reasons: string[];
  requiresHumanReview: true;
} {
  const version = refreshStore.getVersion(versionId);
  if (!version) return { allowed: false, reasons: ["Version not found"], requiresHumanReview: true };

  const reasons: string[] = [];
  if (version.status !== "approved") reasons.push("Version not approved");

  const reviewCheck = validateRequiredReviews(versionId);
  if (!reviewCheck.complete) {
    reasons.push(`Missing reviews: ${reviewCheck.missing.join(", ")}`);
  }

  return {
    allowed: reasons.length === 0,
    reasons,
    requiresHumanReview: true,
  };
}

export const refreshReviewService = {
  requestRefreshReview,
  approveRefreshReview,
  rejectRefreshReview,
  requestChanges,
  getPendingRefreshReviews,
  validateRequiredReviews,
  canPublishRefreshVersion,
};
