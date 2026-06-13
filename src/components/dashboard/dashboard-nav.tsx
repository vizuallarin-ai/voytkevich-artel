"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  /** query param group= for leads filters */
  group?: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const SECTIONS: NavSection[] = [
  {
    title: "CRM",
    items: [{ href: "/dashboard", label: "Обзор" }],
  },
  {
    title: "Лиды",
    items: [
      { href: "/dashboard/leads", label: "Все заявки" },
      { href: "/dashboard/leads", label: "Новые", group: "new" },
      { href: "/dashboard/leads", label: "Горячие", group: "hot" },
      { href: "/dashboard/leads", label: "Срочные", group: "urgent" },
      { href: "/dashboard/leads", label: "Просроченные", group: "overdue" },
      { href: "/dashboard/leads", label: "Нужна смета", group: "estimate" },
    ],
  },
  {
    title: "Аналитика",
    items: [{ href: "/dashboard/analytics", label: "Воронка и KPI" }],
  },
];

function itemHref(item: NavItem): string {
  if (item.group) return `${item.href}?group=${item.group}`;
  return item.href;
}

function isActive(pathname: string, group: string | null, item: NavItem): boolean {
  if (item.href === "/dashboard") {
    return pathname === "/dashboard";
  }
  if (item.href === "/dashboard/analytics") {
    return pathname.startsWith("/dashboard/analytics");
  }
  if (item.href === "/dashboard/leads") {
    if (pathname.startsWith("/dashboard/leads/")) {
      return !item.group;
    }
    if (!pathname.startsWith("/dashboard/leads")) return false;
    if (item.group) return group === item.group;
    return !group;
  }
  return pathname.startsWith(item.href);
}

export function DashboardNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const group = searchParams.get("group");

  return (
    <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:block lg:flex-1 lg:space-y-6 lg:overflow-y-auto lg:py-4">
      {SECTIONS.map((section) => (
        <div key={section.title} className="shrink-0 lg:shrink">
          <p className="label-caps mb-2 hidden px-3 text-[10px] text-muted lg:block">{section.title}</p>
          <ul className="flex gap-1 lg:block lg:space-y-0.5">
            {section.items.map((item) => {
              const active = isActive(pathname, group, item);
              const href = itemHref(item);
              return (
                <li key={`${item.label}-${item.group ?? "all"}`}>
                  <Link
                    href={href}
                    className={cn(
                      "block whitespace-nowrap rounded-sm px-3 py-2 text-sm transition lg:whitespace-normal",
                      active
                        ? "bg-graphite font-medium text-background"
                        : "text-muted hover:bg-background hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
