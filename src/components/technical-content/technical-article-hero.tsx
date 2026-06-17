import type { TechnicalArticle } from "@/types/technical-content";
import type { TechnicalAuthor } from "@/types/technical-content";
import { getTechnicalClusterById } from "@/data/technical-content-clusters";
import { TechnicalCTA } from "./technical-cta";

export function TechnicalArticleHero({
  article,
  author,
}: {
  article: TechnicalArticle;
  author?: TechnicalAuthor;
}) {
  const cluster = getTechnicalClusterById(article.clusterId);

  return (
    <header className="mt-4">
      <p className="label-caps text-muted">{cluster?.title ?? "Техническая база знаний"}</p>
      <h1 className="mt-3 font-display text-3xl leading-tight md:text-4xl">{article.h1}</h1>
      <p className="mt-4 text-muted">{article.seoDescription}</p>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
        {author ? (
          <span>
            {author.name}
            {author.type === "editorial-persona" ? ` · ${author.publicLabel}` : ""}
          </span>
        ) : null}
        {article.readTimeMinutes ? <span>{article.readTimeMinutes} мин чтения</span> : null}
        {article.updatedAt ? <span>Обновлено: {article.updatedAt}</span> : null}
      </div>
      {!article.indexing.indexable ? (
        <p className="mt-4 inline-block rounded-sm bg-amber-50 px-3 py-1 text-xs text-amber-900">
          Материал в подготовке — для ознакомления, не индексируется
        </p>
      ) : null}
      <div className="mt-6">
        <TechnicalCTA article={article} position="hero" />
      </div>
    </header>
  );
}
