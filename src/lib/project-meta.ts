import type { Project } from "@/types";

export type ProjectPurpose = "семья" | "дача" | "постоянное" | "загородная";

export function inferProjectPurpose(project: Pick<Project, "slug" | "name" | "specs">): ProjectPurpose[] {
  const s = `${project.slug} ${project.name}`.toLowerCase();
  const purposes = new Set<ProjectPurpose>();

  if (s.includes("dach") || project.specs.area < 75) purposes.add("дача");
  if (project.specs.area >= 90) purposes.add("постоянное");
  if (project.specs.area >= 70) purposes.add("загородная");
  if (project.specs.bedrooms >= 3 || project.specs.area >= 110) purposes.add("семья");

  if (purposes.size === 0) purposes.add("загородная");
  return [...purposes];
}

export function inferHasCabinet(project: Pick<Project, "slug" | "name" | "specs">): boolean {
  const s = `${project.slug} ${project.name}`.toLowerCase();
  return s.includes("kabinet") || s.includes("кабинет") || project.specs.bedrooms >= 4 || project.specs.area >= 140;
}

export function projectShortDescription(project: Project): string {
  if (project.tagline) {
    return `${project.name} — ${project.specs.area} м², ${project.specs.floors} ${
      project.specs.floors === 1 ? "этаж" : "этажа"
    }, ${project.specs.material}. Проект можно адаптировать под участок и бюджет.`;
  }
  return project.description.split(".")[0] + ".";
}

export function projectBadges(project: Project): string[] {
  const badges: string[] = [];
  badges.push(`${project.specs.area} м²`);
  badges.push(`${project.specs.floors} эт.`);
  badges.push(project.specs.material);
  if (project.specs.hasTerrace) badges.push("Терраса");
  if (project.specs.hasGarage) badges.push("Гараж");
  if (project.specs.hasSauna) badges.push("Баня");
  if (project.purpose?.includes("семья")) badges.push("Для семьи");
  if (project.specs.hasCabinet) badges.push("Кабинет");
  return badges.slice(0, 4);
}

export function enrichProject(project: Project): Project {
  const purpose = project.purpose ?? inferProjectPurpose(project);
  const hasCabinet = project.specs.hasCabinet ?? inferHasCabinet(project);
  return {
    ...project,
    purpose,
    shortDescription: project.shortDescription ?? projectShortDescription(project),
    specs: { ...project.specs, hasCabinet },
  };
}
