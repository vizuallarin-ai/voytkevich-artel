import type { StoredLead } from "@/types/lead";
import { formatPriceRange, formatRub, formatSourceType } from "@/lib/leads/lead-formatters";
import Link from "next/link";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm border border-graphite/10 bg-background p-5">
      <h3 className="font-display text-lg">{title}</h3>
      <div className="mt-3 space-y-2 text-sm text-muted">{children}</div>
    </section>
  );
}

export function LeadContextSections({ lead }: { lead: StoredLead }) {
  const { context } = lead;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {context.project ? (
        <Card title="Проект">
          <p className="text-foreground font-medium">{context.project.title ?? context.project.slug}</p>
          {context.project.area ? <p>Площадь: {context.project.area} м²</p> : null}
          {context.project.material ? <p>Материал: {context.project.material}</p> : null}
          {context.project.floors ? <p>Этажность: {context.project.floors}</p> : null}
          {context.project.priceFrom ? <p>Цена от: {formatRub(context.project.priceFrom)}</p> : null}
          {context.project.slug ? (
            <Link href={`/catalog/${context.project.slug}`} target="_blank" className="text-wood hover:underline">
              Открыть проект →
            </Link>
          ) : null}
        </Card>
      ) : null}

      {context.calculator ? (
        <Card title="Калькулятор">
          {context.calculator.area ? <p>Площадь: {context.calculator.area} м²</p> : null}
          {context.calculator.material ? <p>Материал: {context.calculator.material}</p> : null}
          {context.calculator.finish ? <p>Комплектация: {context.calculator.finish}</p> : null}
          {context.calculator.total ? <p>Итог: {formatRub(context.calculator.total)}</p> : null}
          {formatPriceRange(context.calculator.totalMin, context.calculator.totalMax) ? (
            <p>Диапазон: {formatPriceRange(context.calculator.totalMin, context.calculator.totalMax)}</p>
          ) : null}
          {context.calculator.perSqm ? <p>Цена за м²: {formatRub(context.calculator.perSqm)}</p> : null}
          {context.calculator.durationMinMonths ? <p>Срок: ~{context.calculator.durationMinMonths} мес.</p> : null}
        </Card>
      ) : null}

      {context.planner ? (
        <Card title="Планировщик">
          {context.planner.scenario ? <p>Сценарий: {context.planner.scenario}</p> : null}
          {context.planner.totalArea || context.planner.targetArea ? (
            <p>Площадь: {context.planner.totalArea ?? context.planner.targetArea} м²</p>
          ) : null}
          {context.planner.floors ? <p>Этажность: {context.planner.floors}</p> : null}
          {context.planner.hasLand ? <p>Участок: {context.planner.hasLand}</p> : null}
          {context.planner.landLocation ? <p>Локация: {context.planner.landLocation}</p> : null}
          {context.planner.rooms?.length ? (
            <ul className="list-disc pl-4">
              {context.planner.rooms.map((r) => (
                <li key={`${r.type}-${r.name}`}>{r.name}: {r.area} м²</li>
              ))}
            </ul>
          ) : null}
          {context.planner.recommendations?.length ? (
            <ul className="list-disc pl-4">
              {context.planner.recommendations.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          ) : null}
        </Card>
      ) : null}

      {context.leadMagnet ? (
        <Card title="Лид-магнит">
          <p className="text-foreground font-medium">{context.leadMagnet.title}</p>
          {context.leadMagnet.type ? <p>Тип: {context.leadMagnet.type}</p> : null}
          {context.leadMagnet.fileStatus ? <p>Файл: {context.leadMagnet.fileStatus}</p> : null}
        </Card>
      ) : null}

      {context.service ? (
        <Card title="Услуга">
          <p className="text-foreground font-medium">{context.service.title ?? context.service.slug}</p>
          {context.service.slug ? (
            <Link href={`/${context.service.slug}`} target="_blank" className="text-wood hover:underline">
              Открыть страницу →
            </Link>
          ) : null}
        </Card>
      ) : null}

      {context.blog ? (
        <Card title="Статья блога">
          <p className="text-foreground font-medium">{context.blog.title ?? context.blog.slug}</p>
          {context.blog.clusterId ? <p>Кластер: {context.blog.clusterId}</p> : null}
          {context.blog.slug ? (
            <Link href={`/blog/${context.blog.slug}`} target="_blank" className="text-wood hover:underline">
              Открыть статью →
            </Link>
          ) : null}
        </Card>
      ) : null}

      {context.case ? (
        <Card title="Кейс">
          <p className="text-foreground font-medium">{context.case.title ?? context.case.slug}</p>
          {context.case.area ? <p>{context.case.area} м²</p> : null}
          {context.case.slug ? (
            <Link href={`/cases/${context.case.slug}`} target="_blank" className="text-wood hover:underline">
              Открыть кейс →
            </Link>
          ) : null}
        </Card>
      ) : null}

      {context.objectMap ? (
        <Card title="Карта объектов">
          {context.objectMap.locationLabel ? <p>{context.objectMap.locationLabel}</p> : null}
          {context.objectMap.areaSlug ? (
            <Link href={`/objects-map/${context.objectMap.areaSlug}`} target="_blank" className="text-wood hover:underline">
              Открыть зону →
            </Link>
          ) : null}
        </Card>
      ) : null}

      <Card title="Источник и аналитика">
        <p>Тип: {formatSourceType(lead.source.sourceType)}</p>
        {lead.source.pageSlug ? <p>Slug: {lead.source.pageSlug}</p> : null}
        {lead.request.selectedCTA ? <p>CTA: {lead.request.selectedCTA}</p> : null}
        {lead.meta.currentUrl ? <p className="break-all">URL: {lead.meta.currentUrl}</p> : null}
        {lead.analytics.utm?.source ? (
          <p>
            UTM: {lead.analytics.utm.source}
            {lead.analytics.utm.medium ? ` / ${lead.analytics.utm.medium}` : ""}
            {lead.analytics.utm.campaign ? ` / ${lead.analytics.utm.campaign}` : ""}
          </p>
        ) : null}
        {lead.analytics.traffic?.landingPage ? <p>Landing: {lead.analytics.traffic.landingPage}</p> : null}
        {lead.analytics.session?.sessionId ? <p className="break-all">Session: {lead.analytics.session.sessionId}</p> : null}
      </Card>
    </div>
  );
}
