export const brandCharacter = {
  id: "stroistroy-master",
  name: "СтройСтрой Мастер",
  type: "editorial-visual-character" as const,
  isFictional: true,
  publicLabel: "редакционный визуальный персонаж",
  description:
    "Собирательный образ спокойного, опытного специалиста, который объясняет строительство простым языком и помогает разобраться в проекте, участке, смете и этапах работ.",
  visualTraits: [
    "аккуратная рабочая одежда",
    "строительная каска или жилет без избыточной детализации",
    "дружелюбная, но профессиональная подача",
    "без сходства с конкретным реальным человеком",
    "стилизованная редакционная иллюстрация",
  ],
  usageAllowedFor: [
    "technical-explainers",
    "editorial-stories",
    "social-teasers",
    "checklists",
    "faq-visuals",
  ],
  usageForbiddenFor: [
    "real-case-photo",
    "client-review",
    "official-document",
    "real-team-member",
  ],
  disclaimer:
    "СтройСтрой Мастер — редакционный визуальный персонаж, а не фотография реального сотрудника или клиента.",
  promptDescriptor:
    "редакционный визуальный персонаж — спокойный опытный строитель в аккуратной рабочей одежде, стилизованная иллюстрация без сходства с реальным человеком",
} as const;

export type BrandCharacterId = typeof brandCharacter.id;
