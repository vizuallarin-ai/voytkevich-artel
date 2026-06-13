import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd, breadcrumbSchema } from "@/components/seo/json-ld";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import { allBuiltObjects } from "@/data/built-objects";
import { builtObjectAreas, getBuiltObjectAreaBySlug } from "@/data/built-object-areas";
import {
  getBuiltObjectsForArea,
  getPublishedBuiltObjects,
} from "@/lib/built-objects";
import { BuiltObjectsMapClient } from "@/components/objects-map/built-objects-map-client";
import { ObjectsMapEmptyState } from "@/components/objects-map/objects-map-empty-state";
import { ObjectsMapViewTracker } from "@/components/objects-map/objects-map-view-tracker";
import { LeadForm } from "@/components/forms/lead-form";
import { buildBuiltObjectLeadComment } from "@/lib/built-objects";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ areaSlug: string }> };

export async function generateStaticParams() {
  return builtObjectAreas.map((a) => ({ areaSlug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { areaSlug } = await params;
  const area = getBuiltObjectAreaBySlug(areaSlug);
  if (!area) return {};
  const objects = getBuiltObjectsForArea(allBuiltObjects, area);
  const noindex = area.noindexIfEmpty && objects.length === 0;
  return pageMetadata({
    title: area.seoTitle,
    description: area.seoDescription,
    path: `/objects-map/${areaSlug}`,
    noindex,
  });
}

export default async function ObjectsMapAreaPage({ params }: Props) {
  const { areaSlug } = await params;
  const area = getBuiltObjectAreaBySlug(areaSlug);
  if (!area) notFound();

  const areaObjects = getBuiltObjectsForArea(allBuiltObjects, area);
  const published = getPublishedBuiltObjects(areaObjects);

  return (
    <div className="pt-28 pb-20">
      <ObjectsMapViewTracker path={`/objects-map/${areaSlug}`} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Главная", url: SITE_URL },
          { name: "Карта объектов", url: `${SITE_URL}/objects-map` },
          { name: area.title, url: `${SITE_URL}/objects-map/${areaSlug}` },
        ])}
      />
      <div className="container-narrow px-5 md:px-10 lg:px-16">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Карта объектов", href: "/objects-map" },
            { label: area.title },
          ]}
        />

        <header className="mt-8 max-w-3xl">
          <p className="label-caps">География объектов</p>
          <h1 className="heading-section mt-2">{area.h1}</h1>
          <p className="mt-4 text-muted leading-relaxed">{area.description}</p>
          <Button asChild variant="outline" className="mt-6">
            <Link href={area.cta.href}>{area.cta.label}</Link>
          </Button>
        </header>

        {published.length > 0 ? (
          <BuiltObjectsMapClient
            objects={published}
            areas={builtObjectAreas}
            initialAreaSlug={areaSlug}
          />
        ) : (
          <>
            <ObjectsMapEmptyState />
            <p className="mt-6 text-sm text-muted">
              Страница зоны подготовлена. Объекты будут добавлены после сбора данных и
              согласования с заказчиками. Сейчас страница не индексируется поисковиками.
            </p>
          </>
        )}

        <div id="objects-map-lead" className="mt-16 border-t border-graphite/10 pt-16">
          <LeadForm
            id={`objects-map-area-${areaSlug}`}
            title={`Хотите похожий дом — ${area.title}?`}
            subtitle="Уточним участок, район и подберём проект или кейс за основу."
            source={`objects-map:${areaSlug}`}
            prefilledComment={buildBuiltObjectLeadComment({ areaSlug })}
            submitLabel="Обсудить похожий дом"
          />
        </div>
      </div>
    </div>
  );
}
