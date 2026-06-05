import { projects } from "@/data/projects";
import { findMatchingProjects as matchProjects } from "@/lib/similar-projects";
import type { PlannerInput, Project } from "@/types";

export function findMatchingProject(input: PlannerInput): {
  project: Project | null;
  score: number;
} {
  const matches = matchProjects(input, projects, 1);
  const project = matches[0] ?? null;
  return { project, score: project ? 0 : Infinity };
}

export function findTopMatchingProjects(input: PlannerInput, limit = 3): Project[] {
  return matchProjects(input, projects, limit);
}
