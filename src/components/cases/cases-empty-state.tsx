import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CasesEmptyState({ filtered = false }: { filtered?: boolean }) {
  if (filtered) {
    return (
      <div className="mt-12 rounded-sm border border-dashed border-graphite/20 p-10 text-center">
        <h2 className="font-display text-xl">Пока нет кейсов по выбранным параметрам</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Оставьте заявку — подберём проект под похожую задачу или расскажем, когда появится
          подходящий кейс.
        </p>
        <Button asChild className="mt-6">
          <Link href="#cases-lead">Подобрать похожий дом</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-12 rounded-sm border border-graphite/15 bg-wood/5 p-8 md:p-12 text-center">
      <h2 className="font-display text-2xl md:text-3xl">Раздел кейсов готовится</h2>
      <p className="mx-auto mt-4 max-w-xl text-muted leading-relaxed">
        Здесь будут опубликованы реальные объекты: задачи клиентов, участки, проекты, материалы,
        этапы строительства, фото процесса и результаты. Пока можно посмотреть каталог проектов,
        рассчитать стоимость или оставить заявку на подбор похожего дома.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/catalog">Смотреть проекты</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/calculator?source=cases">Рассчитать стоимость</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="#cases-lead">Обсудить мой дом</Link>
        </Button>
      </div>
    </div>
  );
}
