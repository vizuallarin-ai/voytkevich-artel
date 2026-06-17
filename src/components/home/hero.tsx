"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/animations/magnetic-button";
import { HeroCalculator } from "@/components/home/hero-calculator";
import { brand } from "@/data/brand";
import { cta, heroCopy } from "@/data/copy";
import { heroTrustFacts } from "@/data/home";
import { heroHome } from "@/data/images";

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={heroHome.src}
          alt={heroHome.alt}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/55 to-background/90" />
      </div>

      <div className="container-narrow relative z-10 mx-auto flex min-h-[100svh] flex-col items-center px-5 pb-16 pt-28 text-center sm:pb-20 sm:pt-32 md:px-10 lg:px-16">
        <div className="flex w-full max-w-4xl flex-col items-center">
          <motion.p
            className="label-caps"
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {heroCopy.label}
          </motion.p>

          <motion.h1
            className="heading-display mt-4 text-balance"
            initial={reduced ? false : { opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.1 }}
          >
            {heroCopy.headline}
          </motion.h1>

          <motion.p
            className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {heroCopy.subheadline}
          </motion.p>

          <motion.div
            className="mt-8 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4"
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <MagneticButton className="w-full sm:w-auto">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/calculator">{cta.calculateCost}</Link>
              </Button>
            </MagneticButton>
            <MagneticButton className="w-full sm:w-auto">
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/#lead">{cta.discussPlot}</Link>
              </Button>
            </MagneticButton>
          </motion.div>

          <p className="mt-3 max-w-lg text-sm leading-snug text-muted">
            Сначала вводные — потом цифра. Не обещаем цену без расчёта.
          </p>
        </div>

        <motion.div
          className="mt-10 w-full max-w-md lg:absolute lg:bottom-24 lg:left-10 lg:mt-0 xl:left-16"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <HeroCalculator />
        </motion.div>

        <motion.ul
          className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-4 lg:mt-auto lg:pt-10"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          aria-label="Ключевые факты"
        >
          {heroTrustFacts.map((f) => (
            <li key={f.label} className="min-w-[6.5rem]">
              <p className="font-display text-xl leading-none tabular-nums md:text-2xl">{f.value}</p>
              <p className="mt-1 text-sm leading-snug text-muted">{f.label}</p>
            </li>
          ))}
        </motion.ul>

        <motion.div
          className="mt-6"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <a
            href={`tel:${brand.phone}`}
            className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
          >
            <Phone className="h-4 w-4" aria-hidden />
            {brand.phoneDisplay}
          </a>
        </motion.div>

        <a
          href="#scenarios"
          className="mt-10 flex items-center justify-center gap-2 text-sm text-muted transition hover:text-foreground"
          aria-label="Прокрутить к выбору сценария"
        >
          <ArrowDown className="h-4 w-4 animate-bounce" />
          Листайте вниз
        </a>
      </div>
    </section>
  );
}
