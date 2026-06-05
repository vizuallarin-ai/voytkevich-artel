import { includedWorkGroups } from "@/lib/project-content";

export function ProjectIncludedWorks() {
  return (
    <section aria-labelledby="project-included-title">
      <h2 id="project-included-title" className="font-display text-2xl">
        Что может входить в стоимость строительства
      </h2>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        Состав зависит от комплектации. Ниже — типовые группы работ для проекта под ключ в
        Иркутске.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {includedWorkGroups.map((group) => (
          <div
            key={group.title}
            className="rounded-sm border border-graphite/10 bg-muted-bg/40 p-5"
          >
            <h3 className="font-medium">{group.title}</h3>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {group.items.map((item) => (
                <li key={item}>— {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">
        Точный состав работ фиксируется в смете и договоре после уточнения проекта, участка,
        комплектации и материалов.
      </p>
    </section>
  );
}
