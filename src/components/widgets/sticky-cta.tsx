"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Calculator, MessageCircle, Phone, Send } from "lucide-react";
import { brand } from "@/data/brand";
import { cta } from "@/data/copy";
import { cn } from "@/lib/utils";
import {
  trackPhoneClicked,
  trackStickyCtaClicked,
  trackTelegramClicked,
  trackWhatsappClicked,
} from "@/lib/analytics/cta-tracking";

function resolveThirdAction(pathname: string): { href: string; label: string; action: string } {
  const projectMatch = pathname.match(/^\/catalog\/([^/]+)$/);
  if (projectMatch && projectMatch[1] !== "kategoriya") {
    return { href: "#project-lead", label: "Расчёт", action: "project_estimate" };
  }
  if (pathname.startsWith("/calculator")) {
    return { href: "#calculator-lead", label: "Заявка", action: "calculator_lead" };
  }
  if (pathname.startsWith("/planirovka")) {
    return { href: "#planner-lead", label: "Разбор", action: "planner_lead" };
  }
  if (pathname === "/" || pathname.startsWith("/#")) {
    return { href: "/#lead", label: "Рассчитать", action: "home_lead" };
  }
  return { href: "/calculator", label: "Рассчитать", action: "calculator" };
}

export function StickyCta() {
  const pathname = usePathname() ?? "/";
  const [visible, setVisible] = useState(false);
  const third = useMemo(() => resolveThirdAction(pathname), [pathname]);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  // На планировщике — своя нижняя панель; на каталоге при сравнении — compare-bar
  if (pathname.startsWith("/planirovka")) return null;

  const waHref = `https://wa.me/${brand.phoneMobile.replace(/\D/g, "")}`;
  const tgHref = brand.telegram;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t border-graphite/10 bg-background/95 backdrop-blur-md md:hidden",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
      )}
      role="region"
      aria-label="Быстрые контакты"
    >
      <div className="grid grid-cols-4 divide-x divide-graphite/10">
        <a
          href={`tel:${brand.phone}`}
          className="flex min-h-11 flex-col items-center justify-center gap-1 px-1 py-3 text-xs font-medium transition hover:bg-muted-bg/80 sm:text-sm"
          onClick={() => {
            trackPhoneClicked("sticky_bar");
            trackStickyCtaClicked("phone", { pageType: pathname });
          }}
        >
          <Phone className="h-5 w-5" aria-hidden />
          Позвонить
        </a>
        <a
          href={tgHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 flex-col items-center justify-center gap-1 px-1 py-3 text-xs font-medium transition hover:bg-muted-bg/80 sm:text-sm"
          onClick={() => {
            trackTelegramClicked("sticky_bar");
            trackStickyCtaClicked("telegram", { pageType: pathname });
          }}
        >
          <Send className="h-5 w-5" aria-hidden />
          Telegram
        </a>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 flex-col items-center justify-center gap-1 px-1 py-3 text-xs font-medium transition hover:bg-muted-bg/80 sm:text-sm"
          onClick={() => {
            trackWhatsappClicked("sticky_bar");
            trackStickyCtaClicked("whatsapp", { pageType: pathname });
          }}
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          WhatsApp
        </a>
        <Link
          href={third.href}
          className="flex min-h-11 flex-col items-center justify-center gap-1 px-1 py-3 text-xs font-medium transition hover:bg-muted-bg/80 sm:text-sm"
          onClick={() =>
            trackStickyCtaClicked(third.action, {
              pageType: pathname,
              ctaLabel: third.label,
            })
          }
        >
          <Calculator className="h-5 w-5" aria-hidden />
          {third.label}
        </Link>
      </div>
      <p className="sr-only">{cta.preliminaryEstimate}</p>
    </div>
  );
}
