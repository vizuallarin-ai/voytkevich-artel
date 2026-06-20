import { createHash } from "crypto";
import type { ContentExperiment } from "@/types/content-experiment";
import { experimentStore } from "@/lib/content-experiments/experiment-store";

export type AssignmentContext = {
  sessionId: string;
  isCrawler?: boolean;
  hasConsent?: boolean;
};

export type ExperimentAssignment = {
  experimentId: string;
  variantId: string;
  method: "stable-hash" | "time-based" | "control-only";
  seoSafe: boolean;
};

export function assignExperimentVariant(
  experiment: ContentExperiment,
  context: AssignmentContext,
): ExperimentAssignment {
  if (context.isCrawler) {
    return {
      experimentId: experiment.id,
      variantId: experiment.baselineVersionId,
      method: "control-only",
      seoSafe: true,
    };
  }

  if (!context.hasConsent) {
    return {
      experimentId: experiment.id,
      variantId: experiment.baselineVersionId,
      method: "control-only",
      seoSafe: true,
    };
  }

  const isSeoExperiment = ["title", "description", "content-structure", "faq"].includes(experiment.type);
  if (isSeoExperiment) {
    return assignTimeBased(experiment);
  }

  return assignStableHash(experiment, context.sessionId);
}

function assignStableHash(experiment: ContentExperiment, sessionId: string): ExperimentAssignment {
  const existing = experimentStore.getAssignment(sessionId);
  if (existing && existing.experimentId === experiment.id) {
    return {
      experimentId: experiment.id,
      variantId: existing.variantId,
      method: "stable-hash",
      seoSafe: true,
    };
  }

  const hash = createHash("sha256")
    .update(`${sessionId}:${experiment.id}`)
    .digest("hex");
  const bucket = parseInt(hash.slice(0, 8), 16) % 100;
  const controlWeight = experiment.audienceAllocation?.control ?? 50;
  const variantId =
    bucket < controlWeight
      ? experiment.baselineVersionId
      : experiment.variantVersionIds[0] ?? experiment.baselineVersionId;

  experimentStore.setAssignment(sessionId, experiment.id, variantId);

  return {
    experimentId: experiment.id,
    variantId,
    method: "stable-hash",
    seoSafe: true,
  };
}

function assignTimeBased(experiment: ContentExperiment): ExperimentAssignment {
  const start = experiment.period.actualStart ?? experiment.period.plannedStart;
  const variantActive = start && new Date(start) <= new Date();

  return {
    experimentId: experiment.id,
    variantId: variantActive
      ? experiment.variantVersionIds[0] ?? experiment.baselineVersionId
      : experiment.baselineVersionId,
    method: "time-based",
    seoSafe: true,
  };
}

export function getStableAssignment(sessionId: string, experimentId: string): string | null {
  const assignment = experimentStore.getAssignment(sessionId);
  if (assignment?.experimentId === experimentId) return assignment.variantId;
  return null;
}

export const experimentAssignmentService = {
  assignExperimentVariant,
  getStableAssignment,
};
