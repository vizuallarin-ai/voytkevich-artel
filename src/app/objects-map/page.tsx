import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import { allBuiltObjects, publishedBuiltObjects } from "@/data/built-objects";
import { builtObjectAreas } from "@/data/built-object-areas";
import { objectsMapFaqs } from "@/data/built-objects-faqs";
import {
  computeBuiltObjectsStats,
  getPublishedBuiltObjects,
} from "@/lib/built-objects";
import {
  ObjectsMapHero,
  ObjectsMapSeoText,
  ObjectsMapTrustBlock,
} from "@/components/objects-map/objects-map-sections";
import { BuiltObjectsMapClient } from "@/components/objects-map/built-objects-map-client";
import { BuiltObjectsStatsBlock } from "@/components/objects-map/built-objects-stats";
import { ObjectsMapFAQ } from "@/components/objects-map/objects-map-faq";
import { ObjectsMapViewTracker } from "@/components/objects-map/objects-map-view-tracker";
import { LeadForm } from "@/components/forms/lead-form";
import { Button } from "@/components/ui/button";
import { buildBuiltObjectLeadComment } from "@/lib/built-objects";

const hasPublished = publishedBuiltObjects.length > 0;

export const metadata: Metadata = pageMetadata({
  title: hasPublished
    ? "Карта построенных домов в Иркутске и области — объекты и кейсы"
    : "Карта построенных домов в Иркутске и области",
  description: hasPublished
    ? "Карта построенных домов и объектов: районы, материалы, площади, кейсы и похожие проекты. Точные адреса частных домов не раскрываются без согласия владельцев."
    : "Раздел карты объектов готовится к наполнению реальными построенными домами, кейсами и фото этапов.",
  path: "/objects-map",
  openGraphTitle: "Карта построенных домов",
  openGraphDescription:
    "География объектов, кейсы, материалы, площади и заявки на похожий дом.",
});

export default function ObjectsMapPage() {
  const published = getPublishedBuiltObjects(allBuiltObjects);
  const stats = computeBuiltObjectsStats(allBuiltObjects);

  return (
    <div className="pt-28 pb-20">
      <ObjectsMapViewTracker path="/objects-map" />
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Главная", url: SITE_URL },
            { name: "Карта объектов", url: `${SITE_URL}/objects-map` },
          ]),
          faqSchema(objectsMapFaqs),
        ]}
      />
      <div className="container-narrow px-5 md:px-10 lg:px-16">
        <Breadcrumbs
          items={[{ label: "Главная", href: "/" }, { label: "Карта объектов" }]}
        />

        <ObjectsMapHero hasPublished={hasPublished} />

        <BuiltObjectsStatsBlock stats={stats} />

        <BuiltObjectsMapClient objects={published} areas={builtObjectAreas} />

        <ObjectsMapTrustBlock />

        {hasPublished ? (
          <div className="mt-16 rounded-sm border border-wood/30 bg-wood/5 p-6 text-center md:p-8">
            <p className="font-display text-xl">Хотите похожий дом в своём районе?</p>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
              Обсудим участок, площадь, материал и подберём проект или кейс за основу.
            </p>
            <Button asChild className="mt-4">
              <Link href="#objects-map-lead">Оставить заявку</Link>
            </Button>
          </div>
        ) : null}

        <ObjectsMapSeoText hasPublished={hasPublished} />
        <ObjectsMapFAQ items={objectsMapFaqs} />

        <div id="objects-map-lead" className="mt-16 border-t border-graphite/10 pt-16">
          <LeadForm
            id="objects-map-lead-form"
            title="Хотите похожий дом в своём районе?"
            subtitle="Оставьте контакты — уточним участок, район, площадь, материал и подскажем, какой проект или кейс можно взять за основу."
            source="objects-map"
            prefilledComment={buildBuiltObjectLeadComment()}
            submitLabel="Обсудить похожий дом"
            footnote="Точный расчёт зависит от участка, проекта, фундамента, инженерии, материалов и комплектации."
          />
        </div>
      </div>
    </div>
  );
}
