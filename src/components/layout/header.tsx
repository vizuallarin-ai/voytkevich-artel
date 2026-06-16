"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { brand } from "@/data/brand";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/animations/magnetic-button";
import { cta } from "@/data/copy";

const nav = [
  { href: "/catalog", label: "Каталог" },
  { href: "/calculator", label: "Калькулятор" },
  { href: "/planirovka", label: "Планировщик" },
  { href: "/process", label: "Процесс" },
  { href: "/about", label: "О компании" },
  { href: "/blog", label: "Блог" },
  { href: "/cases", label: "Кейсы" },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuPath, setMenuPath] = useState<string | null>(null);

  const open = menuPath !== null && menuPath === pathname;

  const setOpen = useCallback(
    (next: boolean) => {
      setMenuPath(next ? pathname : null);
    },
    [pathname],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        scrolled || open ? "glass py-3 shadow-sm" : "bg-transparent py-4",
      )}
    >
      <div className="container-narrow flex items-center justify-between gap-3 px-5 md:px-10 lg:px-16">
        <Link
          href="/"
          className="min-w-0 flex-1 leading-tight sm:flex-none"
          aria-label={`${brand.name} — на главную`}
        >
          <span className="block text-[0.7rem] font-medium uppercase tracking-[0.1em] text-muted sm:text-xs">
            {brand.logoLine1}
          </span>
          <span className="font-display text-lg tracking-tight text-foreground sm:text-xl md:text-2xl">
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
                pathname.startsWith(item.href) ? "text-foreground" : "text-muted",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`tel:${brand.phone}`}
            className="hidden items-center gap-1.5 text-sm text-muted transition hover:text-foreground xl:flex"
          >
            <Phone className="h-4 w-4" aria-hidden />
            {brand.phoneDisplay}
          </a>
          <MagneticButton>
            <Button asChild size="sm">
              <Link href="/#lead">{cta.preliminaryEstimate}</Link>
            </Button>
          </MagneticButton>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm lg:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Закрыть меню" : "Открыть меню"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-[4.5rem] z-40 bg-graphite/20 lg:hidden"
            aria-label="Закрыть меню"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-50 glass max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-graphite/10 px-5 py-6 lg:hidden">
            <nav className="flex flex-col gap-1" aria-label="Мобильная навигация">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-sm px-2 py-3 text-lg transition hover:bg-muted-bg/80"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href={`tel:${brand.phone}`}
                className="mt-2 flex items-center gap-2 rounded-sm px-2 py-3 text-base text-muted"
                onClick={() => setOpen(false)}
              >
                <Phone className="h-5 w-5" aria-hidden />
                {brand.phoneDisplay}
              </a>
              <Button asChild className="mt-4 w-full" size="lg">
                <Link href="/#lead" onClick={() => setOpen(false)}>
                  {cta.preliminaryEstimate}
                </Link>
              </Button>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
