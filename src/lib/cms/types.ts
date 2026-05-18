/** CMS adapter interface — plug Sanity, Strapi, or Payload */
export interface CMSAdapter {
  getProjects(): Promise<import("@/types").Project[]>;
  getProjectBySlug(slug: string): Promise<import("@/types").Project | null>;
  getBlogPosts(): Promise<import("@/types").BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<import("@/types").BlogPost | null>;
}
