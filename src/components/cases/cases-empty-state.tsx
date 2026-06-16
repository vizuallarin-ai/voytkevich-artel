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
    <div className="mt-12 rounded-sm border border-graphite/15 bg-wood/5 p-8 text-center md:p-12">
      <h2 className="font-display text-2xl md:text-3xl">Готовим полные кейсы с фото этапов</h2>
      <p className="mx-auto mt-4 max-w-xl text-muted leading-relaxed">
        Мы готовим разборы реальных объектов: задача клиента, участок, материал, сроки, этапы и
        результат. Пока вы можете получить пример структуры сметы, подобрать проект под участок
        или обсудить похожий дом с архитектором — без выдуманных историй и фото.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild>
          <Link href="#cases-lead">Получить пример сметы</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/catalog#catalog-picker">Подобрать проект под участок</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="#cases-lead">Обсудить похожий дом</Link>
        </Button>
      </div>
    </div>
  );
}
