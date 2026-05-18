import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { Reveal } from "@/components/animations/reveal";
import { buildProcessSteps } from "@/data/process";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Процесс строительства дома под ключ",
  description: "7 этапов: от проектирования до сдачи. Сроки, фото, прозрачный контроль.",
  path: "/process",
});

export default function ProcessPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="container-narrow px-5 md:px-10 lg:px-16">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Процесс" }]} />
        <Reveal>
          <p className="label-caps">Процесс</p>
          <h1 className="heading-section mt-2">Как мы строим ваш дом</h1>
          <p className="mt-6 max-w-2xl text-muted">
            Каждый этап фиксируется в договоре, сопровождается актами и фотоотчётами.
          </p>
        </Reveal>
      </div>

      <div className="container-narrow mt-16 px-5 md:px-10 lg:px-16">
        <div className="relative">
          <div className="absolute left-4 top-0 hidden h-full w-px bg-graphite/20 md:block" />
          {buildProcessSteps.map((step, i) => (
            <Reveal key={step.id} delay={i * 0.05} className="relative mb-16 md:pl-16">
              <span className="absolute left-2 top-8 hidden h-3 w-3 rounded-full bg-wood md:block" />
              <div className="grid gap-8 overflow-hidden rounded-sm bg-muted-bg md:grid-cols-2">
                <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[280px]">
                  <Image src={step.image} alt={step.title} fill className="object-cover" />
                </div>
                <div className="flex flex-col justify-center p-8">
                  <span className="font-display text-5xl text-sand">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="mt-2 font-display text-2xl">{step.title}</h2>
                  <p className="mt-2 text-sm text-wood">{step.duration}</p>
                  <p className="mt-4 text-muted">{step.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
