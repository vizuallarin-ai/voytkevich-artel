import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll";
import { StickyCta } from "@/components/widgets/sticky-cta";
import { MessengerWidget } from "@/components/widgets/messenger";
import { JsonLd, organizationSchema } from "@/components/seo/json-ld";
import { YaMetrika } from "@/components/analytics/ya-metrika";
import { defaultMetadata } from "@/lib/seo";
import "./globals.css";

const fontSans = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: true,
});

const fontDisplay = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600"],
  display: "swap",
  adjustFontFallback: true,
});

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
    <html lang="ru" className={`${fontSans.variable} ${fontDisplay.variable}`}>
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
