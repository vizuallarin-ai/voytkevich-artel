import type { Metadata } from "next";
import {
  generateProgrammaticRootMetadata,
  renderProgrammaticRootPage,
} from "@/lib/programmatic-seo/programmatic-route";

export async function generateMetadata(): Promise<Metadata> {
  return generateProgrammaticRootMetadata("bathhouses");
}

export default async function ProektyBanPage() {
  return renderProgrammaticRootPage("bathhouses");
}
