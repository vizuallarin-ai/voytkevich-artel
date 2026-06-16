"use client";

import { MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { brand } from "@/data/brand";
import { trackTelegramClicked, trackWhatsappClicked } from "@/lib/analytics/cta-tracking";

const channels = [
  {
    href: `https://wa.me/${brand.phoneMobile.replace(/\D/g, "")}`,
    label: "WhatsApp",
    icon: MessageCircle,
    track: () => trackWhatsappClicked("messenger_fab"),
  },
  {
    href: brand.telegram,
    label: "Telegram",
    icon: Send,
    track: () => trackTelegramClicked("messenger_fab"),
  },
];

/** Desktop FAB — на mobile контакты в sticky bar. */
export function MessengerWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-5 z-30 hidden md:block">
      {open && (
        <div className="mb-3 flex flex-col gap-2">
          {channels.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm shadow-lg transition hover:bg-white"
              onClick={c.track}
            >
              <c.icon className="h-4 w-4" />
              {c.label}
            </Link>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full bg-graphite text-background shadow-xl transition hover:scale-105",
          open && "rotate-0",
        )}
        aria-expanded={open}
        aria-label="Связаться в мессенджере"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
