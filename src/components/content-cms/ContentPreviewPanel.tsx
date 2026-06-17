import type { ContentPreview } from "@/lib/content-cms/content-preview-types";

export function ContentPreviewPanel({ preview }: { preview: ContentPreview }) {
  return (
    <div className="space-y-4 rounded-sm border border-graphite/10 bg-sand/20 p-5">
      <p className="text-xs text-amber-900">{preview.previewNote}</p>
      <div>
        <p className="label-caps text-muted">{preview.kind}</p>
        <h2 className="mt-2 font-display text-2xl">{preview.title}</h2>
        <p className="mt-2 text-sm text-muted">{preview.seo.description}</p>
      </div>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">URL</dt>
          <dd>{preview.url}</dd>
        </div>
        <div>
          <dt className="text-muted">Canonical</dt>
          <dd>{preview.seo.canonical}</dd>
        </div>
        <div>
          <dt className="text-muted">Robots</dt>
          <dd>
            index={preview.seo.robots.index ? "yes" : "no"}, follow=
            {preview.seo.robots.follow ? "yes" : "no"}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Fiction notice</dt>
          <dd>{preview.notices.fictionNotice}</dd>
        </div>
      </dl>
      {preview.relatedLinks.length > 0 ? (
        <div>
          <p className="text-sm font-medium">Related links</p>
          <ul className="mt-2 space-y-1 text-xs text-muted">
            {preview.relatedLinks.map((link) => (
              <li key={link}>{link}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
