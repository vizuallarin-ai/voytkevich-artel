import type { ImageGenerationRequest } from "@/types/image-generation";
import { visualStyleGuide } from "@/data/visual-style-guide";
import { brandCharacter } from "@/data/brand-character";
import { imageSafetyRules } from "@/data/image-safety-rules";
import { getVisualTemplate } from "@/data/visual-template-registry";

const ILLUSTRATION_NOTICE =
  "Изображение не должно выглядеть как реальный построенный объект компании.";

export function buildImagePrompt(request: ImageGenerationRequest): string {
  switch (request.mode) {
    case "content-cover":
      return buildContentCoverPrompt(request);
    case "technical-diagram":
      return buildTechnicalDiagramPrompt(request);
    case "editorial-illustration":
      return buildEditorialIllustrationPrompt(request);
    case "social-teaser":
      return buildSocialTeaserPrompt(request);
    case "brand-character-scene":
      return buildBrandCharacterScenePrompt(request);
    case "og-image":
      return buildOGImagePrompt(request);
    case "favicon":
      return buildFaviconPrompt(request);
    default:
      return buildContentCoverPrompt(request);
  }
}

export function buildContentCoverPrompt(request: ImageGenerationRequest): string {
  const { topic, additionalContext, aspectRatio } = request.input;
  const template = request.input.templateId ? getVisualTemplate(request.input.templateId) : null;
  return [
    `Создай современную редакционную иллюстрацию-обложку для материала: «${topic}».`,
    additionalContext ? `Контекст: ${additionalContext}.` : "",
    visualStyleGuide.promptStyleSuffix,
    `Композиция: крупный объект, чистые края, высокий контраст, простые формы.`,
    template ? `Шаблон: ${template.title}. Правила: ${template.visualRules.join("; ")}.` : "",
    `Формат обложки ${aspectRatio}.`,
    "Без текста внутри изображения — текст будет наложен программно.",
    request.constraints.avoidRealObjectMisrepresentation ? ILLUSTRATION_NOTICE : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildTechnicalDiagramPrompt(request: ImageGenerationRequest): string {
  const { topic, additionalContext, aspectRatio } = request.input;
  return [
    `Создай упрощённую редакционную схему/иллюстрацию для технической статьи: «${topic}».`,
    additionalContext ? `Контекст: ${additionalContext}.` : "",
    "Стиль: чистая строительная иллюстрация, без точных инженерных чертежей и опасных инструкций.",
    "Композиция: слои, участок, конструктивные элементы в упрощённом виде.",
    visualStyleGuide.promptStyleSuffix,
    `Формат ${aspectRatio}.`,
    "Без текста и подписей внутри изображения.",
    ILLUSTRATION_NOTICE,
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildEditorialIllustrationPrompt(request: ImageGenerationRequest): string {
  const { topic, additionalContext, aspectRatio } = request.input;
  return [
    `Создай редакционную иллюстрацию для истории/статьи: «${topic}».`,
    additionalContext ? `Контекст: ${additionalContext}.` : "",
    "Тема: загородная жизнь, строительство, Иркутская область — без фотореализма реального кейса.",
    visualStyleGuide.promptStyleSuffix,
    `Формат ${aspectRatio}.`,
    "Без текста внутри изображения.",
    ILLUSTRATION_NOTICE,
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildSocialTeaserPrompt(request: ImageGenerationRequest): string {
  const { topic, aspectRatio } = request.input;
  return [
    `Создай визуал для teaser-публикации в соцсетях: «${topic}».`,
    "Композиция: один главный объект, читаемость в маленьком размере, минимум деталей.",
    visualStyleGuide.promptStyleSuffix,
    `Формат ${aspectRatio}.`,
    "Без текста внутри изображения.",
    ILLUSTRATION_NOTICE,
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildBrandCharacterScenePrompt(request: ImageGenerationRequest): string {
  const { topic, aspectRatio } = request.input;
  return [
    `Создай сцену с ${brandCharacter.promptDescriptor} для темы: «${topic}».`,
    brandCharacter.disclaimer,
    visualStyleGuide.promptStyleSuffix,
    `Формат ${aspectRatio}.`,
    "Без текста внутри изображения.",
    "Персонаж — редакционный, не реальный сотрудник.",
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildOGImagePrompt(request: ImageGenerationRequest): string {
  const { topic } = request.input;
  return [
    `Создай Open Graph иллюстрацию 16:9 для: «${topic}».`,
    visualStyleGuide.promptStyleSuffix,
    "Композиция: узнаваемый объект слева, место для текста справа (текст программно).",
    "Без текста внутри изображения.",
    ILLUSTRATION_NOTICE,
  ].join(" ");
}

export function buildFaviconPrompt(request: ImageGenerationRequest): string {
  return [
    "Создай простую иконку для строительной компании малоэтажного строительства.",
    "Минималистичная форма дома или каски, узнаваемость в 32px.",
    `Палитра: ${visualStyleGuide.palette.constructionOrange}, ${visualStyleGuide.palette.charcoal}.`,
    "Без текста, без мелких деталей.",
  ].join(" ");
}

export function buildNegativePrompt(request: ImageGenerationRequest): string {
  const extra: string[] = [];
  if (!request.constraints.allowPeople) extra.push("no people, no faces");
  if (!request.constraints.allowConstructionSite) extra.push("no photorealistic construction site");
  if (!request.constraints.allowPhotorealism) extra.push("no photorealism, no fake photo");
  if (request.constraints.noReadableAIText) extra.push("no readable text, no letters");
  return [imageSafetyRules.negativePromptDefault, ...extra].join(", ");
}
