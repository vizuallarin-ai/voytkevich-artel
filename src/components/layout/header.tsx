"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { brand } from "@/data/brand";
import { siteNavGroups } from "@/data/site-nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/animations/magnetic-button";
import { cta } from "@/data/copy";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const open = menuPath !== null && menuPath === pathname;

  const setOpen = useCallback(
    (next: boolean) => {
      setMenuPath(next ? pathname : null);
      if (!next) setOpenGroup(null);
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

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

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

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Основная навигация">
          {siteNavGroups.map((group) => (
            <div key={group.id} className="group relative">
              <button
                type="button"
                className={cn(
                  "flex items-center gap-1 rounded-sm px-3 py-2 text-sm transition hover:bg-muted-bg/80 hover:text-foreground",
                  group.items.some((i) => isActive(i.href)) ? "text-foreground" : "text-muted",
                )}
                aria-haspopup="true"
              >
                {group.label}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden />
              </button>
              <div className="invisible absolute left-0 top-full z-50 min-w-[15rem] pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="rounded-sm border border-graphite/10 bg-background p-2 shadow-lg">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "block rounded-sm px-3 py-2 transition hover:bg-muted-bg",
                        isActive(item.href) ? "text-foreground" : "text-muted",
                      )}
                    >
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.description ? (
                        <span className="mt-0.5 block text-xs text-muted">{item.description}</span>
                      ) : null}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
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
          <div className="relative z-50 glass max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-graphite/10 px-5 py-4 lg:hidden">
            <nav className="flex flex-col gap-4" aria-label="Мобильная навигация">
              {siteNavGroups.map((group) => (
                <div key={group.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-2 text-left text-xs font-medium uppercase tracking-wider text-muted"
                    onClick={() => setOpenGroup(openGroup === group.id ? null : group.id)}
                    aria-expanded={openGroup === group.id}
                  >
                    {group.label}
                    <ChevronDown
                      className={cn("h-4 w-4 transition", openGroup === group.id && "rotate-180")}
                      aria-hidden
                    />
                  </button>
                  {openGroup === group.id ? (
                    <div className="mt-1 flex flex-col gap-0.5 border-l border-graphite/10 pl-3">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="rounded-sm py-2.5 text-base transition hover:text-wood"
                          onClick={() => setOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              <a
                href={`tel:${brand.phone}`}
                className="flex items-center gap-2 border-t border-graphite/10 pt-4 text-base text-muted"
                onClick={() => setOpen(false)}
              >
                <Phone className="h-5 w-5" aria-hidden />
                {brand.phoneDisplay}
              </a>
              <Button asChild className="w-full" size="lg">
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
