import Link from "next/link";
import { MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ObjectsMapHero({ hasPublished }: { hasPublished: boolean }) {
  return (
    <header className="mt-8 max-w-3xl">
      <p className="label-caps">География объектов</p>
      <h1 className="heading-section mt-2">
        Карта построенных домов и объектов
      </h1>
      <p className="mt-4 text-muted leading-relaxed">
        Посмотрите, в каких районах и форматах компания строила дома: площадь, материал,
        этажность, сценарий, кейс и похожие проекты. Точные адреса частных домов не
        раскрываются без согласия владельцев.
      </p>
      <div className="mt-4 flex items-start gap-2 rounded-sm border border-graphite/10 bg-graphite/[0.02] px-4 py-3 text-sm text-muted">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-wood" aria-hidden />
        <p>
          Объекты на карте могут отображаться по району или примерной зоне — это защищает
          приватность заказчиков.
        </p>
      </div>
      {hasPublished ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="#objects-map-lead">Хочу похожий дом</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/cases">Смотреть кейсы</Link>
          </Button>
        </div>
      ) : null}
    </header>
  );
}

export function ObjectsMapSeoText({ hasPublished }: { hasPublished: boolean }) {
  return (
    <section aria-labelledby="objects-map-seo" className="mt-16 max-w-3xl">
      <h2 id="objects-map-seo" className="heading-section text-2xl">
        Построенные дома в Иркутске и Иркутской области
      </h2>
      <div className="mt-4 space-y-4 text-sm text-muted leading-relaxed">
        {hasPublished ? (
          <>
            <p>
              Карта объектов помогает увидеть географию строительства и примеры домов, которые
              компания может показать с разрешения заказчиков. Для будущего клиента важно
              понимать не только внешний вид дома, но и условия строительства: участок, материал,
              площадь, этажность, логистику, фундамент, комплектацию и этапы работ.
            </p>
            <p>
              Точные адреса частных домов не публикуются без согласия владельцев. Объекты на
              карте могут отображаться по району или примерной зоне. Если вы хотите построить
              похожий дом, можно перейти в кейс, открыть похожий проект, рассчитать
              предварительную стоимость или оставить заявку на консультацию.
            </p>
          </>
        ) : (
          <p>
            Раздел будет пополняться реальными построенными домами, кейсами и фото этапов —
            только с разрешения заказчиков. Точные адреса частных объектов не публикуются.
            Пока можно посмотреть каталог проектов, кейсы, рассчитать стоимость или оставить
            заявку на подбор похожего дома под ваш участок.
          </p>
        )}
      </div>
      {!hasPublished ? (
        <p className="mt-4 flex items-center gap-2 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          Карта-схема районов появится после публикации первых объектов.
        </p>
      ) : null}
    </section>
  );
}

export function ObjectsMapTrustBlock() {
  return (
    <section aria-labelledby="objects-map-trust" className="mt-16 rounded-sm border border-graphite/10 p-6 md:p-8">
      <h2 id="objects-map-trust" className="heading-section text-xl md:text-2xl">
        Почему карта усиливает доверие
      </h2>
      <p className="mt-3 max-w-2xl text-sm text-muted leading-relaxed">
        В строительстве важно видеть не только красивые проекты, но и реальные объекты: где
        строили, с какими вводными, какой материал использовали, какие сложности возникали и
        как они решались. Поэтому карта связана с кейсами, проектами и заявками на похожий дом.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 text-sm text-muted">
        <li className="flex gap-2">
          <span className="text-wood">→</span>
          объекты публикуются только при наличии данных и разрешений
        </li>
        <li className="flex gap-2">
          <span className="text-wood">→</span>
          точные адреса частных домов не раскрываются
        </li>
        <li className="flex gap-2">
          <span className="text-wood">→</span>
          фото публикуются только при разрешении
        </li>
        <li className="flex gap-2">
          <span className="text-wood">→</span>
          кейсы показывают задачу и решения
        </li>
        <li className="flex gap-2 sm:col-span-2">
          <span className="text-wood">→</span>
          похожий дом считается отдельно под ваш участок
        </li>
      </ul>
    </section>
  );
}
