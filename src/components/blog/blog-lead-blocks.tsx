import Link from "next/link";
import type { BlogPost } from "@/types/blog";
import type { BlogLeadMagnet } from "@/data/blog-lead-magnets";
import { LeadForm } from "@/components/forms/lead-form";
import { buildBlogLeadComment, buildBlogLeadSource } from "@/lib/blog";

export function BlogLeadMagnetBlock({
  post,
  magnet,
}: {
  post: BlogPost;
  magnet: BlogLeadMagnet;
}) {
  return (
    <section
      id="blog-lead-magnet"
      aria-labelledby="blog-magnet-title"
      className="mt-16 rounded-sm border border-graphite/10 bg-graphite/[0.02] p-6 md:p-8"
    >
      <h2 id="blog-magnet-title" className="font-display text-xl">
        {magnet.title}
      </h2>
      <p className="mt-2 text-sm text-muted">{magnet.description}</p>
      <Link href="#blog-lead" className="mt-2 inline-block text-sm font-medium text-wood hover:underline">
        {magnet.cta} →
      </Link>
    </section>
  );
}

export function BlogFinalLeadForm({
  post,
  title,
  subtitle,
  leadMagnetId,
}: {
  post: BlogPost;
  title?: string;
  subtitle?: string;
  leadMagnetId?: string;
}) {
  const comment = buildBlogLeadComment(post, { leadMagnetId });
  return (
    <div className="mt-16 border-t border-graphite/10 pt-16">
      <LeadForm
        id="blog-lead"
        title={title ?? "Получить предварительный расчёт"}
        subtitle={subtitle ?? "Уточним вводные и подскажем следующий шаг — расчёт, проект или консультация"}
        source={buildBlogLeadSource(post)}
        prefilledComment={comment}
        submitLabel="Отправить"
      />
    </div>
  );
}

export function BlogUpdateNotice() {
  return (
    <p className="mt-4 rounded-sm border border-amber-200/60 bg-amber-50/80 px-4 py-3 text-sm text-muted dark:border-amber-900/40 dark:bg-amber-950/20">
      Материал требует периодического обновления: стоимость материалов, условия банков и расходы
      могут меняться. Ориентиры — предварительные.
    </p>
  );
}
