/** Герой главной — реальный объект артели (брусовой дом, Хомутово, megaartel.ru) */
export const heroHome = {
  src: "https://megaartel.ru/wp-content/uploads/2022/03/dsc06818-scaled.jpg",
  alt: "Брусовой загородный дом под ключ — строительная артель Александра Войткевича, Иркутск и область",
} as const;

/** Проверенные ключи Unsplash (формат photo-{key}) */
export const photos = {
  /** Деревянный / срубовый дом, зимний пейзаж */
  houseTimber: "1449844908491-882860a5cc46",
  houseModern: "1600596542815-ffad4c1539a9",
  houseVilla: "1613490493576-7fde63acd811",
  houseBright: "1600607687939-ce8a6c25118c",
  houseChalet: "1518780664697-55e3ad937233",
  construction: "1541888946425-d81bb19240f5",
  architecture: "1503387762-592deb58ef4e",
  interior: "1600210492486-724fe5c67fb0",
  engineering: "1621905251189-08b45d6a269e",
  keys: "1560518883-ce09059eeffa",
  map: "1524661135-423995f22d0b",
  teamFounder: "1560250097-0b93528c311a",
  teamBuild: "1573496359142-b8d87734a5a2",
  teamEngineer: "1472099645785-5658abf4ff4e",
  teamSupport: "1580489944761-15a19d654956",
} as const;

export function unsplash(
  id: string,
  size: { w: number; h?: number; q?: number } = { w: 1200, h: 800, q: 80 },
): string {
  const params = new URLSearchParams({
    auto: "format",
    fit: "crop",
    w: String(size.w),
    q: String(size.q ?? 80),
  });
  if (size.h) params.set("h", String(size.h));
  return `https://images.unsplash.com/photo-${id}?${params}`;
}
