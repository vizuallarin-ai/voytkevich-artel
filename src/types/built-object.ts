export type BuiltObjectStatus = "published" | "draft" | "noindex" | "needs-data";

export type BuiltObjectType =
  | "built-house"
  | "in-progress"
  | "project-adaptation"
  | "case-only";

export type BuiltObjectImage = {
  src: string;
  alt: string;
  caption?: string;
  type?: "result" | "process" | "detail" | "plan";
  allowedForPublicUse?: boolean;
};

export type BuiltObject = {
  id: string;
  slug: string;
  title: string;
  status: BuiltObjectStatus;
  objectType: BuiltObjectType;

  location: {
    region?: string;
    city?: string;
    district?: string;
    settlement?: string;
    areaSlug?: string;
    exactAddress?: string;
    showExactAddress: boolean;
    coordinates?: { lat: number; lng: number };
    showExactCoordinates: boolean;
    approximateCoordinates?: { lat: number; lng: number };
    locationLabel: string;
  };

  house: {
    area?: number;
    floors?: number;
    material?: string;
    bedrooms?: number;
    bathrooms?: number;
    features?: string[];
    purpose?: string[];
  };

  timeline?: {
    year?: number;
    startDate?: string;
    finishDate?: string;
    durationMonths?: number;
  };

  project?: {
    projectSlug?: string;
    projectTitle?: string;
    customProject?: boolean;
  };

  caseSlug?: string;

  images?: BuiltObjectImage[];

  summary: string;
  highlights?: string[];
  tags?: string[];

  seoTitle?: string;
  seoDescription?: string;

  allowedPublicFields: {
    location: boolean;
    photos: boolean;
    budget: boolean;
    timeline: boolean;
    caseLink: boolean;
  };

  budget?: {
    showBudget: boolean;
    value?: number;
    min?: number;
    max?: number;
    note?: string;
  };

  leadCTA?: {
    label: string;
    description?: string;
  };

  editorNote?: string;
};

export type BuiltObjectArea = {
  slug: string;
  title: string;
  h1: string;
  description: string;
  region?: string;
  city?: string;
  district?: string;
  settlement?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  seoTitle: string;
  seoDescription: string;
  noindexIfEmpty: boolean;
  relatedServicePages?: string[];
  relatedCatalogCategories?: string[];
  relatedBlogPosts?: string[];
  cta: { label: string; href: string };
};

export type BuiltObjectListFilters = {
  material?: string[];
  areaPreset?: "do-100" | "100-150" | "150-200" | "200-plus";
  floors?: number[];
  year?: number;
  purpose?: string[];
  objectType?: BuiltObjectType[];
  areaSlug?: string;
  hasCase?: boolean;
};

export type BuiltObjectMapCoordinates = {
  lat: number;
  lng: number;
  approximate: boolean;
};
