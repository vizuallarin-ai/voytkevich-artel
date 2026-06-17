"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { DashboardRole } from "@/lib/dashboard/roles";
import { filterNavSectionsForRole } from "@/lib/dashboard/roles";

type NavItem = {
  href: string;
  label: string;
  group?: string;
};

type NavSection = {
  title: string;
  description?: string;
  minRole: DashboardRole;
  items: NavItem[];
};

const SECTIONS: NavSection[] = [
  {
    title: "Работа с заявками",
    description: "Для менеджера",
    minRole: "manager",
    items: [
      { href: "/dashboard", label: "Обзор" },
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
    description: "Воронка и KPI",
    minRole: "admin",
    items: [{ href: "/dashboard/analytics", label: "Воронка и KPI" }],
  },
  {
    title: "Контент",
    description: "Техническая база знаний",
    minRole: "admin",
    items: [{ href: "/dashboard/content/technical", label: "Технические статьи" }],
  },
  {
    title: "SEO",
    description: "Таксономия и очередь публикаций",
    minRole: "admin",
    items: [
      { href: "/dashboard/seo", label: "Обзор SEO" },
      { href: "/dashboard/seo/roadmap", label: "Очередь публикаций" },
      { href: "/dashboard/seo/taxonomy", label: "Таксономия" },
      { href: "/dashboard/seo/taxonomy/matrix", label: "Матрица URL" },
      { href: "/dashboard/seo/templates", label: "Шаблоны страниц" },
    ],
  },
];

function itemHref(item: NavItem): string {
  if (item.group) return `${item.href}?group=${item.group}`;
  return item.href;
}

function isActive(pathname: string, group: string | null, item: NavItem): boolean {
  if (item.href === "/dashboard") return pathname === "/dashboard";
  if (item.href === "/dashboard/analytics") return pathname.startsWith("/dashboard/analytics");
  if (item.href === "/dashboard/content/technical") {
    return pathname.startsWith("/dashboard/content/technical");
  }
  if (item.href === "/dashboard/seo/roadmap") return pathname.startsWith("/dashboard/seo/roadmap");
  if (item.href === "/dashboard/seo/taxonomy/matrix") {
    return pathname.startsWith("/dashboard/seo/taxonomy/matrix");
  }
  if (item.href === "/dashboard/seo/templates") {
    return pathname.startsWith("/dashboard/seo/templates");
  }
  if (item.href === "/dashboard/seo/taxonomy") return pathname === "/dashboard/seo/taxonomy";
  if (item.href === "/dashboard/seo") return pathname === "/dashboard/seo";
  if (item.href === "/dashboard/leads") {
    if (pathname.startsWith("/dashboard/leads/")) return !item.group;
    if (!pathname.startsWith("/dashboard/leads")) return false;
    if (item.group) return group === item.group;
    return !group;
  }
  return pathname.startsWith(item.href);
}

export function DashboardNav({ role }: { role: DashboardRole }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const group = searchParams.get("group");
  const sections = filterNavSectionsForRole(SECTIONS, role);

  return (
    <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:block lg:flex-1 lg:space-y-5 lg:overflow-y-auto lg:py-4">
      {sections.map((section) => (
        <div key={section.title} className="shrink-0 lg:shrink">
          <div className="mb-2 hidden px-3 lg:block">
            <p className="label-caps text-[10px] text-muted">{section.title}</p>
            {section.description ? (
              <p className="mt-0.5 text-[11px] leading-snug text-muted/80">{section.description}</p>
            ) : null}
          </div>
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
