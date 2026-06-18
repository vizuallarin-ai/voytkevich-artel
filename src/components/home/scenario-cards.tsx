import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/animations/reveal";
import { clientScenarios } from "@/data/home";

export function ScenarioCards() {
  return (
    <section id="scenarios" className="section-padding" aria-labelledby="scenarios-title">
      <div className="container-narrow">
        <Reveal>
          <p className="label-caps">С чего начнём</p>
          <h2 id="scenarios-title" className="heading-section mt-2">
            С чего начнём
          </h2>
        </Reveal>
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientScenarios.map((s) => (
            <StaggerItem key={s.id}>
              <Link
                href={s.href}
                className="group flex h-full flex-col rounded-sm border border-graphite/10 bg-background p-6 transition hover:border-wood/40 hover:shadow-sm"
              >
                <h3 className="font-display text-lg">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{s.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-wood transition group-hover:gap-2">
                  {s.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
