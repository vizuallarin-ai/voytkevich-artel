export const plannerHero = {
  h1: "Планировка дома за 5 минут",
  intro:
    "Сценарий, площадь, комнаты — получите схему для разговора с проектировщиком. Не рабочий проект.",
  micro: "Точная планировка — после участка, семьи и норм проектирования.",
  quickFacts: [
    "Сценарий жизни",
    "Состав помещений",
    "Площадь и расхождение",
    "Похожие проекты",
    "Отправка специалисту",
  ],
} as const;

export const plannerSteps = [
  { id: 1, label: "Сценарий" },
  { id: 2, label: "Дом и участок" },
  { id: 3, label: "Комнаты" },
  { id: 4, label: "Сводка" },
  { id: 5, label: "Действие" },
] as const;

export const plannerFaq = [
  {
    id: "arch",
    question: "Это готовая планировка?",
    answer:
      "Нет. Собираем вводные: сценарий, площадь, комнаты. Архитектурный проект — отдельно, после участка и норм.",
  },
  {
    id: "build",
    question: "Можно сразу строить?",
    answer: "Нет. Нужны проект, конструктив, смета и привязка к участку.",
  },
  {
    id: "why",
    question: "Зачем планировщик?",
    answer:
      "Понять, какие помещения нужны, какая площадь и что обсудить до проектирования.",
  },
  {
    id: "delta",
    question: "Почему площадь не сходится?",
    answer:
      "Целевая площадь — ориентир. Фактическая зависит от коридоров, санузлов, лестницы, террасы.",
  },
  {
    id: "send",
    question: "Отправить специалисту?",
    answer: "Да. Увидит сценарий, комнаты и площадь — предложит проект или правки.",
  },
  {
    id: "calc",
    question: "Рассчитать стоимость?",
    answer: "Да, параметры передаются в калькулятор — получите ориентир по бюджету.",
  },
  {
    id: "area-vs-plan",
    question: "Что важнее: площадь или планировка?",
    answer:
      "Оба. Меньший дом с грамотной планировкой часто удобнее большого с лишними коридорами.",
  },
] as const;

export const plannerSeo = {
  h2: "Планировка дома в Иркутске",
  paragraphs: [
    "Соберите вводные до выбора проекта: помещения, площадь, сценарий жизни. Учитываем участок, коммуникации и фундамент.",
    "Отправьте результат специалисту — быстрее подберём проект из каталога или начнём адаптацию.",
  ],
} as const;

export const ROOM_TYPE_GROUPS = {
  living: ["bedroom", "children_room", "master_bedroom", "guest_room", "office", "living", "kitchen_living"] as const,
  sanitary: ["bathroom", "guest_bathroom"] as const,
  technical: ["boiler_room", "laundry", "pantry", "wardrobe", "tech_room"] as const,
  passage: ["hallway", "hall", "corridor", "stairs", "vestibule"] as const,
  additional: ["terrace", "garage", "canopy", "sauna", "workshop"] as const,
};

export const ZONE_LABELS = {
  living: "Жилая зона",
  sanitary: "Санузлы",
  technical: "Техническая зона",
  passage: "Проходные зоны",
  additional: "Наружные зоны",
} as const;
