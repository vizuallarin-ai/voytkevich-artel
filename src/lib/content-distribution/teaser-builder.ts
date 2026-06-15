import type { ContentTeaserVersion, ProgrammaticSEOPage, TeaserStyle } from "@/types/programmatic-seo";
import { getExternalPlatform } from "@/data/external-content-platforms";
import { buildContentUTMUrl } from "./utm-builder";
import { SITE_URL } from "@/lib/seo";

type TeaserInput = {
  page: ProgrammaticSEOPage;
  platformId: string;
  teaserStyle?: TeaserStyle;
  hookOverride?: string;
};

const HOOK_TEMPLATES: Record<TeaserStyle, (page: ProgrammaticSEOPage) => string> = {
  "mistake-hook": (p) =>
    `Многие ошибаются при выборе «${p.targetKeyword}». В полной статье разобрали, что проверить до строительства.`,
  "cost-hook": (p) =>
    `«${p.title}» кажется понятным по бюджету только на бумаге. В материале — где чаще появляются допрасходы.`,
  "local-hook": (p) =>
    `В Иркутской области участок может изменить проект сильнее, чем кажется. Разбор для запроса «${p.targetKeyword}».`,
  "question-hook": (p) =>
    `Как выбрать оптимальный вариант для «${p.targetKeyword}»? Универсального ответа нет — но есть критерии.`,
  "story-hook": (p) =>
    `Типичная ситуация при «${p.targetKeyword}»: план меняется на этапе участка. Редакционный разбор на сайте.`,
  "pain-hook": (p) =>
    `Ошибка на старте «${p.targetKeyword}» обходится дороже, чем кажется. Что проверить — в полной статье.`,
  "checklist-hook": (p) =>
    `Короткий чек-лист по теме «${p.targetKeyword}» — в полной статье на stroistroy.ru.`,
  "myth-busting": (p) =>
    `Миф о «${p.targetKeyword}» мешает принять решение. Развенчиваем в материале на сайте.`,
  "case-hook": (p) =>
    `Как подходят к «${p.targetKeyword}» на практике — без выдуманных отзывов, в экспертном разборе.`,
  "digest-hook": (p) =>
    `Главное о «${p.targetKeyword}» за неделю — кратко здесь, подробно на stroistroy.ru.`,
};

export function buildCuriosityHook(page: ProgrammaticSEOPage, style: TeaserStyle): string {
  return HOOK_TEMPLATES[style]?.(page) ?? HOOK_TEMPLATES["question-hook"](page);
}

export function buildOpenLoop(page: ProgrammaticSEOPage): string {
  return `Полный разбор с FAQ и практическими шагами — на сайте: ${page.title}.`;
}

export function buildReadMoreCTA(platformId: string): string {
  const platform = getExternalPlatform(platformId);
  if (platformId === "telegram") return "Читать полностью на stroistroy.ru →";
  if (platformId === "dzen") return "Продолжение на официальном сайте →";
  if (platform?.title) return `Открыть полную статью (${platform.title}) →`;
  return "Открыть полную статью →";
}

export function buildPlatformLead(page: ProgrammaticSEOPage, platformId: string): string {
  const limit = getExternalPlatform(platformId)?.recommendedLength ?? 700;
  const lead = `${page.seoDescription}`.slice(0, Math.min(limit - 120, 400));
  return lead;
}

export function validateNoDeceptiveClickbait(teaser: Pick<ContentTeaserVersion, "hook" | "openLoop" | "title">): boolean {
  const banned = [/100% гарант/i, /точная цена/i, /бесплатно навсегда/i, /секретная схема/i];
  const text = `${teaser.title} ${teaser.hook} ${teaser.openLoop}`;
  return !banned.some((re) => re.test(text));
}

export function validateTeaserLinksToFullArticle(
  teaser: Pick<ContentTeaserVersion, "utmUrl" | "fullArticleUrl">,
): boolean {
  try {
    const utm = new URL(teaser.utmUrl);
    const full = new URL(teaser.fullArticleUrl);
    return utm.hostname === full.hostname && utm.pathname === full.pathname;
  } catch {
    return false;
  }
}

export function buildTeaserVersion(input: TeaserInput): ContentTeaserVersion {
  const { page, platformId } = input;
  const style = input.teaserStyle ?? "question-hook";
  const fullArticleUrl = page.distribution.canonicalFullArticleUrl || `${SITE_URL}${page.url}`;
  const utmUrl = buildContentUTMUrl({
    baseUrl: fullArticleUrl,
    platformId,
    campaignId: page.distribution.utmCampaignId ?? page.clusterId,
    contentItemId: page.id,
    clusterId: page.clusterId,
  });

  const hook = input.hookOverride ?? buildCuriosityHook(page, style);
  const openLoop = buildOpenLoop(page);
  const body = buildPlatformLead(page, platformId);
  const readMoreCTA = buildReadMoreCTA(platformId);

  const teaser: ContentTeaserVersion = {
    id: `${page.id}-${platformId}`,
    sourceArticleId: page.id,
    platformId,
    title: page.title.slice(0, 80),
    hook,
    body,
    openLoop,
    readMoreCTA,
    fullArticleUrl,
    utmUrl,
    teaserStyle: style,
    status: "draft",
    validation: {
      hasClearCTA: Boolean(readMoreCTA),
      hasUTM: utmUrl.includes("utm_source"),
      noFakeClaim: validateNoDeceptiveClickbait({ hook, openLoop, title: page.title }),
      noDeceptiveClickbait: validateNoDeceptiveClickbait({ hook, openLoop, title: page.title }),
      linksToFullArticle: validateTeaserLinksToFullArticle({ utmUrl, fullArticleUrl }),
    },
  };

  return teaser;
}
