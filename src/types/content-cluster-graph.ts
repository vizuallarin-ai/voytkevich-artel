export type PillarClusterRole =
  | "pillar"
  | "hub"
  | "cluster"
  | "supporting"
  | "commercial-destination"
  | "unassigned";

export type ContentClusterGraph = {
  id: string;
  clusterId: string;
  title: string;

  pillarNodeId?: string;
  hubNodeIds: string[];
  memberNodeIds: string[];
  commercialDestinationNodeIds: string[];

  coverage: {
    expectedTopics: string[];
    coveredTopics: string[];
    missingTopics: string[];
    duplicateTopics: string[];
  };

  health: {
    score: number;
    orphanCount: number;
    brokenLinkCount: number;
    cannibalizationCount: number;
    averageDepth: number | null;
  };

  updatedAt: string;
};
