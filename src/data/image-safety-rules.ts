export const imageSafetyRules = {
  illustrationNotice:
    "Иллюстрация, не фотография построенного объекта.",
  brandCharacterNotice: "редакционный визуальный персонаж",
  blockers: [
    "нет прав на использование",
    "AI-изображение выглядит как реальный кейс без маркировки",
    "фейковое фото клиента",
    "фейковый документ",
    "нет alt",
    "неправильный формат",
    "изображение вводит в заблуждение",
    "текст внутри изображения нечитаемый или искажённый",
  ],
  warnings: [
    "высокий риск misleading",
    "требуется illustration notice",
    "права не подтверждены",
    "отсутствует social variant",
    "photorealism для AI-иллюстрации",
  ],
  negativePromptDefault:
    "no readable text, no fake logo text, no distorted letters, no watermarks, no fake certificates, no fake documents, no real client portrait, no misleading real construction photo, no chaotic details, no low quality, no deformed hands, no unsafe construction instructions, no exact technical blueprint, no fake review, no over-detailed clutter",
  highRiskKinds: ["real-photo"] as const,
  requiresNoticeWhen: {
    aiLooksLikeReal: true,
    canLookLikeRealObject: true,
    isNotRealObjectPhoto: true,
  },
} as const;
