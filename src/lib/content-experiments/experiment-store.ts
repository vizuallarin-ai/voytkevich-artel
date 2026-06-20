import { randomUUID } from "crypto";
import type { ContentExperiment } from "@/types/content-experiment";

const experiments = new Map<string, ContentExperiment>();
const assignments = new Map<string, { experimentId: string; variantId: string }>();
const experimentMetrics = new Map<string, Record<string, number | null>>();

export const experimentStore = {
  save(experiment: ContentExperiment): ContentExperiment {
    experiments.set(experiment.id, experiment);
    return experiment;
  },

  get(id: string): ContentExperiment | undefined {
    return experiments.get(id);
  },

  list(): ContentExperiment[] {
    return [...experiments.values()];
  },

  listActive(): ContentExperiment[] {
    return [...experiments.values()].filter((e) => e.status === "running");
  },

  listByContentItem(contentItemId: string): ContentExperiment[] {
    return [...experiments.values()].filter((e) => e.contentItemId === contentItemId);
  },

  setAssignment(sessionKey: string, experimentId: string, variantId: string): void {
    assignments.set(sessionKey, { experimentId, variantId });
  },

  getAssignment(sessionKey: string): { experimentId: string; variantId: string } | undefined {
    return assignments.get(sessionKey);
  },

  recordMetrics(experimentId: string, metrics: Record<string, number | null>): void {
    experimentMetrics.set(experimentId, metrics);
  },

  getMetrics(experimentId: string): Record<string, number | null> | undefined {
    return experimentMetrics.get(experimentId);
  },

  clearAll(): void {
    experiments.clear();
    assignments.clear();
    experimentMetrics.clear();
  },
};

export function createExperimentId(): string {
  return randomUUID();
}
