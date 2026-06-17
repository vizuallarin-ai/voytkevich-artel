import type { CMSContentItem } from "@/types/content-cms";
import { ContentStatusBadge } from "./ContentStatusBadge";
import { ContentQualityBadge } from "./ContentQualityBadge";
import { ContentIndexingBadge } from "./ContentIndexingBadge";
import { ContentWorkflowActions, ContentWarningsPanel } from "./ContentWorkflowActions";
import { ContentPreviewPanel } from "./ContentPreviewPanel";
import { getAvailableWorkflowActions } from "@/lib/content-cms/content-workflow";
import { buildContentPreview } from "@/lib/content-cms/content-preview";
import { getUnifiedContentQualityScore } from "@/lib/content-cms/content-quality-aggregator";
import { resolveContentIndexing } from "@/lib/content-cms/content-indexing-service";
import { ContentAuditLog } from "./ContentAuditLog";
import { ContentRelatedLinksPanel } from "./ContentRelatedLinksPanel";
import { ContentLeadContextPanel } from "./ContentLeadContextPanel";
import { ContentSourcePanel } from "./ContentSourcePanel";
import Link from "next/link";

export function ContentItemDetail({
  item,
  auditLog,
}: {
  item: CMSContentItem;
  auditLog: import("@/lib/content-cms/content-audit-log").ContentAuditLogEntry[];
}) {
  const actions = getAvailableWorkflowActions(item);
  const quality = getUnifiedContentQualityScore(item);
  const indexing = resolveContentIndexing(item);
  const preview = buildContentPreview(item);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/content/items" className="text-sm text-muted underline-offset-4 hover:underline">
          ← Все материалы
        </Link>
        <h1 className="mt-4 heading-section text-2xl md:text-3xl">{item.title}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <ContentStatusBadge status={item.status} />
          <ContentQualityBadge level={item.quality.level} score={item.quality.score} />
          <ContentIndexingBadge indexable={item.indexing.indexable} sitemap={item.indexing.sitemap} />
          <span className="rounded-sm bg-graphite/10 px-2 py-0.5 text-xs">{item.kind}</span>
          {item.seo.priority ? (
            <span className="rounded-sm bg-graphite/10 px-2 py-0.5 text-xs">{item.seo.priority}</span>
          ) : null}
        </div>
      </div>

      <section className="rounded-sm border border-graphite/10 bg-background p-5">
        <h2 className="font-display text-lg">Workflow</h2>
        <p className="mt-2 text-xs text-muted">
          Действия пока read-only в UI. Переходы валидируются на сервере при подключении API.
        </p>
        <div className="mt-4">
          <ContentWorkflowActions actions={actions} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-sm border border-graphite/10 bg-background p-5">
          <h2 className="font-display text-lg">Warnings / Blockers</h2>
          <div className="mt-4">
            <ContentWarningsPanel item={item} />
          </div>
          {quality.requiredActions.length > 0 ? (
            <ul className="mt-4 space-y-1 text-xs text-muted">
              {quality.requiredActions.map((a) => (
                <li key={a}>→ {a}</li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="rounded-sm border border-graphite/10 bg-background p-5">
          <h2 className="font-display text-lg">SEO</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-muted">Slug</dt>
              <dd>{item.slug}</dd>
            </div>
            <div>
              <dt className="text-muted">URL</dt>
              <dd>{item.url}</dd>
            </div>
            <div>
              <dt className="text-muted">Title</dt>
              <dd>{item.seoTitle ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Description</dt>
              <dd className="text-muted">{item.seoDescription ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Canonical</dt>
              <dd>{item.indexing.canonicalUrl ?? "—"}</dd>
            </div>
          </dl>
        </section>
      </div>

      {item.ethics ? (
        <section className="rounded-sm border border-graphite/10 bg-background p-5">
          <h2 className="font-display text-lg">Ethics</h2>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            <li>Fiction required: {item.ethics.fictionNoticeRequired ? "да" : "нет"}</li>
            <li>Fiction present: {item.ethics.fictionNoticePresent ? "да" : "нет"}</li>
            <li>Fake claim risk: {item.ethics.fakeClaimRisk ?? "—"}</li>
            <li>Author fictional: {item.ethics.authorIsFictional ? "да" : "нет"}</li>
          </ul>
        </section>
      ) : null}

      <section className="rounded-sm border border-graphite/10 bg-background p-5">
        <h2 className="font-display text-lg">Indexing decision</h2>
        <p className="mt-2 text-sm">
          Indexable: {indexing.indexable ? "да" : "нет"} · Sitemap: {indexing.sitemap ? "да" : "нет"}
        </p>
        {indexing.issues.length > 0 ? (
          <ul className="mt-3 space-y-1 text-sm text-amber-900">
            {indexing.issues.map((issue) => (
              <li key={issue.message}>• {issue.message}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="rounded-sm border border-graphite/10 bg-background p-5">
        <h2 className="font-display text-lg">Preview</h2>
        <div className="mt-4">
          <ContentPreviewPanel preview={preview} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-sm border border-graphite/10 bg-background p-5">
          <h2 className="font-display text-lg">Sources / Fact-check</h2>
          <div className="mt-4">
            <ContentSourcePanel item={item} />
          </div>
        </section>
        <section className="rounded-sm border border-graphite/10 bg-background p-5">
          <h2 className="font-display text-lg">Lead context</h2>
          <div className="mt-4">
            <ContentLeadContextPanel item={item} />
          </div>
        </section>
      </div>

      <section className="rounded-sm border border-graphite/10 bg-background p-5">
        <h2 className="font-display text-lg">Related links</h2>
        <div className="mt-4">
          <ContentRelatedLinksPanel item={item} />
        </div>
      </section>

      <ContentAuditLog entries={auditLog} />
    </div>
  );
}
