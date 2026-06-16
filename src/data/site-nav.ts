/** Структура навигации сайта */

export type NavLink = { href: string; label: string; description?: string };

export type NavGroup = {
  id: string;
  label: string;
  items: NavLink[];
};

export const siteNavGroups: NavGroup[] = [
  {
    id: "build",
    label: "Строительство",
    items: [
      { href: "/catalog", label: "Каталог проектов", description: "Готовые проекты с ценой" },
      { href: "/calculator", label: "Калькулятор", description: "Ориентир по бюджету" },
      { href: "/planirovka", label: "Планировщик", description: "Схема дома за 5 минут" },
      { href: "/cases", label: "Кейсы", description: "Реальные объекты" },
    ],
  },
  {
    id: "company",
    label: "О нас",
    items: [
      { href: "/process", label: "Как строим", description: "Этапы от заявки до сдачи" },
      { href: "/about", label: "О компании" },
      { href: "/objects-map", label: "Карта объектов" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    id: "content",
    label: "Полезное",
    items: [
      { href: "/blog", label: "Блог", description: "Смета, материалы, участок" },
    ],
  },
];

/** Плоский список для компактного меню */
export const siteNavFlat: NavLink[] = siteNavGroups.flatMap((g) => g.items);
