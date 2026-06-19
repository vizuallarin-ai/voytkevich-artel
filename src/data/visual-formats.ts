import type { VisualAspectRatio } from "@/types/visual-content";

export type VisualFormatSpec = {
  aspectRatio: VisualAspectRatio;
  label: string;
  usage: string[];
  recommendedWidth?: number;
  recommendedHeight?: number;
  notes: string;
};

export const visualFormats: VisualFormatSpec[] = [
  {
    aspectRatio: "16:9",
    label: "16:9 — широкий",
    usage: ["blog cover", "OG image", "site cover"],
    recommendedWidth: 1920,
    recommendedHeight: 1080,
    notes: "Основной формат для сайта и Open Graph.",
  },
  {
    aspectRatio: "1:1",
    label: "1:1 — квадрат",
    usage: ["Telegram", "VK", "OK square teaser"],
    recommendedWidth: 1080,
    recommendedHeight: 1080,
    notes: "Квадратные превью для мессенджеров и лент.",
  },
  {
    aspectRatio: "4:5",
    label: "4:5 — портрет",
    usage: ["social feed portrait"],
    recommendedWidth: 1080,
    recommendedHeight: 1350,
    notes: "Портретная лента соцсетей.",
  },
  {
    aspectRatio: "9:16",
    label: "9:16 — вертикаль",
    usage: ["stories", "reels", "future vertical"],
    recommendedWidth: 1080,
    recommendedHeight: 1920,
    notes: "Вертикальные форматы — подготовка к stories/reels.",
  },
  {
    aspectRatio: "favicon",
    label: "Favicon / app icon",
    usage: ["favicon", "PWA icon"],
    recommendedWidth: 512,
    recommendedHeight: 512,
    notes: "32×32, 48×48, 180×180, 512×512.",
  },
];

export const faviconSizes = [32, 48, 180, 512] as const;

export function getFormatSpec(aspectRatio: VisualAspectRatio): VisualFormatSpec | undefined {
  return visualFormats.find((f) => f.aspectRatio === aspectRatio);
}
