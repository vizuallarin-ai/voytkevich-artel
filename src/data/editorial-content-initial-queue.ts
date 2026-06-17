import type { EditorialContentQueueItem } from "@/types/editorial-content";

type QueueDef = [
  id: string,
  slug: string,
  type: EditorialContentQueueItem["type"],
  rubricId: string,
  authorId: string,
  title: string,
  h1: string,
  priority: EditorialContentQueueItem["priority"],
  status?: EditorialContentQueueItem["status"],
  sourceRequired?: boolean,
];

const defs: QueueDef[] = [
  ["e-001", "kak-semya-vybirala-dom-150-m2", "scenario-story", "project-choice-stories", "marusya-irkutskaya", "Как семья выбирала дом 150 м²", "Как семья выбирала дом 150 м² для участка", "P1"],
  ["e-002", "pochemu-krasivyy-proekt-ne-vsegda-podhodit-uchastku", "scenario-story", "land-plot-stories", "vanya-mamonskiy", "Почему красивый проект не всегда подходит участку", "Почему красивый проект не всегда подходит участку", "P1"],
  ["e-003", "kak-vybrat-mezhdu-odnoetazhnym-i-dvuhetazhnym-domom", "scenario-story", "project-choice-stories", "irina-klubnichnaya", "Одноэтажный или двухэтажный дом", "Как выбрать между одноэтажным и двухэтажным домом", "P1"],
  ["e-004", "kak-my-ponimali-kakoy-dom-nam-nuzhen", "fictionalized-story", "client-scenarios", "marusya-irkutskaya", "Как мы понимали, какой дом нам нужен", "Как мы понимали, какой дом нам нужен", "P1"],
  ["e-005", "dom-s-terrasoy-ili-bez", "scenario-story", "project-choice-stories", "irina-klubnichnaya", "Дом с террасой или без", "Дом с террасой или без — что выбрать", "P2"],
  ["e-006", "kak-uchastok-menyaet-proekt-doma", "scenario-story", "land-plot-stories", "vanya-mamonskiy", "Как участок меняет проект дома", "Как участок меняет проект дома", "P1"],
  ["e-007", "chto-my-ne-uchli-pered-pokupkoy-uchastka", "fictionalized-story", "land-plot-stories", "anton-korobkov", "Что мы не учли перед покупкой участка", "Что мы не учли перед покупкой участка", "P1"],
  ["e-008", "pochemu-podezd-k-uchastku-vazhen-dlya-smety", "author-column", "land-plot-stories", "anton-korobkov", "Почему подъезд к участку важен для сметы", "Почему подъезд к участку важен для сметы", "P2"],
  ["e-009", "kak-vybirali-uchastok-v-irkutskoy-oblasti", "local-story", "local-building-life", "vanya-mamonskiy", "Как выбирали участок в Иркутской области", "Как выбирали участок в Иркутской области", "P2"],
  ["e-010", "kak-uklon-uchastka-mozhet-izmenit-stroyku", "author-column", "land-plot-stories", "anton-korobkov", "Как уклон участка может изменить стройку", "Как уклон участка может изменить стройку", "P2"],
  ["e-011", "kak-semya-schitala-byudzhet-na-dom", "scenario-story", "estimate-and-budget-stories", "anton-korobkov", "Как семья считала бюджет на дом", "Как семья считала бюджет на дом", "P1"],
  ["e-012", "pochemu-predvaritelnyy-raschet-ne-raven-finalnoy-smete", "author-column", "estimate-and-budget-stories", "anton-korobkov", "Почему предварительный расчёт не равен финальной смете", "Почему предварительный расчёт не равен финальной смете", "P1"],
  ["e-013", "chto-okazalos-dorozhe-chem-ozhidali", "fictionalized-story", "estimate-and-budget-stories", "marusya-irkutskaya", "Что оказалось дороже, чем ожидали", "Что оказалось дороже, чем ожидали при строительстве дома", "P2"],
  ["e-014", "kak-sravnivali-smety-raznyh-podryadchikov", "scenario-story", "estimate-and-budget-stories", "anton-korobkov", "Как сравнивали сметы разных подрядчиков", "Как сравнивали сметы разных подрядчиков", "P2"],
  ["e-015", "kak-ne-zabyt-rashody-na-logistiku", "author-column", "estimate-and-budget-stories", "anton-korobkov", "Как не забыть расходы на логистику", "Как не забыть расходы на логистику в смете", "P3"],
  ["e-016", "banya-3-na-3-ili-4-na-6-chto-vybrat", "scenario-story", "bathhouse-stories", "ivan-samodelkin", "Баня 3×3 или 4×6 — что выбрать", "Баня 3 на 3 или 4 на 6 — что выбрать", "P2"],
  ["e-017", "kak-vybrat-mesto-pod-banyu-na-uchastke", "scenario-story", "bathhouse-stories", "ivan-samodelkin", "Как выбрать место под баню на участке", "Как выбрать место под баню на участке", "P2"],
  ["e-018", "pochemu-malenkaya-banya-ne-vsegda-deshevle", "author-column", "bathhouse-stories", "anton-korobkov", "Почему маленькая баня не всегда дешевле", "Почему маленькая баня не всегда дешевле", "P3"],
  ["e-019", "kak-semya-vybirala-banyu-dlya-dachi", "fictionalized-story", "bathhouse-stories", "irina-klubnichnaya", "Как семья выбирала баню для дачи", "Как семья выбирала баню для дачи", "P2"],
  ["e-020", "chto-uchest-pered-stroitelstvom-bani", "scenario-story", "bathhouse-stories", "ivan-samodelkin", "Что учесть перед строительством бани", "Что учесть перед строительством бани", "P2"],
  ["e-021", "stroitelstvo-doma-v-mamonyah-tipovaya-situaciya", "local-story", "local-building-life", "vanya-mamonskiy", "Строительство дома в Мамонах", "Строительство дома в Мамонах — типовая ситуация", "P2"],
  ["e-022", "stroitelstvo-doma-v-homutovo-chto-uchest", "local-story", "local-building-life", "vanya-mamonskiy", "Строительство дома в Хомутово", "Строительство дома в Хомутово — что учесть", "P2"],
  ["e-023", "dom-po-baikalskomu-traktu-chto-proverit", "local-story", "local-building-life", "vanya-mamonskiy", "Дом по Байкальскому тракту", "Дом по Байкальскому тракту — что проверить", "P3"],
  ["e-024", "uchastok-v-markova-i-vybor-proekta", "local-story", "local-building-life", "marusya-irkutskaya", "Участок в Маркова и выбор проекта", "Участок в Маркова и выбор проекта дома", "P3"],
  ["e-025", "zagorodnyy-dom-v-irkutskoy-oblasti-s-chego-nachat", "scenario-story", "local-building-life", "marusya-irkutskaya", "Загородный дом в Иркутской области", "Загородный дом в Иркутской области — с чего начать", "P2"],
  ["e-026", "5-oshibok-pered-vyborom-proekta-doma", "author-column", "mistakes-and-lessons", "anton-korobkov", "5 ошибок перед выбором проекта дома", "5 ошибок перед выбором проекта дома", "P2"],
  ["e-027", "chto-lyudi-chasto-zabyvayut-pered-stroykoy", "question-roundup", "mistakes-and-lessons", "ivan-samodelkin", "Что люди часто забывают перед стройкой", "Что люди часто забывают перед строительством", "P2"],
  ["e-028", "pochemu-nelzya-vybirat-dom-tolko-po-kartinke", "author-column", "mistakes-and-lessons", "ivan-samodelkin", "Почему нельзя выбирать дом только по картинке", "Почему нельзя выбирать дом только по картинке", "P2"],
  ["e-029", "kak-ne-poteryat-dengi-na-pervoy-smete", "author-column", "estimate-and-budget-stories", "anton-korobkov", "Как не потерять деньги на первой смете", "Как не потерять деньги на первой смете", "P2"],
  ["e-030", "kakie-voprosy-zadat-podryadchiku-do-dogovora", "question-roundup", "mistakes-and-lessons", "anton-korobkov", "Какие вопросы задать подрядчику до договора", "Какие вопросы задать подрядчику до договора", "P2"],
  ["e-031", "daydzhest-stroitelstva-nedeli", "weekly-digest", "weekly-digest", "editorial-stroistroy", "Дайджест строительства недели", "Дайджест строительства недели", "P3", "needs-human-review"],
  ["e-032", "voprosy-nedeli-o-stroitelstve-doma", "question-roundup", "questions-of-the-week", "editorial-stroistroy", "Вопросы недели о строительстве дома", "Вопросы недели о строительстве дома", "P3"],
  ["e-033", "chto-pochitat-pered-vyborom-proekta", "weekly-digest", "weekly-digest", "editorial-stroistroy", "Что почитать перед выбором проекта", "Что почитать перед выбором проекта", "P3"],
  ["e-034", "5-poleznyh-materialov-o-stroitelstve-doma", "weekly-digest", "weekly-digest", "editorial-stroistroy", "5 полезных материалов о строительстве дома", "5 полезных материалов о строительстве дома", "P3"],
  ["e-035", "daydzhest-po-uchastkam-i-fundamentam", "weekly-digest", "weekly-digest", "editorial-stroistroy", "Дайджест по участкам и фундаментам", "Дайджест по участкам и фундаментам", "P3"],
  ["e-036", "chto-izmenilos-v-zagorodnom-stroitelstve", "trend-review", "market-news", "editorial-stroistroy", "Что изменилось в загородном строительстве", "Что изменилось в загородном строительстве", "P4", "needs-source", true],
  ["e-037", "kak-menyaetsya-spros-na-doma-v-irkutskoy-oblasti", "trend-review", "market-news", "editorial-stroistroy", "Как меняется спрос на дома в Иркутской области", "Как меняется спрос на дома в Иркутской области", "P4", "needs-source", true],
  ["e-038", "kakie-doma-chashche-ishchut-v-irkutske", "news-analysis", "market-news", "editorial-stroistroy", "Какие дома чаще ищут в Иркутске", "Какие дома чаще ищут в Иркутске", "P4", "needs-source", true],
  ["e-039", "pochemu-rastet-interes-k-domam-100-150-m2", "trend-review", "market-news", "editorial-stroistroy", "Почему растёт интерес к домам 100–150 м²", "Почему растёт интерес к домам 100–150 м²", "P4", "needs-source", true],
  ["e-040", "chto-vazhno-znat-o-stroitelstve-v-sezon", "news", "market-news", "editorial-stroistroy", "Что важно знать о строительстве в сезон", "Что важно знать о строительстве в сезон", "P4", "needs-source", true],
  ["e-041", "anton-korobkov-pochemu-smeta-nachinaetsya-s-uchastka", "author-column", "editorial-opinion", "anton-korobkov", "Почему смета начинается с участка", "Антон Коробков: почему смета начинается с участка", "P3"],
  ["e-042", "ivan-samodelkin-pochemu-dom-ne-vybiraetsya-po-kartinke", "author-column", "editorial-opinion", "ivan-samodelkin", "Почему дом не выбирается по картинке", "Иван Самоделкин: почему дом не выбирается по картинке", "P3"],
  ["e-043", "marusya-irkutskaya-kak-predstavit-zhizn-v-dome", "author-column", "editorial-opinion", "marusya-irkutskaya", "Как представить жизнь в доме", "Маруся Иркутская: как представить жизнь в доме", "P3"],
  ["e-044", "vanya-mamonskiy-pro-uchastok-podezd-i-realnost", "author-column", "editorial-opinion", "vanya-mamonskiy", "Про участок, подъезд и реальность", "Ваня Мамонский: про участок, подъезд и реальность", "P3"],
  ["e-045", "irina-klubnichnaya-zachem-domu-terrasa", "author-column", "editorial-opinion", "irina-klubnichnaya", "Зачем дому терраса", "Ирина Клубничная: зачем дому терраса", "P3"],
  ["e-046", "mozhno-li-postroit-dom-bez-gotovogo-proekta", "question-roundup", "questions-of-the-week", "ivan-samodelkin", "Можно ли построить дом без готового проекта", "Можно ли построить дом без готового проекта", "P3"],
  ["e-047", "kakoy-dom-proshche-obsluzhivat", "question-roundup", "questions-of-the-week", "editorial-stroistroy", "Какой дом проще обслуживать", "Какой дом проще обслуживать", "P4"],
  ["e-048", "chto-vybrat-dom-ili-banyu-pervoy", "question-roundup", "questions-of-the-week", "ivan-samodelkin", "Что выбрать первым — дом или баню", "Что выбрать первым — дом или баню", "P4"],
  ["e-049", "kogda-luchshe-nachinat-stroitelstvo", "question-roundup", "questions-of-the-week", "editorial-stroistroy", "Когда лучше начинать строительство", "Когда лучше начинать строительство в Иркутской области", "P4"],
  ["e-050", "kak-ponyat-chto-proekt-podhodit-seme", "scenario-story", "project-choice-stories", "marusya-irkutskaya", "Как понять, что проект подходит семье", "Как понять, что проект подходит семье", "P2"],
];

export const editorialContentInitialQueue: EditorialContentQueueItem[] = defs.map(
  ([id, slug, type, rubricId, authorId, title, h1, priority, status, sourceRequired]) => ({
    id,
    slug,
    type,
    rubricId,
    authorId,
    title,
    h1,
    targetKeyword: title.toLowerCase(),
    status: status ?? "needs-human-review",
    priority,
    isCompositeScenario: type !== "news" && type !== "weekly-digest",
    sourceRequired: sourceRequired ?? false,
  }),
);

export function getEditorialQueueItemBySlug(slug: string) {
  return editorialContentInitialQueue.find((q) => q.slug === slug);
}

export function getEditorialQueueStats() {
  const byStatus: Record<string, number> = {};
  const byRubric: Record<string, number> = {};
  for (const q of editorialContentInitialQueue) {
    byStatus[q.status] = (byStatus[q.status] ?? 0) + 1;
    byRubric[q.rubricId] = (byRubric[q.rubricId] ?? 0) + 1;
  }
  return { total: editorialContentInitialQueue.length, byStatus, byRubric };
}
