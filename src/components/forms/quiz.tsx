"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { filtersToSearchParams } from "@/lib/filters";
import { trackEvent } from "@/lib/analytics";
import type { CatalogFilters, Material, Style } from "@/types";

const steps = [
  {
    question: "Какая площадь вам нужна?",
    options: ["до 120 м²", "120–180 м²", "180–240 м²", "240+ м²"],
  },
  {
    question: "Сколько этажей?",
    options: ["1 этаж", "2 этажа", "Не решил"],
  },
  {
    question: "Предпочтительная технология",
    options: ["каркас", "газобетон", "брус", "кирпич", "пока не знаю"] as (Material | string)[],
  },
  {
    question: "Стиль дома",
    options: ["скандинавский", "минимализм", "шале", "барнхаус", "хай-тек"] as Style[],
  },
  {
    question: "Когда планируете строить?",
    options: ["В этом году", "В следующем", "Через 2+ года", "Изучаю варианты"],
  },
];

function buildCatalogFilters(answers: string[]): CatalogFilters {
  const filters: CatalogFilters = {};

  // Step 0 — area
  const area = answers[0];
  if (area === "до 120 м²") { filters.areaMin = 0; filters.areaMax = 120; }
  else if (area === "120–180 м²") { filters.areaMin = 120; filters.areaMax = 180; }
  else if (area === "180–240 м²") { filters.areaMin = 180; filters.areaMax = 240; }
  else if (area === "240+ м²") { filters.areaMin = 240; }

  // Step 1 — floors
  const floors = answers[1];
  if (floors === "1 этаж") filters.floors = [1];
  else if (floors === "2 этажа") filters.floors = [2];

  // Step 2 — material
  const mat = answers[2] as Material | string;
  const validMaterials: Material[] = ["каркас", "газобетон", "брус", "кирпич", "клееный брус"];
  if (validMaterials.includes(mat as Material)) {
    filters.material = [mat as Material];
  }

  // Step 3 — style
  const style = answers[3] as Style;
  const validStyles: Style[] = ["скандинавский", "минимализм", "шале", "барнхаус", "хай-тек", "классика"];
  if (validStyles.includes(style)) {
    filters.style = [style];
  }

  return filters;
}

export function HouseQuiz() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const current = steps[step];
  const progress = ((step + (done ? 1 : 0)) / steps.length) * 100;

  const select = (opt: string) => {
    const next = [...answers, opt];
    setAnswers(next);
    if (step >= steps.length - 1) {
      setDone(true);
      trackEvent("quiz_complete", { answers: next.join(" | ") });
    } else {
      setStep(step + 1);
    }
  };

  const goToCatalog = () => {
    const filters = buildCatalogFilters(answers);
    const qs = filtersToSearchParams(filters);
    trackEvent("quiz_catalog_click");
    router.push(`/catalog${qs ? `?${qs}` : ""}`);
  };

  if (done) {
    return (
      <div id="quiz" className="section-padding bg-muted-bg">
        <div className="container-narrow max-w-xl text-center">
          <p className="heading-section">Подбор готов</p>
          <p className="mt-4 text-muted">
            Мы отфильтровали каталог по вашим ответам — посмотрите подходящие проекты.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" onClick={goToCatalog}>
              Смотреть подходящие проекты
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/#lead">Получить консультацию</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="quiz" className="section-padding bg-muted-bg" aria-labelledby="quiz-title">
      <div className="container-narrow max-w-2xl">
        <p className="label-caps">AI-подбор дома</p>
        <h2 id="quiz-title" className="heading-section mt-2">
          Ответьте на 5 вопросов
        </h2>
        <div className="mt-6 h-1 rounded-full bg-sand">
          <div
            className="h-full rounded-full bg-graphite transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-8 text-xl">{current.question}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {current.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => select(opt)}
              className={cn(
                "rounded-sm border border-graphite/15 bg-background px-5 py-4 text-left text-sm transition",
                "hover:border-graphite hover:bg-sand/50"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">
          Шаг {step + 1} из {steps.length}
        </p>
      </div>
    </section>
  );
}
