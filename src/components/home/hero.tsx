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
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={heroHome.src}
          alt={heroHome.alt}
          fill
          priority
          className="object-cover object-center"
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
              {heroCopy.label}
            </motion.p>
            <motion.h1
              className="heading-display mt-4 max-w-3xl text-balance"
              initial={reduced ? false : { opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, delay: 0.1 }}
            >
              {heroCopy.headline}
            </motion.h1>
            <motion.p
              className="mt-6 max-w-xl text-lg text-muted"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {heroCopy.subheadline}
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap gap-4"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <MagneticButton>
                <Button asChild size="lg">
                  <Link href="/calculator">{cta.calculateCost}</Link>
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button asChild variant="outline" size="lg">
                  <Link href="/catalog">{cta.viewProjects}</Link>
                </Button>
              </MagneticButton>
            </motion.div>

            <motion.ul
              className="mt-8 flex flex-wrap gap-x-6 gap-y-3"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              aria-label="Ключевые факты"
            >
              {heroTrustFacts.map((f) => (
                <li key={f.label} className="min-w-[6.5rem]">
                  <p className="font-display text-xl leading-none tabular-nums md:text-2xl">{f.value}</p>
                  <p className="mt-1 text-xs leading-snug text-muted">{f.label}</p>
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
          href="#scenarios"
          className="mt-12 flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
          aria-label="Прокрутить к выбору сценария"
        >
          <ArrowDown className="h-4 w-4 animate-bounce" />
          Листайте вниз
        </a>
      </div>
    </section>
  );
}
