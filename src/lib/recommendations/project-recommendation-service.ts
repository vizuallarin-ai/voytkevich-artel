import { randomUUID } from "crypto";
import type { RecommendationContext } from "@/types/recommendation-context";
import type { RecommendationCandidate } from "@/types/recommendation";
import type { Project } from "@/types";
import { projects } from "@/data/projects";
import { findSimilarProjects } from "@/lib/similar-projects";
import { recommendationExplanationService } from "@/lib/recommendations/recommendation-explanation-service";

function projectToCandidate(project: Project, exactMatch: boolean): RecommendationCandidate {
  return {
    id: `project:${project.id}`,
    type: "project",
    contentItemId: undefined,
    targetUrl: `/catalog/${project.slug}`,
    title: project.name,
    description: exactMatch
      ? `${project.specs.area} м², ${project.specs.floors} этаж, ${project.specs.technology}`
      : `Похожий проект: ${project.specs.area} м², ${project.specs.floors} этаж`,
    entityNodeIds: [],
    clusterIds: project.categorySlugs ?? [],
    source: "taxonomy",
    eligibility: {
      published: true,
      indexable: true,
      canonical: true,
      available: true,
    },
    createdAt: new Date().toISOString(),
  };
}

function parseArea(value: string): number | null {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function scoreProject(project: Project, context: RecommendationContext): number {
  let score = 0;
  const prefs = context.preferences;

  for (const area of prefs.areas) {
    const target = parseArea(area);
    if (target && Math.abs(project.specs.area - target) <= 15) score += 3;
    else if (target) score += Math.max(0, 2 - Math.abs(project.specs.area - target) / 30);
  }

  for (const floor of prefs.floors) {
    if (String(project.specs.floors) === floor) score += 2;
  }

  for (const tech of prefs.technologies) {
    if (project.specs.technology.toLowerCase().includes(tech.toLowerCase())) score += 2;
  }

  for (const material of prefs.materials) {
    if (project.specs.material.toLowerCase().includes(material.toLowerCase())) score += 1.5;
  }

  for (const type of prefs.buildingTypes) {
    const hay = `${project.name} ${project.tagline}`.toLowerCase();
    if (hay.includes(type.toLowerCase())) score += 1;
  }

  return score;
}

export function matchProjectsByBuildingType(context: RecommendationContext): RecommendationCandidate[] {
  const types = context.preferences.buildingTypes;
  if (types.length === 0) return [];
  return projects
    .filter((p) => types.some((t) => `${p.name} ${p.tagline}`.toLowerCase().includes(t.toLowerCase())))
    .slice(0, 6)
    .map((p) => projectToCandidate(p, true));
}

export function matchProjectsByTechnology(context: RecommendationContext): RecommendationCandidate[] {
  const techs = context.preferences.technologies;
  if (techs.length === 0) return [];
  return projects
    .filter((p) => techs.some((t) => p.specs.technology.toLowerCase().includes(t.toLowerCase())))
    .slice(0, 6)
    .map((p) => projectToCandidate(p, true));
}

export function matchProjectsByMaterial(context: RecommendationContext): RecommendationCandidate[] {
  const materials = context.preferences.materials;
  if (materials.length === 0) return [];
  return projects
    .filter((p) => materials.some((m) => p.specs.material.toLowerCase().includes(m.toLowerCase())))
    .slice(0, 6)
    .map((p) => projectToCandidate(p, true));
}

export function matchProjectsBySize(context: RecommendationContext): RecommendationCandidate[] {
  return matchProjectsByArea(context);
}

export function matchProjectsByArea(context: RecommendationContext): RecommendationCandidate[] {
  const areas = context.preferences.areas.map(parseArea).filter((a): a is number => a !== null);
  if (areas.length === 0) return [];
  const target = areas[0];
  return projects
    .sort((a, b) => Math.abs(a.specs.area - target) - Math.abs(b.specs.area - target))
    .slice(0, 6)
    .map((p) => projectToCandidate(p, Math.abs(p.specs.area - target) <= 10));
}

export function matchProjectsByFloors(context: RecommendationContext): RecommendationCandidate[] {
  const floors = context.preferences.floors;
  if (floors.length === 0) return [];
  return projects
    .filter((p) => floors.includes(String(p.specs.floors)))
    .slice(0, 6)
    .map((p) => projectToCandidate(p, true));
}

export function matchProjectsByLayout(_context: RecommendationContext): RecommendationCandidate[] {
  return [];
}

export function matchProjectsByLocation(context: RecommendationContext): RecommendationCandidate[] {
  if (!context.consent.location || context.preferences.locations.length === 0) return [];
  return projects.slice(0, 4).map((p) => projectToCandidate(p, false));
}

export function findSimilarProjectsById(projectId: string): RecommendationCandidate[] {
  const current = projects.find((p) => p.id === projectId || p.slug === projectId);
  if (!current) return [];
  return findSimilarProjects(current, projects, 6).map((p) => projectToCandidate(p, false));
}

export function diversifyProjectRecommendations(items: RecommendationCandidate[]): RecommendationCandidate[] {
  const seenAreas = new Set<number>();
  const result: RecommendationCandidate[] = [];
  for (const item of items) {
    const area = Number.parseInt(item.description?.match(/\d+/)?.[0] ?? "0", 10);
    if (!seenAreas.has(area) || result.length < 2) {
      result.push(item);
      seenAreas.add(area);
    }
  }
  return result;
}

export function explainProjectRecommendation(project: Project, context: RecommendationContext): string {
  const exact =
    context.preferences.areas.some((a) => {
      const target = parseArea(a);
      return target !== null && Math.abs(project.specs.area - target) <= 10;
    }) && context.preferences.floors.includes(String(project.specs.floors));

  if (!exact && context.preferences.technologies.length > 0) {
    const techMatch = context.preferences.technologies.some((t) =>
      project.specs.technology.toLowerCase().includes(t.toLowerCase()),
    );
    if (!techMatch) {
      return recommendationExplanationService.removeSensitiveExplanationSignals(
        "Точного совпадения не найдено. Ниже — ближайшие варианты по площади, этажности или технологии.",
      );
    }
  }

  return recommendationExplanationService.explainProjectMatch(project, context);
}

export function recommendProjects(context: RecommendationContext): RecommendationCandidate[] {
  const matchers = [
    matchProjectsByTechnology,
    matchProjectsByArea,
    matchProjectsByFloors,
    matchProjectsByMaterial,
    matchProjectsByBuildingType,
  ];

  const scored = projects
    .map((project) => ({ project, score: scoreProject(project, context) }))
    .sort((a, b) => b.score - a.score);

  let candidates: RecommendationCandidate[] = [];
  for (const matcher of matchers) {
    const matched = matcher(context);
    if (matched.length > 0) {
      candidates = matched;
      break;
    }
  }

  if (candidates.length === 0) {
    candidates = scored.slice(0, 6).map(({ project, score }) => {
      const exact = score >= 4;
      const candidate = projectToCandidate(project, exact);
      if (!exact) {
        candidate.description =
          "Точного совпадения не найдено. Ниже — ближайшие варианты по площади, этажности или технологии.";
      }
      return candidate;
    });
  }

  return diversifyProjectRecommendations(candidates);
}

export const projectRecommendationService = {
  recommendProjects,
  matchProjectsByBuildingType,
  matchProjectsByTechnology,
  matchProjectsBySize,
  matchProjectsByArea,
  matchProjectsByFloors,
  matchProjectsByLayout,
  matchProjectsByLocation,
  findSimilarProjects: findSimilarProjectsById,
  diversifyProjectRecommendations,
  explainProjectRecommendation,
  matchProjectsByMaterial,
};
