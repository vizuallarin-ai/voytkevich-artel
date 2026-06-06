import type { CaseItem } from "@/types/case";

/**
 * Внутренние заготовки — status needs-data / draft.
 * НЕ публиковать как реальные построенные дома без подтверждения данных и фото.
 */
export const caseDrafts: CaseItem[] = [
  {
    id: "draft-template",
    slug: "shablon-kejsa",
    title: "Шаблон кейса (внутренний)",
    h1: "Шаблон кейса для заполнения",
    excerpt: "Внутренняя заготовка. Не является публичным кейсом построенного дома.",
    status: "draft",
    house: {},
    clientTask: {
      title: "Задача клиента",
      description: "Требуется заполнить реальную задачу клиента после согласования публикации.",
    },
    seoTitle: "Шаблон кейса (черновик)",
    seoDescription: "Внутренняя заготовка — не для индексации.",
    editorNote: "Использовать как основу при сборе данных по анкете из stage-11 docs.",
    leadCTA: { label: "Хочу похожий дом" },
  },
  {
    id: "draft-barnhaus-utulik",
    slug: "barnhaus-100-utulik-needs-data",
    title: "Барнхаус 100 м² — п. Утулик (требуются данные)",
    h1: "Барнхаус 100 м² — подготовка кейса",
    excerpt:
      "Заготовка под будущий кейс. Есть отзыв и проект в каталоге — нужны фото этапов, согласование клиента и детали сметы.",
    status: "needs-data",
    location: {
      settlement: "п. Утулик",
      region: "Иркутская область",
      showExactLocation: false,
      displayLabel: "Иркутская область, п. Утулик",
    },
    project: {
      projectSlug: "barnhaus-100-m2-v-p-utulik",
      projectTitle: "Барнхаус 100 м²",
      customProject: false,
    },
    house: {
      area: 100,
      floors: 1,
      material: "каркас",
      purpose: ["семья"],
      workFormat: "под ключ",
    },
    timeline: { year: 2024 },
    budget: {
      showBudget: false,
      note: "Бюджет не раскрывается без согласования с клиентом.",
    },
    clientTask: {
      title: "Дом для семьи с удалённым контролем",
      description:
        "Требуется уточнить и подтвердить формулировку задачи с клиентом перед публикацией. Отзыв в testimonials — черновик для согласования.",
    },
    initialInputs: {
      land: "Участок в п. Утулик — детали и ограничения уточняются.",
      constraints: ["Требуется подтверждение: можно ли публиковать локацию и фото"],
    },
    challenges: [],
    stages: [],
    testimonial: {
      text: "Строили дом, пока мы были в другом городе. Каждые три дня — фотоотчёт, смета не менялась после договора. Сдали в срок, приняли без сюрпризов.",
      authorName: "Сергей и Ольга К.",
      authorLabel: "заказчики",
      verified: false,
    },
    tags: ["для семьи", "удалённый контроль"],
    taskTags: ["udalennoe-stroitelstvo", "pod-klyuch"],
    relatedProjectSlugs: ["barnhaus-100-m2-v-p-utulik"],
    relatedServiceSlugs: ["stroitelstvo-domov-v-irkutskoy-oblasti", "karkasnye-doma-pod-klyuch"],
    relatedBlogSlugs: ["kak-kontrolirovat-stroitelstvo-doma-udalenno"],
    seoTitle: "Барнхаус 100 м² — кейс (требуются данные)",
    seoDescription: "Заготовка кейса — не для публичной индексации.",
    editorNote:
      "TODO: фото этапов, согласование отзыва (verified), challenges, stages с реальными датами. Не публиковать без verified testimonial и gallery.",
    leadCTA: {
      label: "Хочу похожий дом",
      description: "Обсудим участок и проект после публикации кейса.",
    },
  },
];
