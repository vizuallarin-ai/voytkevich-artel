import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd, faqSchema } from "@/components/seo/json-ld";
import { cms } from "@/lib/cms/local";
import { pageMetadata } from "@/lib/seo";
import { blogCategories } from "@/data/blog-categories";
import { getFeaturedPosts } from "@/lib/blog";
import { getLeadMagnetsForCluster } from "@/data/blog-lead-magnets";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import {
  BlogCategoryNav,
  BlogHomeHero,
  BlogPopularTopics,
} from "@/components/blog/blog-home-sections";
import { BlogFAQ } from "@/components/blog/blog-faq";
import { BlogInlineCta } from "@/components/blog/blog-inline-cta";
import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/forms/lead-form";
import { cta } from "@/data/copy";

export const metadata: Metadata = pageMetadata({
  title: "Блог о строительстве домов в Иркутске",
  description:
    "Статьи о стоимости, смете, материалах, участке, планировке и ипотеке — для тех, кто планирует дом под ключ в Иркутской области.",
  path: "/blog",
});

const blogHomeFaqs = [
  {
    question: "Можно ли по статьям блога получить точную цену дома?",
    answer:
      "Статьи дают ориентиры и логику сметы. Точная сумма — после уточнения участка, проекта и комплектации в калькуляторе или заявке.",
  },
  {
    question: "Как связаны статьи и калькулятор?",
    answer:
      "В материалах есть ссылки на калькулятор с предзаполненным источником — так проще продолжить тему расчётом.",
  },
  {
    question: "Обновляются ли материалы о ценах и ипотеке?",
    answer:
      "Да, такие статьи помечены и требуют периодической проверки — условия рынка и банков меняются.",
  },
  {
    question: "Можно ли задать вопрос по своему участку?",
    answer: "Да — оставьте заявку в конце статьи или на главной блога, укажите вводные в комментарии.",
  },
];

export default async function BlogPage() {
  const posts = await cms.getBlogPosts();
  const featured = getFeaturedPosts(posts, 3);
  const latest = posts.slice(0, 9);
  const costMagnet = getLeadMagnetsForCluster("cost")[0];

  return (
    <div className="pt-28 pb-20">
      <JsonLd data={faqSchema(blogHomeFaqs)} />
      <div className="container-narrow px-5 md:px-10 lg:px-16">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Блог" }]} />

        <BlogHomeHero />
        <BlogCategoryNav categories={blogCategories} />

        {featured.length > 0 ? (
          <section aria-labelledby="blog-featured" className="mt-16">
            <h2 id="blog-featured" className="heading-section text-2xl">
              Рекомендуемые материалы
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((post) => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        ) : null}

        <section aria-labelledby="blog-latest" className="mt-16">
          <h2 id="blog-latest" className="heading-section text-2xl">
            Последние статьи
          </h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {latest.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        <BlogPopularTopics />

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <BlogInlineCta
            cta={{
              primary: { label: "Рассчитать стоимость дома", href: "/calculator?source=blog&cluster=cost" },
              secondary: { label: "Получить предварительную смету", href: "/smeta-na-stroitelstvo-doma" },
            }}
            title="Нужен ориентир по бюджету?"
            description="Калькулятор даст предварительный диапазон — менеджер уточнит смету по этапам."
          />
          <BlogInlineCta
            cta={{
              primary: { label: "Смотреть проекты", href: "/catalog" },
              secondary: { label: "Собрать планировку", href: "/planirovka?source=blog" },
            }}
            title="Уже понимаете площадь и материал?"
            description="Подберите проект в каталоге или соберите черновик планировки."
          />
        </div>

        {costMagnet ? (
          <section
            id="blog-lead-magnet"
            aria-labelledby="blog-magnet-home"
            className="mt-16 rounded-sm border border-graphite/10 bg-graphite/[0.02] p-6 md:p-8"
          >
            <h2 id="blog-magnet-home" className="heading-section text-2xl">
              {costMagnet.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">{costMagnet.description}</p>
            <Button asChild className="mt-4">
              <Link href="#blog-home-lead">{costMagnet.cta}</Link>
            </Button>
          </section>
        ) : null}

        <section aria-labelledby="blog-seo-text" className="mt-16 max-w-3xl">
          <h2 id="blog-seo-text" className="heading-section text-2xl">
            Полезные материалы о строительстве домов
          </h2>
          <div className="mt-4 space-y-4 text-muted leading-relaxed">
            <p>
              В блоге собраны материалы о строительстве частных домов в Иркутске и Иркутской области:
              стоимость, смета, выбор проекта, материалы, фундамент, участок, планировки, ипотека,
              договор и ошибки, которые могут увеличить бюджет. Эти статьи помогают разобраться в
              процессе до заявки, чтобы обсуждать строительство предметно: с пониманием площади,
              комплектации, участка и будущей сметы.
            </p>
            <p>
              Каждый материал связан с практическим шагом: можно перейти к калькулятору стоимости,
              открыть каталог проектов, собрать планировку или оставить заявку на консультацию.
            </p>
          </div>
        </section>

        <BlogFAQ items={blogHomeFaqs} />

        <div className="mt-16 border-t border-graphite/10 pt-16">
          <LeadForm
            id="blog-home-lead"
            title="Обсудить мой проект"
            subtitle="Ответим на вопросы и подскажем следующий шаг — расчёт, проект, чек-лист или каталог"
            submitLabel={cta.getConsultation}
            leadConfig={{
              sourceType: "blog-post",
              formId: "blog-home-lead",
              formName: "Блог — консультация",
              requestType: "consultation",
              requestTitle: "Заявка с главной блога",
              selectedCTA: cta.getConsultation,
              conversionGoal: "blog_submit",
              context: { blog: { slug: "index", title: "Главная блога" } },
            }}
          />
        </div>
      </div>
    </div>
  );
}
