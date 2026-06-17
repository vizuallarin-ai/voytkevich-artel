import type { ProgrammaticPageData } from "@/types/programmatic-page-template";

export function ProgrammaticHero({ page }: { page: ProgrammaticPageData }) {
  return (
    <header className="max-w-4xl">
      <p className="label-caps text-muted">Подборка проектов</p>
      <h1 className="mt-3 font-display text-3xl leading-tight md:text-4xl lg:text-5xl">{page.h1}</h1>
      {!page.robots.index ? (
        <p className="mt-4 inline-block rounded-sm bg-amber-50 px-3 py-1 text-xs text-amber-900">
          Страница в подготовке — контент для ознакомления, не индексируется
        </p>
      ) : null}
    </header>
  );
}
