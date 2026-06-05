export type Material = "каркас" | "газобетон" | "кирпич" | "брус" | "клееный брус";
export type Style = "скандинавский" | "минимализм" | "шале" | "барнхаус" | "хай-тек" | "классика";

export type ProjectPurpose = "семья" | "дача" | "постоянное" | "загородная";

export interface ProjectSpecs {
  area: number;
  floors: 1 | 2 | 3;
  bedrooms: number;
  bathrooms: number;
  buildTimeMonths: number;
  material: Material;
  style: Style;
  hasTerrace: boolean;
  hasGarage: boolean;
  hasSauna: boolean;
  /** Кабинет / рабочая зона — optional, выводится из площади и планировки */
  hasCabinet?: boolean;
  technology: string;
}

export interface FloorRoom {
  id: string;
  name: string;
  area: number;
  /** SVG polygon points (viewBox 0 0 100 100) */
  polygon: string;
}

export interface FloorPlan {
  floor: number;
  label: string;
  image: string;
  rooms: FloorRoom[];
}

export interface ProjectPackage {
  id: string;
  name: string;
  priceFrom: number;
  includes: string[];
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  pricePerSqm: number;
  specs: ProjectSpecs;
  images: string[];
  gallery: string[];
  floorPlans: FloorPlan[];
  videoUrl?: string;
  features: string[];
  advantages: string[];
  buildStages: { title: string; duration: string; description: string }[];
  packages: ProjectPackage[];
  seo: { title: string; description: string; keywords: string[] };
  featured: boolean;
  createdAt: string;
  /** Короткое описание для карточки каталога */
  shortDescription?: string;
  /** Назначение: семья, дача, постоянное проживание */
  purpose?: ProjectPurpose[];
  tags?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  publishedAt: string;
  readTime: number;
  author: string;
  seo: { title: string; description: string };
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface BuiltHome {
  id: string;
  name: string;
  lat: number;
  lng: number;
  year: number;
  area: number;
  image: string;
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
}

export interface Partner {
  name: string;
  logo: string;
}

export interface CalculatorInput {
  area: number;
  floors: 1 | 2;
  material: Material;
  foundation: "ленточный" | "плита" | "свайный";
  finish: "коробка" | "предчистовая" | "под ключ";
  utilities: boolean;
  plotPrep: boolean;
}

export interface CalculatorResult {
  total: number;
  perSqm: number;
  buildMonths: number;
  breakdown: { label: string; amount: number }[];
}

export interface CatalogFilters {
  q?: string;
  areaMin?: number;
  areaMax?: number;
  priceMin?: number;
  priceMax?: number;
  floors?: number[];
  material?: Material[];
  style?: Style[];
  bedrooms?: number[];
  terrace?: boolean;
  garage?: boolean;
  sauna?: boolean;
  cabinet?: boolean;
  purpose?: ProjectPurpose[];
  sort?:
    | "price-asc"
    | "price-desc"
    | "area-asc"
    | "area-desc"
    | "duration-asc"
    | "duration-desc"
    | "newest"
    | "featured";
}

export interface QuizAnswer {
  step: number;
  value: string | string[];
}

export type PlannerLayoutVariant = "classic" | "linear";

export interface PlannerInput {
  area: number;
  floors: 1 | 2;
  bedrooms: number;
  bathrooms: number;
  hasGarage: boolean;
  hasTerrace: boolean;
  material: Material;
  finish: CalculatorInput["finish"];
  layoutVariant?: PlannerLayoutVariant;
}

export interface PlannerRoomArea {
  id: string;
  name: string;
  area: number;
  floor: number;
}

export interface PlannerResult {
  floorPlans: FloorPlan[];
  roomAreas: PlannerRoomArea[];
  calculator: CalculatorResult;
  matchedProject: Project | null;
  matchScore: number;
}
