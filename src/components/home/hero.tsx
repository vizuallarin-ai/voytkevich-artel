"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Shield, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/animations/magnetic-button";
import { HeroCalculator } from "@/components/home/hero-calculator";
import { AnimatedCounter } from "@/components/animations/counter";

const stats = [
  { icon: Shield, label: "Гарантия 5 лет" },
  { icon: Clock, label: "Сдача в срок" },
  { icon: Award, label: "127 домов" },
];

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop&q=85"
          alt="Современный загородный дом NordHaus"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />
      </div>

      <div className="container-narrow relative z-10 flex min-h-screen flex-col justify-end px-5 pb-16 pt-32 md:px-10 md:pb-24 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <motion.p
              className="label-caps"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Иркутск · Дома под ключ с 2014
            </motion.p>
            <motion.h1
              className="heading-display mt-4 text-balance"
              initial={reduced ? false : { opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, delay: 0.1 }}
            >
              Строим дома,
              <br />
              <span className="text-wood">в которых хочется жить</span>
            </motion.h1>
            <motion.p
              className="mt-6 max-w-xl text-lg text-muted"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Фиксированная смета. Прозрачные сроки. Архитектурный подход — без типовых «коробок».
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap gap-4"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <MagneticButton>
                <Button asChild size="lg">
                  <Link href="/catalog">Смотреть проекты</Link>
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button asChild variant="outline" size="lg">
                  <Link href="/#lead">Получить расчёт</Link>
                </Button>
              </MagneticButton>
            </motion.div>

            <div className="mt-10 flex flex-wrap gap-6">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-sm">
                  <s.icon className="h-4 w-4 text-wood" aria-hidden />
                  {s.label}
                </div>
              ))}
            </div>

            <div className="mt-8 hidden gap-8 md:flex">
              <div>
                <p className="font-display text-3xl">
                  <AnimatedCounter value={127} />
                </p>
                <p className="text-xs text-muted">домов сдано</p>
              </div>
              <div>
                <p className="font-display text-3xl">
                  <AnimatedCounter value={98} suffix="%" />
                </p>
                <p className="text-xs text-muted">в срок</p>
              </div>
            </div>
          </div>

          <motion.div
            initial={reduced ? false : { opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <HeroCalculator />
          </motion.div>
        </div>

        <a
          href="#catalog-preview"
          className="mt-12 flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
          aria-label="Прокрутить к каталогу"
        >
          <ArrowDown className="h-4 w-4 animate-bounce" />
          Листайте вниз
        </a>
      </div>
    </section>
  );
}
