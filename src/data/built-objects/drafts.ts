import type { BuiltObject } from "@/types/built-object";

/**
 * Внутренние заготовки — НЕ показывать на публичной карте без status=published
 * и подтверждённых разрешений на локацию и фото.
 */
export const builtObjectDrafts: BuiltObject[] = [
  {
    id: "draft-object-template",
    slug: "shablon-obekta-karty",
    title: "Шаблон объекта карты (внутренний)",
    status: "draft",
    objectType: "built-house",
    location: {
      locationLabel: "Зона не указана",
      showExactAddress: false,
      showExactCoordinates: false,
    },
    house: {},
    summary: "Внутренняя заготовка для заполнения по анкете stage-12.",
    allowedPublicFields: {
      location: false,
      photos: false,
      budget: false,
      timeline: false,
      caseLink: false,
    },
    editorNote: "Использовать анкету из docs/stage-12.",
  },
  {
    id: "draft-barnhaus-utulik-map",
    slug: "barnhaus-100-utulik-map-needs-data",
    title: "Барнхаус 100 м² — п. Утулик (карта, требуются данные)",
    status: "needs-data",
    objectType: "built-house",
    location: {
      region: "Иркутская область",
      settlement: "п. Утулик",
      areaSlug: "irkutskiy-rayon",
      locationLabel: "Иркутский район, п. Утулик",
      showExactAddress: false,
      showExactCoordinates: false,
      approximateCoordinates: { lat: 52.35, lng: 104.45 },
    },
    house: {
      area: 100,
      floors: 1,
      material: "каркас",
      purpose: ["семья"],
      features: ["терраса"],
    },
    timeline: { year: 2024 },
    project: {
      projectSlug: "barnhaus-100-m2-v-p-utulik",
      projectTitle: "Барнхаус 100 м²",
      customProject: false,
    },
    caseSlug: "barnhaus-100-utulik-needs-data",
    summary:
      "Заготовка объекта для карты. Связан с кейсом и проектом — нужны согласование локации, фото и разрешение на публикацию.",
    allowedPublicFields: {
      location: true,
      photos: false,
      budget: false,
      timeline: true,
      caseLink: false,
    },
    budget: {
      showBudget: false,
      note: "Бюджет не раскрывается без согласования с клиентом.",
    },
    tags: ["для семьи", "удалённый контроль"],
    editorNote:
      "Не публиковать на карте до verified разрешений. Не создавать точку из кейса автоматически.",
  },
];
