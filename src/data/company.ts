import type { BuiltHome, Partner, TeamMember } from "@/types";
import { photos, unsplash } from "@/data/images";

export const companyStats = [
  { value: 127, suffix: "", label: "домов построено", decimals: 0 },
  { value: 98, suffix: "%", label: "объектов сданы в срок", decimals: 0 },
  { value: 4.9, suffix: "", label: "рейтинг клиентов", decimals: 1 },
  { value: 5, suffix: " лет", label: "гарантия на конструктив", decimals: 0 },
];

export const timeline = [
  { year: 2014, title: "Основание", description: "Старт как архитектурно-строительная студия в Иркутске" },
  { year: 2017, title: "Собственное производство", description: "Цех деревянных конструкций и СИП-панелей" },
  { year: 2020, title: "100-й дом", description: "Сотый объект сдан с актом и гарантией 5 лет" },
  { year: 2023, title: "BIM-проектирование", description: "Полный цифровой цикл от эскиза до сдачи" },
  { year: 2026, title: "Премиум-линейка", description: "Запуск флагманской линейки резиденций артели" },
];

export const team: TeamMember[] = [
  {
    name: "Руководитель проекта",
    role: "Ведёт объект от сметы до сдачи, согласует этапы и сроки",
    image: unsplash(photos.teamFounder, { w: 400, h: 500 }),
  },
  {
    name: "Архитектор",
    role: "Адаптирует проект под участок, планировку и бюджет",
    image: unsplash(photos.teamBuild, { w: 400, h: 500 }),
  },
  {
    name: "Инженер",
    role: "Проектирует фундамент, инженерные системы и узлы",
    image: unsplash(photos.teamEngineer, { w: 400, h: 500 }),
  },
  {
    name: "Прораб",
    role: "Контролирует качество работ и поставки материалов на объекте",
    image: unsplash(photos.teamSupport, { w: 400, h: 500 }),
  },
  {
    name: "Специалист по комплектации",
    role: "Подбирает материалы и отделку под смету и пожелания",
    image: unsplash(photos.teamBuild, { w: 400, h: 500 }),
  },
];

export const partners: Partner[] = [
  { name: "Knauf", logo: "https://placehold.co/120x40/f5f3f0/1a1a1a?text=KNAUF" },
  { name: "Rockwool", logo: "https://placehold.co/120x40/f5f3f0/1a1a1a?text=ROCKWOOL" },
  { name: "Velux", logo: "https://placehold.co/120x40/f5f3f0/1a1a1a?text=VELUX" },
  { name: "Rehau", logo: "https://placehold.co/120x40/f5f3f0/1a1a1a?text=REHAU" },
];

export const builtHomes: BuiltHome[] = [
  { id: "1", name: "Дом «Север»", lat: 52.28, lng: 104.28, year: 2025, area: 186, image: unsplash(photos.houseModern, { w: 600, h: 400 }) },
  { id: "2", name: "Резиденция «Байкал»", lat: 52.35, lng: 104.15, year: 2024, area: 240, image: unsplash(photos.houseVilla, { w: 600, h: 400 }) },
  { id: "3", name: "Вилла «Песок»", lat: 52.22, lng: 104.35, year: 2024, area: 165, image: unsplash(photos.houseVilla, { w: 600, h: 400 }) },
  { id: "4", name: "Дом «Графит»", lat: 52.31, lng: 104.22, year: 2023, area: 142, image: unsplash(photos.houseBright, { w: 600, h: 400 }) },
  { id: "5", name: "Шале «Лес»", lat: 52.18, lng: 104.42, year: 2023, area: 198, image: unsplash(photos.houseChalet, { w: 600, h: 400 }) },
];

export const licenses = [
  "СРО на проектирование и строительство",
  "Лицензия на инженерные изыскания",
  "Сертификат ISO 9001:2015",
];
