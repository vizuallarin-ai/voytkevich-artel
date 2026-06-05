import { Star } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { testimonials, aggregateRating } from "@/data/testimonials";

export function TestimonialsSection() {
  return (
    <section className="section-padding bg-muted-bg" aria-labelledby="reviews-title">
      <div className="container-narrow">
        <Reveal>
          <p className="label-caps">Отзывы</p>
          <h2 id="reviews-title" className="heading-section mt-2">
            Что говорят клиенты
          </h2>
          <p className="mt-4 max-w-2xl text-muted">
            Средняя оценка {aggregateRating.value} на основе {aggregateRating.count} сданных объектов
            в Иркутске и области.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.05}>
              <blockquote className="flex h-full flex-col rounded-sm border border-graphite/10 bg-background p-6">
                <div className="flex gap-0.5" aria-label={`Оценка ${t.rating} из 5`}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-wood text-wood" aria-hidden />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">&ldquo;{t.text}&rdquo;</p>
                <footer className="mt-6 border-t border-graphite/10 pt-4">
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-muted">
                    {t.location} · {t.project} · {t.year}
                  </p>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
