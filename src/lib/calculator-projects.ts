import type { CalculatorEstimateInput, CalculatorEstimateResult } from "@/lib/calculator";
import type { Project } from "@/types";

export function findProjectsForEstimate(
  input: CalculatorEstimateInput,
  result: CalculatorEstimateResult,
  projects: Project[],
  limit = 6,
): Project[] {
  const areaMin = input.area - 30;
  const areaMax = input.area + 30;

  return projects
    .map((project) => {
      const { specs } = project;
      let score = Math.abs(specs.area - input.area) * 2;

      if (specs.material !== input.material) score += 15;
      if (specs.floors !== input.floors) score += 20;

      if (project.price < result.totalMin * 0.7 || project.price > result.totalMax * 1.3) {
        score += 12;
      }

      if (specs.area < areaMin || specs.area > areaMax) score += 25;

      return { project, score };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => x.project);
}
