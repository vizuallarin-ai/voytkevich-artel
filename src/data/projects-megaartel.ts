import type { Material, Project, Style } from "@/types";
import { buildProjectDescription } from "@/lib/project-content";
import { enrichProject } from "@/lib/project-meta";
import scraped from "@/data/megaartel-scraped.json";

type Scraped = {
  slug: string;
  url: string;
  name: string;
  area: number | null;
  price: number | null;
  floors: number | null;
  material: string | null;
  images: string[];
  floorPlan: string | null;
};

function inferMaterial(slug: string, name: string, raw: string | null): Material {
  const s = `${slug} ${name} ${raw ?? ""}`.toLowerCase();
  if (s.includes("газобетон")) return "газобетон";
  if (s.includes("кирпич")) return "кирпич";
  if (s.includes("каркас") || s.includes("lstk")) return "каркас";
  if (s.includes("брус") || s.includes("brusovoj") || s.includes("derevyann")) return "брус";
  return "брус";
}

function inferStyle(slug: string, name: string): Style {
  const s = `${slug} ${name}`.toLowerCase();
  if (s.includes("barnhaus") || s.includes("барн")) return "барнхаус";
  if (s.includes("dachny") || s.includes("дачн")) return "скандинавский";
  if (s.includes("gazobeton")) return "минимализм";
  return "скандинавский";
}

function inferFloors(slug: string, name: string, floors: number | null): 1 | 2 {
  if (floors === 1 || floors === 2) return floors;
  const s = `${slug} ${name}`.toLowerCase();
  if (s.includes("dvuhetazh") || s.includes("2-etazh") || s.includes("двухэтаж") || s.includes("2 этажа"))
    return 2;
  return 1;
}

function inferArea(item: Scraped): number {
  if (item.area && item.area > 0) return item.area;
  const m = item.name.match(/(\d+)\s*м/i);
  return m ? parseInt(m[1], 10) : 100;
}

function normalizePrice(item: Scraped, area: number): number {
  if (item.price && item.price >= 500_000) return item.price;
  return Math.round(area * 38_000);
}

function shortName(name: string): string {
  return name.split("|")[0].trim().slice(0, 80);
}

function toProject(item: Scraped, index: number): Project {
  const area = inferArea(item);
  const price = normalizePrice(item, area);
  const floors = inferFloors(item.slug, item.name, item.floors);
  const material = inferMaterial(item.slug, item.name, item.material);
  const style = inferStyle(item.slug, item.name);
  const images = item.images.filter((u) => !u.includes("1971000x520_image"));
  const cover = images[0] ?? item.images[0];

  const floorPlans = item.floorPlan
    ? [
        {
          floor: 1,
          label: "Планировка",
          image: item.floorPlan,
          rooms: [],
        },
      ]
    : [];

  const hasSauna = item.slug.includes("banej") || item.name.toLowerCase().includes("бан");
  const hasGarage = item.slug.includes("garazhom");
  const hasTerrace =
    item.name.toLowerCase().includes("террас") || item.slug.includes("barnhaus");

  const project: Project = {
    id: String(index + 1),
    slug: item.slug,
    name: shortName(item.name),
    tagline: `${area} м² · ${material} · ${floors} ${floors === 1 ? "этаж" : "этажа"}`,
    description: "",
    price,
    pricePerSqm: Math.round(price / area),
    specs: {
      area,
      floors,
      bedrooms: floors === 2 ? Math.max(3, Math.round(area / 35)) : Math.max(2, Math.round(area / 28)),
      bathrooms: floors === 2 ? 2 : 1,
      buildTimeMonths: floors === 2 ? (area > 140 ? 7 : 6) : area < 50 ? 3 : 5,
      material,
      style,
      hasTerrace,
      hasGarage,
      hasSauna,
      technology: material === "брус" ? "Профилированный / клееный брус" : material,
    },
    images: [cover],
    gallery: images.length ? images : [cover],
    floorPlans,
    features: [
      "Фиксированная смета в договоре",
      "Фотоотчёты с объекта",
      hasSauna ? "Баня / сауна" : "Под ключ",
    ].filter(Boolean) as string[],
    advantages: [
      "Проект с реализованных объектов артели",
      `Площадь ${area} м² — можно увеличить или уменьшить`,
      "Планировка, фасад и комплектация под ваш участок",
    ],
    buildStages: [
      { title: "Проектирование", duration: "7–30 дн.", description: "Адаптация под участок" },
      { title: "Строительство", duration: "2–7 мес.", description: "Под ключ по договору" },
    ],
    packages: [
      {
        id: "full",
        name: "Под ключ",
        priceFrom: price,
        includes: ["Строительство", "Отделка", "Смета по договору"],
      },
    ],
    seo: {
      title: `${shortName(item.name)} ${area} м² — строительство под ключ Иркутск`,
      description: `Проект дома ${area} м², ${material}. Цена от ${(price / 1_000_000).toFixed(2)} млн ₽. Строительная артель Александра Войткевича.`,
      keywords: [`дом ${area} м2`, material, "Иркутск", "под ключ"],
    },
    featured: index < 6,
    createdAt: "2025-01-01",
  };

  return enrichProject({ ...project, description: buildProjectDescription(project) });
}

const items = (scraped as Scraped[]).filter((p) => p.slug !== "feed" && p.images?.length > 0);

export const megaartelProjects: Project[] = items.map(toProject);

export function getMegaartelProjectBySlug(slug: string) {
  return megaartelProjects.find((p) => p.slug === slug);
}
