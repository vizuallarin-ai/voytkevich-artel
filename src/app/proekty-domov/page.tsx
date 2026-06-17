import type { Metadata } from "next";
import {
  generateProgrammaticRootMetadata,
  renderProgrammaticRootPage,
} from "@/lib/programmatic-seo/programmatic-route";

export async function generateMetadata(): Promise<Metadata> {
  return generateProgrammaticRootMetadata("houses");
}

export default async function ProektyDomovPage() {
  return renderProgrammaticRootPage("houses");
}
