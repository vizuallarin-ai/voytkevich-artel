"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/animations/magnetic-button";
import { cta, heroCopy } from "@/data/copy";
import { heroTrustFacts } from "@/data/home";
import { heroHome } from "@/data/images";

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <>
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={heroHome.src}
            alt={heroHome.alt}
            fill
            priority
            className="object-cover object-[center_42%] sm:object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-background/50 to-background/88" />
        </div>

        <div className="container-narrow relative z-10 mx-auto flex min-h-[100svh] flex-col items-center justify-center px-5 py-28 text-center md:px-10 lg:px-16">
          <motion.p
            className="label-caps"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.6 }}
          >
            {heroCopy.label}
          </motion.p>

          <motion.h1
            className="heading-display mt-4 max-w-4xl"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.7, delay: 0.05 }}
          >
            <span className="font-semibold md:whitespace-nowrap">
              <span className="block md:inline">{heroCopy.headlineLead}</span>
              <span className="block md:inline">
                <span className="hidden md:inline"> </span>
                {heroCopy.headlineSuffix}
              </span>
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg"
            initial={false}
            animate={{ opacity: 1 }}
            transition={reduced ? { duration: 0 } : { delay: 0.15, duration: 0.6 }}
          >
            {heroCopy.subheadline}
          </motion.p>

          <motion.div
            className="mt-8 flex w-full max-w-md flex-col items-center gap-3 sm:max-w-none"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { delay: 0.2, duration: 0.6 }}
          >
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
              <MagneticButton className="w-full sm:w-auto">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/calculator">{cta.calculateCost}</Link>
                </Button>
              </MagneticButton>
              <MagneticButton className="w-full sm:w-auto">
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link href="/catalog">{cta.discussPlot}</Link>
                </Button>
              </MagneticButton>
            </div>
            <Button asChild variant="ghost" size="lg" className="text-muted hover:text-foreground">
              <Link href="/calculator">Калькулятор</Link>
            </Button>
          </motion.div>

          <p className="mt-3 max-w-lg text-sm leading-snug text-muted">
            Сначала вводные — потом цифра. Не обещаем цену без расчёта.
          </p>
        </div>

        <a
          href="#scenarios"
          className="absolute bottom-6 left-0 right-0 z-10 flex items-center justify-center gap-2 text-sm text-muted transition hover:text-foreground"
          aria-label="Прокрутить к выбору сценария"
        >
          <ArrowDown className="h-4 w-4 animate-bounce" />
          Листайте вниз
        </a>
      </section>

      <section
        className="border-y border-graphite/10 bg-muted-bg/90 py-6 md:py-8"
        aria-label="Ключевые факты"
      >
        <div className="container-narrow mx-auto px-5 md:px-10 lg:px-16">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-6 text-center sm:grid-cols-4 sm:gap-x-4">
            {heroTrustFacts.map((f) => (
              <li key={f.label}>
                <p className="font-display text-xl leading-none tabular-nums md:text-2xl">
                  {f.value}
                </p>
                <p className="mt-1 text-sm leading-snug text-muted">{f.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
