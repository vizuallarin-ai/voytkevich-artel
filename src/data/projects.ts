/**
 * Каталог проектов артели (импорт из scraped JSON).
 * Обновление: npm run scrape:megaartel
 */
export {
  megaartelProjects as projects,
  getMegaartelProjectBySlug as getProjectBySlug,
} from "@/data/projects-megaartel";
