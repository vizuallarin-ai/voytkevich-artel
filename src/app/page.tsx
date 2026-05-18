import Link from "next/link";
import Image from "next/image";
import { Hero } from "@/components/home/hero";
import { HouseQuiz } from "@/components/forms/quiz";
import { LeadForm } from "@/components/forms/lead-form";
import { ProjectCard } from "@/components/catalog/project-card";
import { Reveal, Stagger, StaggerItem } from "@/components/animations/reveal";
import { AnimatedCounter } from "@/components/animations/counter";
import { companyStats, guarantees } from "@/data/company";
import { faqItems } from "@/data/faq";
import { blogPosts } from "@/data/blog";
import { buildProcessSteps } from "@/data/process";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cms } from "@/lib/cms/local";

export default async function HomePage() {
  const featured = (await cms.getProjects()).filter((p) => p.featured).slice(0, 3);

  return (
    <>
      <Hero />

      <section id="catalog-preview" className="section-padding">
        <div className="container-narrow">
          <Reveal>
            <p className="label-caps">Каталог проектов</p>
            <h2 className="heading-section mt-2">Дома с прозрачной сметой</h2>
            <p className="mt-4 max-w-2xl text-muted">
              Реальные цены, сроки и технологии — без «от…» и скрытых доплат.
            </p>
          </Reveal>
          <Stagger className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <StaggerItem key={p.id}>
                <ProjectCard project={p} />
              </StaggerItem>
            ))}
          </Stagger>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/catalog">Весь каталог</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="section-padding bg-graphite text-background">
        <div className="container-narrow">
          <div className="grid gap-12 md:grid-cols-4">
            {companyStats.map((s) => (
              <Reveal key={s.label}>
                <p className="font-display text-4xl md:text-5xl">
                  <AnimatedCounter value={s.value} suffix={s.suffix} decimals={s.value % 1 ? 1 : 0} />
                </p>
                <p className="mt-2 text-sm text-background/70">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <Reveal>
            <p className="label-caps">Процесс</p>
            <h2 className="heading-section mt-2">Прозрачная стройка</h2>
          </Reveal>
          <div className="mt-12 space-y-8">
            {buildProcessSteps.slice(0, 4).map((step, i) => (
              <Reveal key={step.id} delay={i * 0.05}>
                <div className="grid gap-6 border-b border-graphite/10 pb-8 md:grid-cols-[120px_1fr]">
                  <span className="font-display text-4xl text-sand">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-xl font-medium">{step.title}</h3>
                    <p className="mt-1 text-sm text-wood">{step.duration}</p>
                    <p className="mt-2 text-muted">{step.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Button asChild className="mt-8" variant="outline">
            <Link href="/process">Все этапы</Link>
          </Button>
        </div>
      </section>

      <section className="section-padding bg-muted-bg">
        <div className="container-narrow grid gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="label-caps">Гарантии</p>
            <h2 className="heading-section mt-2">Почему нам доверяют</h2>
            <ul className="mt-8 space-y-4">
              {guarantees.map((g) => (
                <li key={g} className="flex gap-3 text-muted">
                  <span className="text-wood">—</span> {g}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
              <Image
                src="https://images.unsplash.com/photo-1590725170758-36adc9c4e3b0?w=800&h=1000&fit=crop"
                alt="Строительство дома NordHaus"
                fill
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <HouseQuiz />

      <section id="lead" className="section-padding">
        <div className="container-narrow grid gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="label-caps">Консультация</p>
            <h2 className="heading-section mt-2">Рассчитаем дом за 24 часа</h2>
            <p className="mt-4 text-muted">
              Оставьте заявку — подготовим смету, подберём проект и расскажем про ипотеку на ИЖС.
            </p>
          </Reveal>
          <LeadForm />
        </div>
      </section>

      <section className="section-padding bg-muted-bg">
        <div className="container-narrow max-w-3xl">
          <Reveal>
            <h2 className="heading-section">Частые вопросы</h2>
          </Reveal>
          <Accordion type="single" collapsible className="mt-8">
            {faqItems.slice(0, 4).map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Button asChild variant="ghost" className="mt-4">
            <Link href="/faq">Все вопросы</Link>
          </Button>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow">
          <Reveal>
            <p className="label-caps">Блог</p>
            <h2 className="heading-section mt-2">Полезно о строительстве</h2>
          </Reveal>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {blogPosts.slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block overflow-hidden rounded-sm"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="mt-4 text-xs text-muted">{post.category}</p>
                <h3 className="mt-1 font-display text-xl group-hover:text-wood">{post.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
