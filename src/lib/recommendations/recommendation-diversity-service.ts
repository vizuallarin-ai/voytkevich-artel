import type { RecommendationItem } from "@/types/recommendation";

export function calculateRecommendationDiversity(items: RecommendationItem[]): number {
  if (items.length <= 1) return 1;
  const types = new Set(items.map((i) => i.type));
  const clusters = new Set(items.flatMap((i) => i.clusterIds));
  const typeDiversity = types.size / items.length;
  const clusterDiversity = clusters.size / Math.max(items.length, 1);
  return (typeDiversity + clusterDiversity) / 2;
}

export function diversifyByContentType(items: RecommendationItem[]): RecommendationItem[] {
  const result: RecommendationItem[] = [];
  const seenTypes = new Set<string>();

  for (const item of items) {
    if (!seenTypes.has(item.type) || result.length < 2) {
      result.push(item);
      seenTypes.add(item.type);
    }
  }

  for (const item of items) {
    if (!result.find((r) => r.id === item.id)) result.push(item);
  }
  return result;
}

export function diversifyByCluster(items: RecommendationItem[]): RecommendationItem[] {
  const result: RecommendationItem[] = [];
  const seenClusters = new Set<string>();

  for (const item of items) {
    const primaryCluster = item.clusterIds[0] ?? "none";
    if (!seenClusters.has(primaryCluster) || result.length < 2) {
      result.push({ ...item, factors: { ...item.factors, diversityBoost: 0.05 } });
      seenClusters.add(primaryCluster);
    }
  }

  for (const item of items) {
    if (!result.find((r) => r.id === item.id)) result.push(item);
  }
  return result;
}

export function diversifyProjects(items: RecommendationItem[]): RecommendationItem[] {
  const projects = items.filter((i) => i.type === "project");
  const others = items.filter((i) => i.type !== "project");
  const diversified: RecommendationItem[] = [];
  const seenAreas = new Set<string>();

  for (const project of projects) {
    const areaKey = project.description?.match(/\d+/)?.[0] ?? project.id;
    if (!seenAreas.has(areaKey) || diversified.length < 2) {
      diversified.push(project);
      seenAreas.add(areaKey);
    }
  }

  return [...diversified, ...others.filter((o) => !diversified.find((d) => d.id === o.id))];
}

export function limitNearDuplicates(items: RecommendationItem[]): RecommendationItem[] {
  const result: RecommendationItem[] = [];
  const titlePrefixes = new Set<string>();

  for (const item of items) {
    const prefix = item.title.slice(0, 24).toLowerCase();
    if (!titlePrefixes.has(prefix)) {
      result.push(item);
      titlePrefixes.add(prefix);
    }
  }
  return result;
}

export function preserveTopRelevantItem(items: RecommendationItem[]): RecommendationItem[] {
  if (items.length === 0) return items;
  const top = items[0];
  const rest = buildDiverseRecommendationSet(items.slice(1));
  return [top, ...rest.filter((i) => i.id !== top.id)];
}

export function buildDiverseRecommendationSet(items: RecommendationItem[]): RecommendationItem[] {
  let diversified = diversifyByContentType(items);
  diversified = diversifyByCluster(diversified);
  diversified = diversifyProjects(diversified);
  diversified = limitNearDuplicates(diversified);
  return diversified;
}

export const recommendationDiversityService = {
  calculateRecommendationDiversity,
  diversifyByContentType,
  diversifyByCluster,
  diversifyProjects,
  limitNearDuplicates,
  preserveTopRelevantItem,
  buildDiverseRecommendationSet,
};
