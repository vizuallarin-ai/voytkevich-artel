import type { Metadata, Viewport } from "next";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll";
import { SiteChrome } from "@/components/layout/site-chrome";
import { JsonLd, organizationSchema } from "@/components/seo/json-ld";
import { YaMetrika } from "@/components/analytics/ya-metrika";
import { AttributionInit } from "@/components/analytics/attribution-init";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { defaultMetadata } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  themeColor: "#f7f5f2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="min-h-screen font-sans antialiased">
        <YaMetrika />
        <AttributionInit />
        <PageViewTracker />
        <JsonLd data={organizationSchema()} />
        <SmoothScrollProvider>
          <SiteChrome>{children}</SiteChrome>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
