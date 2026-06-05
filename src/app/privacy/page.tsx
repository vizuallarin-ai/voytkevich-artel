import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { brand } from "@/data/brand";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Политика конфиденциальности",
  description: "Обработка персональных данных на сайте строительной артели Александра Войткевича.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="container-narrow max-w-3xl px-5 md:px-10">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Конфиденциальность" }]} />
        <h1 className="heading-section">Политика конфиденциальности</h1>
        <div className="prose prose-neutral mt-8 max-w-none prose-p:text-muted prose-headings:font-display">
          <p>
            Настоящая политика описывает, как {brand.name} обрабатывает персональные данные,
            которые вы передаёте через формы на сайте {brand.website}.
          </p>
          <h2>Какие данные мы собираем</h2>
          <ul>
            <li>Имя и номер телефона — при отправке заявки на консультацию или расчёт</li>
            <li>Площадь дома и комментарий — если вы указываете их в форме</li>
            <li>Технические данные — cookies аналитики (Яндекс.Метрика) при вашем согласии</li>
          </ul>
          <h2>Зачем мы используем данные</h2>
          <ul>
            <li>Связаться с вами по заявке и подготовить предварительный расчёт</li>
            <li>Уточнить параметры проекта, участка и комплектации</li>
            <li>Улучшать сайт и воронку заявок (обезличенная аналитика)</li>
          </ul>
          <h2>Передача третьим лицам</h2>
          <p>
            Мы не передаём ваши контакты третьим лицам без вашего согласия, за исключением случаев,
            предусмотренных законодательством РФ.
          </p>
          <h2>Хранение и защита</h2>
          <p>
            Данные заявок передаются в защищённые каналы связи (мессенджер, CRM) и хранятся только
            столько, сколько нужно для обработки обращения.
          </p>
          <h2>Ваши права</h2>
          <p>
            Вы можете запросить уточнение, обновление или удаление своих данных, написав на{" "}
            <a href={`mailto:${brand.email}`}>{brand.email}</a> или позвонив{" "}
            <a href={`tel:${brand.phone}`}>{brand.phoneDisplay}</a>.
          </p>
          <h2>Контакты оператора</h2>
          <p>
            {brand.name}
            <br />
            {brand.address}
            <br />
            <Link href="/">Вернуться на главную</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
