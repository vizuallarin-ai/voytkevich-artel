import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { brand } from "@/data/brand";

const links = {
  catalog: [
    { href: "/catalog", label: "Все проекты" },
    { href: "/catalog?priceMax=10000000", label: "До 10 млн" },
    { href: "/catalog?floors=2", label: "Двухэтажные" },
  ],
  company: [
    { href: "/about", label: "О компании" },
    { href: "/process", label: "Процесс" },
    { href: "/cases", label: "Кейсы" },
    { href: "/calculator", label: "Калькулятор" },
    { href: "/planirovka", label: "Схема планировки" },
  ],
  seo: [
    { href: "/blog", label: "Блог" },
    { href: "/faq", label: "FAQ" },
    { href: "/blog/stoimost-stroitelstva-2026", label: "Цены 2026" },
    { href: "/privacy", label: "Конфиденциальность" },
  ],
  categories: [
    { href: "/catalog/kategoriya/odnoetazhnye", label: "Одноэтажные" },
    { href: "/catalog/kategoriya/dvukhetazhnye", label: "Двухэтажные" },
    { href: "/catalog/kategoriya/iz-brusa", label: "Из бруса" },
    { href: "/catalog/kategoriya/karkasnye", label: "Каркасные" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-graphite/10 bg-graphite text-background">
      <div className="container-narrow section-padding !py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <p className="font-display text-xl leading-snug">{brand.name}</p>
            <p className="mt-4 text-sm text-background/70">
              {brand.tagline}. {brand.officeHours}
            </p>
            <ul className="mt-6 space-y-3 text-sm text-background/80">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" aria-hidden />
                <a href={`tel:${brand.phone}`}>{brand.phoneDisplay}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" aria-hidden />
                <a href={`mailto:${brand.email}`}>{brand.email}</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                <span>{brand.address}</span>
              </li>
            </ul>
          </div>
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <p className="label-caps text-background/50">
                {title === "catalog"
                  ? "Каталог"
                  : title === "company"
                    ? "Компания"
                    : title === "categories"
                      ? "Категории"
                      : "Полезное"}
              </p>
              <ul className="mt-4 space-y-2">
                {items.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-background/80 hover:text-background">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-background/10 pt-8 text-xs text-background/50 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} {brand.name}. Все права защищены.</p>
          <p>Строительство домов в Иркутске · ИЖС · Ипотека</p>
        </div>
      </div>
    </footer>
  );
}
