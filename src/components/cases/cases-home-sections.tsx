import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CasesHomeHero({ hasPublished }: { hasPublished: boolean }) {
  return (
    <header className="max-w-3xl">
      <h1 className="heading-section">Построенные дома и реальные задачи клиентов</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        Кейсы показывают не только готовый результат, но и путь: с чего начинался проект, какие
        были вводные, что пришлось учесть на участке, как считалась смета и какие решения помогли
        довести дом до сдачи.
      </p>
      {!hasPublished ? (
        <p className="mt-4 text-sm text-muted">
          Раздел будет дополнен реальными объектами, фото этапов и отзывами — только после
          согласования с заказчиками.
        </p>
      ) : null}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
    </header>
  );
}

export function CasesHowToRead() {
  return (
    <section aria-labelledby="cases-how-title" className="mt-16 rounded-sm border border-graphite/10 bg-graphite/[0.02] p-6 md:p-8">
      <h2 id="cases-how-title" className="heading-section text-2xl">
        Как читать кейсы
      </h2>
      <ul className="mt-4 space-y-3 text-sm text-muted">
        <li>• <strong className="text-foreground">Задача</strong> — зачем клиент строил и что было важно.</li>
        <li>• <strong className="text-foreground">Вводные</strong> — участок, площадь, материал, ограничения.</li>
        <li>• <strong className="text-foreground">Сложности</strong> — что могло удорожить или сорвать сроки.</li>
        <li>• <strong className="text-foreground">Решения</strong> — как подходили к смете, этапам и контролю.</li>
        <li>• <strong className="text-foreground">Результат</strong> — что получилось и что можно повторить у себя.</li>
      </ul>
      <p className="mt-4 text-xs text-muted">
        Каждый участок индивидуален. Стоимость и сроки похожего дома уточняются после ваших вводных.
      </p>
    </section>
  );
}

export function CasesSeoText({ hasPublished }: { hasPublished: boolean }) {
  return (
    <section aria-labelledby="cases-seo-title" className="mt-16 max-w-3xl">
      <h2 id="cases-seo-title" className="heading-section text-2xl">
        Кейсы строительства домов в Иркутске и Иркутской области
      </h2>
      <div className="mt-4 space-y-4 text-muted leading-relaxed">
        <p>
          Кейсы помогают увидеть не только готовый дом, но и путь к результату: вводные клиента,
          особенности участка, выбор проекта, материал, этапы строительства, сложности и решения.
          {hasPublished
            ? " Каждый опубликованный кейс — подтверждённый объект с согласованными данными."
            : " Раздел будет пополняться реальными объектами, фото этапов и разбором решений."}
        </p>
        <p>
          Если вы хотите построить похожий дом, можно выбрать проект в каталоге, рассчитать
          предварительную стоимость или оставить заявку на консультацию.
        </p>
      </div>
    </section>
  );
}
