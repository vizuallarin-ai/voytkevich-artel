export type CaseStatus = "published" | "draft" | "noindex" | "needs-data";

export type CaseGalleryImage = {
  src: string;
  alt: string;
  caption?: string;
  type?: "result" | "process" | "before" | "plan" | "detail";
};

export type CaseItem = {
  id: string;
  slug: string;
  title: string;
  h1: string;
  excerpt: string;
  status: CaseStatus;

  location?: {
    city?: string;
    district?: string;
    settlement?: string;
    region?: string;
    coordinates?: { lat: number; lng: number };
    showExactLocation?: boolean;
    displayLabel?: string;
  };

  project?: {
    projectSlug?: string;
    projectTitle?: string;
    customProject?: boolean;
  };

  house: {
    area?: number;
    floors?: number;
    material?: string;
    bedrooms?: number;
    bathrooms?: number;
    features?: string[];
    purpose?: string[];
    workFormat?: string;
    completion?: string;
  };

  timeline?: {
    year?: number;
    startDate?: string;
    finishDate?: string;
    durationMonths?: number;
  };

  budget?: {
    showBudget?: boolean;
    value?: number;
    min?: number;
    max?: number;
    currency?: "RUB";
    note?: string;
  };

  clientTask: {
    title: string;
    description: string;
    goals?: string[];
  };

  initialInputs?: {
    land?: string;
    familyScenario?: string;
    budgetGoal?: string;
    projectGoal?: string;
    constraints?: string[];
  };

  challenges?: {
    title: string;
    description: string;
    solution: string;
  }[];

  stages?: {
    title: string;
    description: string;
    image?: string;
    date?: string;
  }[];

  result?: {
    description: string;
    highlights?: string[];
    images?: string[];
  };

  gallery?: CaseGalleryImage[];

  testimonial?: {
    text: string;
    authorName?: string;
    authorLabel?: string;
    source?: string;
    verified?: boolean;
  };

  takeaways?: string[];

  tags?: string[];
  taskTags?: string[];

  relatedProjectSlugs?: string[];
  relatedServiceSlugs?: string[];
  relatedBlogSlugs?: string[];
  relatedCaseSlugs?: string[];

  seoTitle: string;
  seoDescription: string;
  targetQueries?: string[];

  faqs?: { question: string; answer: string }[];

  leadCTA?: {
    label: string;
    description?: string;
  };

  /** Internal note for editors — not shown on page */
  editorNote?: string;
};

export type CaseCategory = {
  slug: string;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  noindexIfEmpty: boolean;
  filter: CaseCategoryFilter;
};

export type CaseCategoryFilter = {
  material?: string[];
  floors?: number[];
  areaMin?: number;
  areaMax?: number;
  purpose?: string[];
  taskTags?: string[];
  region?: string;
};

export type CaseListFilters = {
  material?: string[];
  areaPreset?: "do-100" | "100-150" | "150-200" | "200-plus";
  floors?: number[];
  purpose?: string[];
  taskTags?: string[];
};
