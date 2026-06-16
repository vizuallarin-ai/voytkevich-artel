"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StickyCta } from "@/components/widgets/sticky-cta";
import { MessengerWidget } from "@/components/widgets/messenger";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main id="main-content" className="pb-24 md:pb-0">
        {children}
      </main>
      <Footer />
      <StickyCta />
      <MessengerWidget />
    </>
  );
}
