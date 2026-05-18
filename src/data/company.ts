import type { BuiltHome, Partner, TeamMember } from "@/types";

export const companyStats = [
  { value: 12, suffix: "+", label: "лет на рынке" },
  { value: 127, suffix: "", label: "домов сдано" },
  { value: 98, suffix: "%", label: "сдача в срок" },
  { value: 4.9, suffix: "", label: "рейтинг клиентов" },
];

export const timeline = [
  { year: 2014, title: "Основание", description: "Старт как архитектурно-строительная студия в Иркутске" },
  { year: 2017, title: "Собственное производство", description: "Цех деревянных конструкций и СИП-панелей" },
  { year: 2020, title: "100-й дом", description: "Сотый объект сдан с актом и гарантией 5 лет" },
  { year: 2023, title: "BIM-проектирование", description: "Полный цифровой цикл от эскиза до сдачи" },
  { year: 2026, title: "Премиум-линейка", description: "Запуск коллекции NordHaus Signature" },
];

export const team: TeamMember[] = [
  { name: "Алексей Воронов", role: "Основатель, главный архитектор", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop" },
  { name: "Мария Соколова", role: "Руководитель строительства", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop" },
  { name: "Дмитрий Козлов", role: "Инженер-проектировщик", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop" },
  { name: "Елена Петрова", role: "Клиентский сервис", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop" },
];

export const partners: Partner[] = [
  { name: "Knauf", logo: "https://placehold.co/120x40/f5f3f0/1a1a1a?text=KNAUF" },
  { name: "Rockwool", logo: "https://placehold.co/120x40/f5f3f0/1a1a1a?text=ROCKWOOL" },
  { name: "Velux", logo: "https://placehold.co/120x40/f5f3f0/1a1a1a?text=VELUX" },
  { name: "Rehau", logo: "https://placehold.co/120x40/f5f3f0/1a1a1a?text=REHAU" },
];

export const builtHomes: BuiltHome[] = [
  { id: "1", name: "Дом «Север»", lat: 52.28, lng: 104.28, year: 2025, area: 186, image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop" },
  { id: "2", name: "Резиденция «Байкал»", lat: 52.35, lng: 104.15, year: 2024, area: 240, image: "https://images.unsplash.com/photo-1600585154340-be6162a9af0f?w=600&h=400&fit=crop" },
  { id: "3", name: "Вилла «Песок»", lat: 52.22, lng: 104.35, year: 2024, area: 165, image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop" },
  { id: "4", name: "Дом «Графит»", lat: 52.31, lng: 104.22, year: 2023, area: 142, image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop" },
  { id: "5", name: "Шале «Лес»", lat: 52.18, lng: 104.42, year: 2023, area: 198, image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&h=400&fit=crop" },
];

export const guarantees = [
  "Фиксированная смета в договоре — без скрытых доплат",
  "Гарантия на конструктив 5 лет, на отделку 2 года",
  "Фотоотчёт с объекта каждые 3 дня",
  "Страхование ответственности подрядчика",
];

export const licenses = [
  "СРО на проектирование и строительство",
  "Лицензия на инженерные изыскания",
  "Сертификат ISO 9001:2015",
];
