"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function GlobalSearchTrigger({ className }: Props) {
  return (
    <Link
      href="/search"
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-sm text-muted transition hover:bg-muted-bg/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
      aria-label="Поиск по сайту"
    >
      <Search className="h-5 w-5" aria-hidden />
    </Link>
  );
}
