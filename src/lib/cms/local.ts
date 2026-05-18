import { projects } from "@/data/projects";
import { blogPosts } from "@/data/blog";
import type { CMSAdapter } from "./types";

/** Local JSON/data CMS — swap for Sanity/Strapi/Payload adapter */
export const localCMS: CMSAdapter = {
  async getProjects() {
    return projects;
  },
  async getProjectBySlug(slug: string) {
    return projects.find((p) => p.slug === slug) ?? null;
  },
  async getBlogPosts() {
    return blogPosts;
  },
  async getBlogPostBySlug(slug: string) {
    return blogPosts.find((p) => p.slug === slug) ?? null;
  },
};

export const cms = localCMS;
