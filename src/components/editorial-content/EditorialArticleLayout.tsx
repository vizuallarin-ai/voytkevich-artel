import type { EditorialContentItem } from "@/types/editorial-content";
import { getEditorialAuthorById } from "@/data/editorial-authors";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { EditorialArticleTracker } from "./EditorialArticleTracker";
import { EditorialHero } from "./EditorialHero";
import { EditorialAuthorBadge } from "./EditorialAuthorBadge";
import { EditorialFictionNotice } from "./EditorialFictionNotice";
import { EditorialSourceNotice } from "./EditorialSourceNotice";
import { EditorialStoryBlock } from "./EditorialStoryBlock";
import { EditorialTakeaways } from "./EditorialTakeaways";
import { EditorialRelatedProjects } from "./EditorialRelatedProjects";
import { EditorialRelatedTechnicalArticles } from "./EditorialRelatedTechnicalArticles";
import { EditorialLeadMagnet } from "./EditorialLeadMagnet";
import { EditorialCTA } from "./EditorialCTA";
import { EditorialFAQ } from "./EditorialFAQ";
import { EditorialLeadForm } from "./EditorialLeadForm";

function hasBlock(item: EditorialContentItem, block: string) {
  return item.blocks.includes(block);
}

export function EditorialArticleLayout({ item }: { item: EditorialContentItem }) {
  const author = getEditorialAuthorById(item.authorId);

  return (
    <article className="pt-28 pb-32">
      <EditorialArticleTracker item={item} />
      {item.schema ? <JsonLd data={item.schema} /> : null}

      <div className="container-narrow max-w-3xl px-5 md:px-10 lg:px-16">
        {hasBlock(item, "breadcrumbs") ? (
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Блог", href: "/blog" },
              { label: item.h1 },
            ]}
          />
        ) : null}

        {hasBlock(item, "hero") ? <EditorialHero item={item} author={author} /> : null}

        {author ? <EditorialAuthorBadge author={author} /> : null}

        {hasBlock(item, "fiction-notice") ? <EditorialFictionNotice item={item} /> : null}

        <EditorialSourceNotice item={item} />

        {hasBlock(item, "story") ? <EditorialStoryBlock item={item} /> : null}

        {hasBlock(item, "takeaways") ? <EditorialTakeaways item={item} /> : null}

        {hasBlock(item, "cta") ? <EditorialCTA item={item} /> : null}

        {hasBlock(item, "related-technical") ? (
          <EditorialRelatedTechnicalArticles item={item} />
        ) : null}

        {hasBlock(item, "related-projects") ? <EditorialRelatedProjects item={item} /> : null}

        {hasBlock(item, "lead-magnet") ? <EditorialLeadMagnet item={item} /> : null}

        {hasBlock(item, "faq") ? <EditorialFAQ item={item} /> : null}

        {hasBlock(item, "lead-form") ? <EditorialLeadForm item={item} /> : null}
      </div>
    </article>
  );
}
