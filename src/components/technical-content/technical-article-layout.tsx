import type { TechnicalArticle, TechnicalArticleBlock } from "@/types/technical-content";
import { getTechnicalAuthorById, getDefaultTechnicalAuthor } from "@/data/technical-authors";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { TechnicalArticleTracker } from "./technical-article-tracker";
import { TechnicalArticleHero } from "./technical-article-hero";
import { TechnicalShortAnswer } from "./technical-short-answer";
import { TechnicalDisclaimer } from "./technical-disclaimer";
import { TechnicalStepsBlock } from "./technical-steps-block";
import { TechnicalMistakesBlock } from "./technical-mistakes-block";
import { TechnicalWhenToCallExpert } from "./technical-when-to-call-expert";
import { TechnicalRelatedProjects } from "./technical-related-projects";
import { TechnicalRelatedArticles } from "./technical-related-articles";
import { TechnicalLeadMagnet } from "./technical-lead-magnet";
import { TechnicalFAQ } from "./technical-faq";
import { TechnicalCTA } from "./technical-cta";
import { TechnicalLeadForm } from "./technical-lead-form";
import { TechnicalStickyCta } from "./technical-sticky-cta";

function hasBlock(article: TechnicalArticle, block: TechnicalArticleBlock) {
  return article.blocks.includes(block);
}

export function TechnicalArticleLayout({ article }: { article: TechnicalArticle }) {
  const author = article.authorId
    ? getTechnicalAuthorById(article.authorId)
    : getDefaultTechnicalAuthor();

  return (
    <article className="pt-28 pb-32">
      <TechnicalArticleTracker article={article} />
      {article.schema ? <JsonLd data={article.schema} /> : null}

      <div className="container-narrow max-w-3xl px-5 md:px-10 lg:px-16">
        {hasBlock(article, "breadcrumbs") ? (
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Блог", href: "/blog" },
              { label: article.h1 },
            ]}
          />
        ) : null}

        {hasBlock(article, "hero") ? (
          <TechnicalArticleHero article={article} author={author} />
        ) : null}

        {hasBlock(article, "short-answer") ? (
          <TechnicalShortAnswer text={article.content.shortAnswer} />
        ) : null}

        {hasBlock(article, "disclaimer") ? (
          <TechnicalDisclaimer disclaimerId={article.content.disclaimerId} />
        ) : null}

        {article.content.intro ? (
          <p className="mt-6 leading-relaxed text-muted">{article.content.intro}</p>
        ) : null}

        {hasBlock(article, "where-used") && article.content.whereUsed ? (
          <section className="mt-10">
            <h2 className="font-display text-2xl">Где это важно</h2>
            <p className="mt-3 text-muted">{article.content.whereUsed}</p>
          </section>
        ) : null}

        {hasBlock(article, "how-it-works") && article.content.howItWorks ? (
          <section className="mt-10">
            <h2 className="font-display text-2xl">Как это устроено</h2>
            <p className="mt-3 text-muted">{article.content.howItWorks}</p>
          </section>
        ) : null}

        {hasBlock(article, "how-it-is-usually-done") ? (
          <TechnicalStepsBlock
            title="Как это обычно делается"
            steps={article.content.steps ?? [article.content.howUsuallyDone ?? ""]}
          />
        ) : null}

        {hasBlock(article, "mistakes") ? (
          <TechnicalMistakesBlock mistakes={article.content.mistakes ?? []} />
        ) : null}

        {hasBlock(article, "cost-factors") && article.content.costFactors?.length ? (
          <section className="mt-10">
            <h2 className="font-display text-2xl">Что влияет на решение и бюджет</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {article.content.costFactors.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-graphite" aria-hidden>
                    •
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {hasBlock(article, "when-to-call-expert") ? (
          <TechnicalWhenToCallExpert items={article.content.whenToCallExpert ?? []} />
        ) : null}

        {hasBlock(article, "checklist") && article.content.checklist?.length ? (
          <section className="mt-10 rounded-sm border border-graphite/10 bg-sand/30 p-6">
            <h2 className="font-display text-2xl">Чек-лист</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">
              {article.content.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>
        ) : null}

        {hasBlock(article, "final-cta") ? <TechnicalCTA article={article} position="middle" /> : null}

        {hasBlock(article, "related-projects") ? (
          <TechnicalRelatedProjects article={article} />
        ) : null}

        {hasBlock(article, "related-articles") ? (
          <TechnicalRelatedArticles article={article} />
        ) : null}

        {hasBlock(article, "lead-magnet") ? <TechnicalLeadMagnet article={article} /> : null}

        {hasBlock(article, "faq") ? <TechnicalFAQ article={article} /> : null}

        {article.content.conclusion ? (
          <p className="mt-10 text-muted">{article.content.conclusion}</p>
        ) : null}

        <TechnicalLeadForm article={article} />
      </div>

      <TechnicalStickyCta article={article} />
    </article>
  );
}
