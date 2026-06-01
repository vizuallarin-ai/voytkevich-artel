"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/animations/magnetic-button";
import { brand } from "@/data/brand";
import { cta } from "@/data/copy";

const nav = [
  { href: "/catalog", label: "Каталог" },
  { href: "/calculator", label: "Калькулятор" },
  { href: "/planirovka", label: "Планировщик" },
  { href: "/process", label: "Процесс" },
  { href: "/about", label: "О компании" },
  { href: "/blog", label: "Блог" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        scrolled ? "glass py-3 shadow-sm" : "bg-transparent py-5"
      )}
    >
      <div className="container-narrow flex items-center justify-between px-5 md:px-10 lg:px-16">
        <Link
          href="/"
          className="max-w-[11rem] leading-tight sm:max-w-none sm:text-left"
          aria-label={`${brand.name} — на главную`}
        >
          <span className="block text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted sm:text-xs">
            {brand.logoLine1}
          </span>
          <span className="font-display text-base tracking-tight text-foreground sm:text-xl md:text-2xl">
            {brand.logoLine2}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Основная навигация">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm transition-colors hover:text-wood",
                pathname.startsWith(item.href) ? "text-foreground" : "text-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <MagneticButton>
            <Button asChild variant="outline" size="sm">
              <Link href="/planirovka">Планировщик</Link>
            </Button>
          </MagneticButton>
          <MagneticButton>
            <Button asChild size="sm">
              <Link href="/#lead">{cta.preliminaryEstimate}</Link>
            </Button>
          </MagneticButton>
        </div>

        <button
          type="button"
          className="lg:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="glass border-t border-graphite/10 px-5 py-6 lg:hidden">
          <nav className="flex flex-col gap-4" aria-label="Мобильная навигация">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="text-lg">
                {item.label}
              </Link>
            ))}
            <Button asChild className="mt-4 w-full">
              <Link href="/#lead">{cta.preliminaryEstimate}</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
