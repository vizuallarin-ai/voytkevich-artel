import { projects } from "@/data/projects";
import type { PlannerInput, Project } from "@/types";

export function findMatchingProject(input: PlannerInput): {
  project: Project | null;
  score: number;
} {
  let best: Project | null = null;
  let bestScore = Infinity;

  for (const project of projects) {
    const score =
      Math.abs(project.specs.area - input.area) * 1.5 +
      Math.abs(project.specs.floors - input.floors) * 35 +
      Math.abs(project.specs.bedrooms - input.bedrooms) * 22 +
      Math.abs(project.specs.bathrooms - input.bathrooms) * 12 +
      (project.specs.hasGarage !== input.hasGarage ? 18 : 0) +
      (project.specs.hasTerrace !== input.hasTerrace ? 10 : 0) +
      (materialDistance(project.specs.material, input.material) ? 8 : 0);

    if (score < bestScore) {
      bestScore = score;
      best = project;
    }
  }

  return { project: best, score: bestScore };
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
