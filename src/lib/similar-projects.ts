import type { PlannerInput, Project } from "@/types";

function projectScore(project: Project, input: PlannerInput): number {
  return (
    Math.abs(project.specs.area - input.area) * 1.5 +
    Math.abs(project.specs.floors - input.floors) * 35 +
    Math.abs(project.specs.bedrooms - input.bedrooms) * 22 +
    Math.abs(project.specs.bathrooms - input.bathrooms) * 12 +
    (project.specs.hasGarage !== input.hasGarage ? 18 : 0) +
    (project.specs.hasTerrace !== input.hasTerrace ? 10 : 0) +
    (materialDistance(project.specs.material, input.material) ? 8 : 0)
  );
}

function materialDistance(a: string, b: string) {
  if (a === b) return false;
  const groups = [
    ["каркас", "брус", "клееный брус"],
    ["газобетон", "кирпич"],
  ];
  for (const group of groups) {
    if (group.includes(a) && group.includes(b)) return false;
  }
  return true;
}

export function findMatchingProjects(
  input: PlannerInput,
  projects: Project[],
  limit = 3,
): Project[] {
  return [...projects]
    .map((project) => ({ project, score: projectScore(project, input) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => x.project);
}

export function findSimilarProjects(
  current: Project,
  projects: Project[],
  limit = 4,
): Project[] {
  return projects
    .filter((p) => p.id !== current.id)
    .map((project) => ({
      project,
      score:
        Math.abs(project.specs.area - current.specs.area) * 2 +
        (project.specs.floors !== current.specs.floors ? 25 : 0) +
        (project.specs.material !== current.specs.material ? 12 : 0) +
        (project.specs.style !== current.specs.style ? 5 : 0) +
        Math.abs(project.price - current.price) / 500_000,
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => x.project);
}
