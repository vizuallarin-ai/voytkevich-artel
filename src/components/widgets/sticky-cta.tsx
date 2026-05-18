"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-graphite/10 p-3 md:hidden"
      role="region"
      aria-label="Быстрый заказ расчёта"
    >
      <Button asChild className="w-full" size="lg">
        <Link href="/#lead">Получить расчёт — бесплатно</Link>
      </Button>
    </div>
  );
}
