import { cn } from "@/lib/utils";

const WEBMASTER_URL = "https://webmaster.yandex.ru/siteinfo/?site=stroistroy.ru";
const COUNTER_SRC = "https://yandex.ru/cycounter?stroistroy.ru&theme=light&lang=ru";

export function YandexIksBadge({ className }: { className?: string }) {
  return (
    <a
      href={WEBMASTER_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-block shrink-0 transition-opacity hover:opacity-90", className)}
      aria-label="Индекс качества сайта в Яндексе (ИКС)"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={COUNTER_SRC}
        width={88}
        height={31}
        alt="ИКС Яндекс"
        className="rounded-lg"
      />
    </a>
  );
}
