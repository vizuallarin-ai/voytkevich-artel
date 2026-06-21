import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchPageClient } from "@/components/search/SearchPageClient";

export const metadata: Metadata = {
  title: "Поиск — СтройСтрой",
  description: "Поиск проектов, услуг, статей и материалов по сайту stroistroy.ru",
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <main className="container-narrow px-5 py-24 md:px-10 lg:px-16">
      <h1 className="heading-section text-3xl md:text-4xl">Поиск по сайту</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Проекты домов и бань, услуги, технологии, локации и статьи — с AI-помощником на основе проверенного контента.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-muted">Загрузка...</p>}>
          <SearchPageClient />
        </Suspense>
      </div>
    </main>
  );
}
