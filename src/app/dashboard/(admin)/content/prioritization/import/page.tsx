"use client";

import Link from "next/link";
import { CSVImportPanel } from "@/components/content-prioritization/CSVImportPanel";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/content/prioritization" className="text-sm text-muted underline">
          ← Приоритизация
        </Link>
        <h1 className="mt-3 heading-section text-3xl">CSV import</h1>
      </div>
      <CSVImportPanel />
    </div>
  );
}
