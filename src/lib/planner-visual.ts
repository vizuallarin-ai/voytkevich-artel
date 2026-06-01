export const plannerLegend = [
  { kind: "living", label: "Общие зоны" },
  { kind: "bed", label: "Спальни" },
  { kind: "bath", label: "Санузлы" },
  { kind: "service", label: "Гараж / терраса" },
] as const;

export function roomKind(id: string) {
  if (id === "kitchen" || id === "living") return "living";
  if (id.startsWith("bed")) return "bed";
  if (id.startsWith("bath") || id === "hall" || id.startsWith("hall")) return "bath";
  if (id === "garage" || id === "terrace") return "service";
  if (id === "stairs") return "stairs";
  return "living";
}

export function roomFill(kind: ReturnType<typeof roomKind>, active: boolean, dragging = false) {
  const base = {
    living: active || dragging
      ? "fill-wood/50 stroke-wood"
      : "fill-wood/20 stroke-wood/40",
    bed: active || dragging
      ? "fill-graphite/25 stroke-graphite"
      : "fill-background stroke-graphite/35",
    bath: active || dragging
      ? "fill-sky-200/80 stroke-sky-600"
      : "fill-sky-100/60 stroke-sky-500/40",
    service: active || dragging
      ? "fill-stone-300/80 stroke-stone-600"
      : "fill-stone-200/50 stroke-stone-500/35",
    stairs: "fill-sand stroke-graphite/30",
  };
  return base[kind];
}

export function legendSwatch(kind: (typeof plannerLegend)[number]["kind"]) {
  const map = {
    living: "border-wood/40 bg-wood/25",
    bed: "border-graphite/30 bg-background",
    bath: "border-sky-500/40 bg-sky-100/70",
    service: "border-stone-500/35 bg-stone-200/60",
  };
  return map[kind];
}

export function rectCenter(x: number, y: number, w: number, h: number) {
  return { x: x + w / 2, y: y + h / 2, w, h };
}

export function shortRoomName(name: string) {
  return name
    .replace("Спальня ", "Сп. ")
    .replace("Санузел ", "С/у ")
    .replace("Кухня-гостиная", "Кухня-гост.");
}
