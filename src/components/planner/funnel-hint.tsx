import Link from "next/link";
import type { ReactNode } from "react";
import { brand } from "@/data/brand";

type FunnelPage = "catalog" | "calculator" | "planirovka";

const copy: Record<FunnelPage, { title: string; body: ReactNode }> = {
  catalog: {
    title: "Как обычно подбирают дом",
    body: (
      <>
        Сначала смотрят{" "}
        <span className="font-medium text-foreground">готовые проекты</span> (вы здесь).
        Если параметры другие —{" "}
        <Link href="/calculator" className="font-medium text-wood underline-offset-4 hover:underline">
          калькулятор цены
        </Link>
        . Схему комнат{" "}
        <Link href="/planirovka" className="font-medium text-wood underline-offset-4 hover:underline">
          собирают по желанию
        </Link>
        , это не обязательно. Чтобы обсудить стройку —{" "}
        <Link href="/#lead" className="font-medium text-wood underline-offset-4 hover:underline">
          предварительный расчёт
        </Link>{" "}
        или{" "}
        <Link href={`tel:${brand.phone}`} className="font-medium text-wood underline-offset-4 hover:underline">
          звонок
        </Link>
        .
      </>
    ),
  },
  calculator: {
    title: "Вы считаете цену",
    body: (
      <>
        Это главный ориентир по бюджету. Дальше можно посмотреть похожий проект в{" "}
        <Link href="/catalog" className="font-medium text-wood underline-offset-4 hover:underline">
          каталоге
        </Link>{" "}
        или{" "}
        <Link href="/planirovka" className="font-medium text-wood underline-offset-4 hover:underline">
          собрать предварительную схему планировки
        </Link>{" "}
        (необязательно). Готовы обсудить —{" "}
        <Link href="/#lead" className="font-medium text-wood underline-offset-4 hover:underline">
          получить предварительный расчёт
        </Link>
        .
      </>
    ),
  },
  planirovka: {
    title: "Это необязательный этап",
    body: (
      <>
        Схема — для наглядности на созвоне, не проект для стройки. Обычно до неё смотрят{" "}
        <Link href="/catalog" className="font-medium text-wood underline-offset-4 hover:underline">
          каталог
        </Link>{" "}
        и{" "}
        <Link href="/calculator" className="font-medium text-wood underline-offset-4 hover:underline">
          калькулятор
        </Link>
        . Чтобы договориться о стройке — форма ниже,{" "}
        <Link href={`tel:${brand.phone}`} className="font-medium text-wood underline-offset-4 hover:underline">
          звонок
        </Link>{" "}
        или{" "}
        <Link href="/#lead" className="font-medium text-wood underline-offset-4 hover:underline">
          предварительный расчёт на главной
        </Link>
        .
      </>
    ),
  },
};

export function FunnelHint({ page }: { page: FunnelPage }) {
  const { title, body } = copy[page];

  return (
    <aside className="mb-8 rounded-sm border border-graphite/10 bg-muted-bg/50 px-4 py-3 text-sm text-muted">
      <p className="label-caps !text-[0.65rem]">{title}</p>
      <p className="mt-2 leading-relaxed">{body}</p>
    </aside>
  );
}
