import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ObjectsMapEmptyState({ filtered = false }: { filtered?: boolean }) {
  if (filtered) {
    return (
      <div className="mt-12 rounded-sm border border-dashed border-graphite/20 p-10 text-center">
        <h2 className="font-display text-xl">Пока нет объектов по выбранным параметрам</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Оставьте заявку — подберём проект под ваш участок и задачу.
        </p>
        <Button asChild className="mt-6">
          <Link href="#objects-map-lead">Обсудить мой участок</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-12 rounded-sm border border-graphite/15 bg-wood/5 p-8 text-center md:p-12">
      <h2 className="font-display text-2xl md:text-3xl">Карта объектов наполняется</h2>
      <p className="mx-auto mt-4 max-w-xl text-muted leading-relaxed">
        Здесь будут опубликованы реальные построенные дома с разрешения заказчиков: район, материал,
        площадь, этапы и фото. Пока можно получить пример сметы, подобрать проект под участок или
        рассчитать стоимость — без фиктивных адресов и объектов.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild>
          <Link href="#objects-map-lead">Получить пример сметы</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/catalog#catalog-picker">Подобрать проект под участок</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/calculator?source=objects-map">Рассчитать стоимость</Link>
        </Button>
      </div>
    </div>
  );
}
