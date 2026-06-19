import type { SemanticCluster } from "@/types/semantic-clusters";
import { seoClusters } from "@/data/seo-clusters";
import { commercialIntentLevel, scoreCommercialIntent } from "@/data/commercial-intent-scoring";
import { scoreToPriorityLevel } from "@/data/priority-scoring-rules";
import { keywordDemandRepository } from "@/lib/content-prioritization/keyword-demand-repository";

const clusters = new Map<string, SemanticCluster>();

function seedFromSeoClusters(): void {
  if (clusters.size > 0) return;
  const now = new Date().toISOString();
  for (const c of seoClusters) {
    const commercialScore = scoreCommercialIntent(c.title + " " + c.targetQueries.join(" "));
    const commercial = commercialIntentLevel(commercialScore);
    const heuristicScore =
      c.priority === "high" ? 82 : c.priority === "medium" ? 58 : 35;
    clusters.set(c.clusterId, {
      id: c.clusterId,
      slug: c.clusterId,
      title: c.title,
      description: c.description,
      clusterType: c.clusterId === "geo" ? "local" : c.pageTypes.includes("article") ? "technical" : "commercial",
      keywords: c.targetQueries,
      primaryIntent: c.searchIntent.includes("commercial") ? "commercial" : "informational",
      relatedContentIds: [],
      demand: {
        totalSearchVolume: null,
        averageDifficulty: null,
        dataCompleteness: "none",
        demandLevel: "unknown",
      },
      businessValue: {
        commercialIntent: commercial,
        leadPotential: commercial === "high" ? "high" : "medium",
        strategicValue: c.priority === "high" ? "high" : "medium",
      },
      risks: {
        cannibalizationRisk: "low",
        thinContentRisk: "medium",
        contentDifficulty: "medium",
      },
      priority: {
        score: heuristicScore,
        level: scoreToPriorityLevel(heuristicScore),
        confidence: "low",
        reason: "Heuristic из seo-clusters — частотность не импортирована",
      },
      createdAt: now,
    });
  }
}

export const semanticClusterRepository = {
  async list(): Promise<SemanticCluster[]> {
    seedFromSeoClusters();
    return [...clusters.values()];
  },

  async getById(id: string): Promise<SemanticCluster | null> {
    seedFromSeoClusters();
    return clusters.get(id) ?? null;
  },

  async recalculate(clusterId: string): Promise<SemanticCluster | null> {
    const cluster = await this.getById(clusterId);
    if (!cluster) return null;

    const kws = await keywordDemandRepository.findByCluster(clusterId);
    const volumes = kws.map((k) => k.metrics.searchVolume).filter((v): v is number => v != null);
    const totalSearchVolume = volumes.length ? volumes.reduce((a, b) => a + b, 0) : null;

    let demandLevel: SemanticCluster["demand"]["demandLevel"] = "unknown";
    if (totalSearchVolume != null) {
      if (totalSearchVolume >= 500) demandLevel = "high";
      else if (totalSearchVolume >= 100) demandLevel = "medium";
      else demandLevel = "low";
    }

    const dataCompleteness: SemanticCluster["demand"]["dataCompleteness"] =
      volumes.length >= 3 ? "good" : volumes.length > 0 ? "partial" : "none";

    cluster.demand = {
      totalSearchVolume,
      averageDifficulty: null,
      dataCompleteness,
      demandLevel,
    };
    cluster.priority.confidence = dataCompleteness === "none" ? "low" : dataCompleteness === "good" ? "high" : "medium";
    cluster.updatedAt = new Date().toISOString();
    clusters.set(clusterId, cluster);
    return cluster;
  },
};

export const semanticClusterService = {
  list: () => semanticClusterRepository.list(),
  getById: (id: string) => semanticClusterRepository.getById(id),
  recalculate: (id: string) => semanticClusterRepository.recalculate(id),
};
