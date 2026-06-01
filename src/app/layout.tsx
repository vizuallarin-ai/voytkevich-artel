import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll";
import { StickyCta } from "@/components/widgets/sticky-cta";
import { MessengerWidget } from "@/components/widgets/messenger";
import { JsonLd, organizationSchema } from "@/components/seo/json-ld";
import { YaMetrika } from "@/components/analytics/ya-metrika";
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
        <JsonLd data={organizationSchema()} />
        <SmoothScrollProvider>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
          <StickyCta />
          <MessengerWidget />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
