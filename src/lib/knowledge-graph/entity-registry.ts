import type { KnowledgeNodeType } from "@/types/knowledge-graph";
import { seoClusters } from "@/data/seo-clusters";
import { projectMaterials } from "@/data/project-materials";
import { localDemandRules } from "@/data/local-demand-rules";
import { allServicePages } from "@/data/service-pages/index";
import { technicalContentClusters } from "@/data/technical-content-clusters";
import { normalizeEntityName, normalizeEntitySlug } from "@/lib/knowledge-graph/entity-normalization-service";

export type RegistryEntitySource =
  | "seo-clusters"
  | "materials"
  | "locations"
  | "services"
  | "technologies"
  | "construction-stages"
  | "cms";

export type RegistryEntity = {
  id: string;
  canonicalName: string;
  aliases: string[];
  slug: string;
  entityType: KnowledgeNodeType;
  parentId?: string;
  childIds: string[];
  relatedEntityIds: string[];
  source: RegistryEntitySource;
  status: "active" | "deprecated";
  usageCount: number;
};

const entities = new Map<string, RegistryEntity>();
const aliasIndex = new Map<string, string>();

function register(entity: RegistryEntity): void {
  entities.set(entity.id, entity);
  aliasIndex.set(normalizeEntityName(entity.canonicalName), entity.id);
  for (const alias of entity.aliases) {
    aliasIndex.set(normalizeEntityName(alias), entity.id);
  }
}

function seedConstructionStages(): void {
  const stages: Array<{ id: string; name: string; aliases: string[]; order: number }> = [
    { id: "stage:foundation", name: "Фундамент", aliases: ["фундаментные работы"], order: 1 },
    { id: "stage:shell", name: "Коробка", aliases: ["коробка дома", "несущий каркас"], order: 2 },
    { id: "stage:warm-contour", name: "Тёплый контур", aliases: ["теплый контур", "закрытый контур"], order: 3 },
    { id: "stage:engineering", name: "Инженерные системы", aliases: ["инженерия", "инженерные коммуникации"], order: 4 },
    { id: "stage:finishing", name: "Отделка", aliases: ["чистовая отделка", "внутренняя отделка"], order: 5 },
  ];

  for (let i = 0; i < stages.length; i++) {
    const s = stages[i];
    register({
      id: s.id,
      canonicalName: s.name,
      aliases: s.aliases,
      slug: normalizeEntitySlug(s.name),
      entityType: "construction-stage",
      parentId: i > 0 ? stages[i - 1].id : undefined,
      childIds: i < stages.length - 1 ? [stages[i + 1].id] : [],
      relatedEntityIds: ["service:turnkey"],
      source: "construction-stages",
      status: "active",
      usageCount: 0,
    });
  }
}

function seedFromProjectData(): void {
  if (entities.size > 0) return;

  for (const cluster of seoClusters) {
    register({
      id: `cluster:${cluster.clusterId}`,
      canonicalName: cluster.title,
      aliases: cluster.targetQueries.slice(0, 5),
      slug: cluster.clusterId,
      entityType: "semantic-cluster",
      childIds: [],
      relatedEntityIds: [],
      source: "seo-clusters",
      status: "active",
      usageCount: cluster.supportingPages.length,
    });
  }

  for (const material of projectMaterials) {
    if (material.status !== "active") continue;
    register({
      id: `material:${material.id}`,
      canonicalName: material.title,
      aliases: [...material.seoSynonyms, ...material.userSynonyms],
      slug: material.slug,
      entityType: "material",
      relatedEntityIds: material.applicableObjectTypes.map((t) => `building-type:${t}`),
      childIds: [],
      source: "materials",
      status: "active",
      usageCount: 0,
    });
    register({
      id: `technology:${material.id}`,
      canonicalName: material.title.replace(/^Дома /, "").replace(/^Каркасные дома$/, "Каркасная технология"),
      aliases: material.seoSynonyms,
      slug: `${material.slug}-tech`,
      entityType: "technology",
      parentId: `material:${material.id}`,
      childIds: [],
      relatedEntityIds: [`material:${material.id}`],
      source: "technologies",
      status: "active",
      usageCount: 0,
    });
  }

  for (const rule of localDemandRules) {
    const slug = normalizeEntitySlug(rule.label);
    register({
      id: `location:${slug}`,
      canonicalName: rule.label,
      aliases: [],
      slug,
      entityType: "location",
      relatedEntityIds: rule.tier === "P1" ? ["location:irkutskaya-oblast"] : [],
      childIds: [],
      source: "locations",
      status: "active",
      usageCount: 0,
    });
  }

  for (const service of allServicePages) {
    register({
      id: `service:${service.slug}`,
      canonicalName: service.title,
      aliases: service.targetKeywords?.slice(0, 3) ?? [],
      slug: service.slug,
      entityType: "service",
      childIds: [],
      relatedEntityIds: [],
      source: "services",
      status: "active",
      usageCount: 0,
    });
  }

  register({
    id: "service:turnkey",
    canonicalName: "Дома под ключ",
    aliases: ["строительство домов под ключ", "дом под ключ"],
    slug: "stroitelstvo-domov-pod-klyuch-irkutsk",
    entityType: "service",
    childIds: [],
    relatedEntityIds: ["cluster:turnkey"],
    source: "services",
    status: "active",
    usageCount: 1,
  });

  register({
    id: "service:design",
    canonicalName: "Проектирование домов",
    aliases: ["проектирование", "архитектурный проект"],
    slug: "proektirovanie-domov",
    entityType: "service",
    childIds: [],
    relatedEntityIds: ["cluster:design"],
    source: "services",
    status: "active",
    usageCount: 0,
  });

  for (const topic of technicalContentClusters) {
    register({
      id: `topic:${topic.id}`,
      canonicalName: topic.title,
      aliases: [topic.slug],
      slug: topic.slug,
      entityType: "technical-topic",
      childIds: [],
      relatedEntityIds: topic.relatedProjectCategories.map((c) => `category:${c}`),
      source: "technologies",
      status: "active",
      usageCount: 0,
    });
  }

  seedConstructionStages();
}

function ensureSeeded(): void {
  seedFromProjectData();
}

function getEntity(id: string): RegistryEntity | undefined {
  ensureSeeded();
  return entities.get(id);
}

function listEntities(filter?: { type?: KnowledgeNodeType; source?: RegistryEntitySource }): RegistryEntity[] {
  ensureSeeded();
  let list = [...entities.values()];
  if (filter?.type) list = list.filter((e) => e.entityType === filter.type);
  if (filter?.source) list = list.filter((e) => e.source === filter.source);
  return list;
}

function findByAlias(value: string): RegistryEntity | undefined {
  ensureSeeded();
  const key = normalizeEntityName(value);
  const id = aliasIndex.get(key);
  return id ? entities.get(id) : undefined;
}

function incrementUsage(entityId: string): void {
  const entity = entities.get(entityId);
  if (entity) {
    entity.usageCount += 1;
    entities.set(entityId, entity);
  }
}

export const entityRegistry = {
  getEntity,
  listEntities,
  findByAlias,
  incrementUsage,
  seed: seedFromProjectData,
};

export const entityRegistryService = entityRegistry;
