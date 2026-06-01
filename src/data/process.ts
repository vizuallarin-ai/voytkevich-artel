import { photos, unsplash } from "@/data/images";

const step = (id: string) => unsplash(id, { w: 800, h: 600 });

export const buildProcessSteps = [
  {
    id: "design",
    title: "Проектирование",
    duration: "3–4 недели",
    description:
      "Эскиз, BIM-модель, привязка к участку, согласование планировок и визуализаций.",
    image: step(photos.architecture),
  },
  {
    id: "foundation",
    title: "Фундамент",
    duration: "2–4 недели",
    description: "Геология, земляные работы, монолит или сваи — по результатам изысканий.",
    image: step(photos.construction),
  },
  {
    id: "shell",
    title: "Коробка",
    duration: "6–10 недель",
    description: "Стены, перекрытия, армопояс, энергоэффективный контур.",
    image: step(photos.construction),
  },
  {
    id: "roof",
    title: "Кровля",
    duration: "2–3 недели",
    description: "Стропильная система, гидроизоляция, утепление, финишное покрытие.",
    image: step(photos.houseModern),
  },
  {
    id: "engineering",
    title: "Инженерия",
    duration: "3–5 недель",
    description: "Электрика, отопление, водоснабжение, канализация, вентиляция.",
    image: step(photos.engineering),
  },
  {
    id: "finish",
    title: "Отделка",
    duration: "8–12 недель",
    description: "Чистовая отделка, сантехника, свет, фасад, благоустройство.",
    image: step(photos.interior),
  },
  {
    id: "handover",
    title: "Сдача объекта",
    duration: "1 неделя",
    description: "Приёмка по чек-листу, акт, гарантийный пакет, инструкции по эксплуатации.",
    image: step(photos.houseVilla),
  },
];
