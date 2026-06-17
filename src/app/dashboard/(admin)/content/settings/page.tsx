import type { Metadata } from "next";
import Link from "next/link";
import { contentPublishingRules } from "@/data/content-publishing-rules";
import { contentBulkActions } from "@/data/content-bulk-actions";

export const metadata: Metadata = {
  title: "CRM — Настройки CMS",
  robots: { index: false, follow: false },
};

export default function ContentSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/content" className="text-sm text-muted underline-offset-4 hover:underline">
          ← Контент CMS
        </Link>
        <h1 className="mt-3 heading-section text-3xl">Настройки CMS</h1>
        <p className="mt-2 text-sm text-muted">
          Mock/dev repository. Production: Supabase adapter (TODO). RBAC: admin/editor/seo/expert/viewer.
        </p>
      </div>

      <section className="rounded-sm border border-graphite/10 bg-background p-5">
        <h2 className="font-display text-lg">Publishing rules</h2>
        <ul className="mt-3 space-y-1 text-sm text-muted">
          <li>Publish statuses: {contentPublishingRules.canPublishStatuses.join(", ")}</li>
          <li>Forbidden direct publish: {contentPublishingRules.forbiddenDirectPublish.length} statuses</li>
        </ul>
      </section>

      <section className="rounded-sm border border-graphite/10 bg-background p-5">
        <h2 className="font-display text-lg">Bulk actions</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {contentBulkActions.map((action) => (
            <li key={action.id} className="flex justify-between gap-4">
              <span>{action.label}</span>
              <span className="text-xs text-muted">
                {action.enabled ? "enabled" : action.disabledReason}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
