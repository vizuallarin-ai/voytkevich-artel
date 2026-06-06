import type { BlogPost } from "@/types/blog";
import { allCases } from "@/data/cases";
import { getCasesForBlogPost } from "@/lib/cases";
import { RelatedCasesSection } from "./case-related";

export function BlogRelatedCases({ post }: { post: BlogPost }) {
  const cases = getCasesForBlogPost(allCases, post);
  if (!cases.length) return null;

  return (
    <RelatedCasesSection
      cases={cases}
      title="Похожие кейсы строительства"
      id="blog-related-cases"
    />
  );
}
