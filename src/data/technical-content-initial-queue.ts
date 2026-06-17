import type { TechnicalContentQueueItem } from "@/types/technical-content";

/** Начальная очередь технических статей — draft/planned, noindex до проверки. */
export const technicalContentInitialQueue: TechnicalContentQueueItem[] = [
  // P1
  { id: "t-001", slug: "kak-uteplit-krovlyu", clusterId: "roof-insulation", type: "how-to", title: "Как утеплить кровлю", h1: "Как утеплить кровлю частного дома", targetKeyword: "как утеплить кровлю", status: "needs-expert-review", priority: "P1", authorId: "anton-korobkov" },
  { id: "t-002", slug: "kak-uteplit-mansardnuyu-kryshu", clusterId: "mansard-roof-insulation", type: "how-to", title: "Как утеплить мансардную крышу", h1: "Как утеплить мансардную крышу", targetKeyword: "как утеплить мансардную крышу", status: "needs-expert-review", priority: "P1", authorId: "anton-korobkov" },
  { id: "t-003", slug: "kak-uteplit-pol-v-dome", clusterId: "floor-insulation", type: "how-to", title: "Как утеплить пол в доме", h1: "Как утеплить пол в частном доме", targetKeyword: "как утеплить пол в доме", status: "needs-expert-review", priority: "P1" },
  { id: "t-004", slug: "kak-uteplit-steny", clusterId: "wall-insulation", type: "how-to", title: "Как утеплить стены", h1: "Как утеплить стены частного дома", targetKeyword: "как утеплить стены", status: "needs-expert-review", priority: "P1" },
  { id: "t-005", slug: "kak-vybrat-fundament", clusterId: "foundation-choice", type: "how-to", title: "Как выбрать фундамент", h1: "Как выбрать фундамент для частного дома", targetKeyword: "как выбрать фундамент", status: "needs-expert-review", priority: "P1" },
  { id: "t-006", slug: "kak-proverit-uchastok-pered-stroitelstvom", clusterId: "land-plot-check", type: "checklist", title: "Как проверить участок перед строительством", h1: "Как проверить участок перед строительством дома", targetKeyword: "как проверить участок перед строительством", status: "planned", priority: "P1" },
  { id: "t-007", slug: "kak-chitat-smetu-na-stroitelstvo-doma", clusterId: "estimate-reading", type: "cost-explainer", title: "Как читать смету на строительство дома", h1: "Как читать смету на строительство дома", targetKeyword: "как читать смету на строительство дома", status: "planned", priority: "P1" },
  { id: "t-008", slug: "chto-vliyaet-na-stoimost-stroitelstva-doma", clusterId: "estimate-reading", type: "cost-explainer", title: "Что влияет на стоимость строительства дома", h1: "Что влияет на стоимость строительства дома", targetKeyword: "что влияет на стоимость строительства дома", status: "planned", priority: "P1" },
  { id: "t-009", slug: "oshibki-pri-stroitelstve-doma", clusterId: "construction-mistakes", type: "mistakes", title: "Ошибки при строительстве дома", h1: "Ошибки при строительстве дома", targetKeyword: "ошибки при строительстве дома", status: "draft", priority: "P1" },
  { id: "t-010", slug: "karkas-ili-brus-chto-vybrat", clusterId: "frame-house-technology", type: "comparison", title: "Каркас или брус — что выбрать", h1: "Каркас или брус — что выбрать для дома", targetKeyword: "каркас или брус что выбрать", status: "planned", priority: "P1" },
  // P2
  { id: "t-011", slug: "kak-stroitsya-karkasnyy-dom", clusterId: "frame-house-technology", type: "process-explainer", title: "Как строится каркасный дом", h1: "Как строится каркасный дом", targetKeyword: "как строится каркасный дом", status: "planned", priority: "P2" },
  { id: "t-012", slug: "dom-iz-brusa-plyusy-i-minusy", clusterId: "timber-house-technology", type: "material-explainer", title: "Дом из бруса: плюсы и минусы", h1: "Дом из бруса: плюсы и минусы", targetKeyword: "дом из бруса плюсы и минусы", status: "planned", priority: "P2" },
  { id: "t-013", slug: "dom-iz-gazobetona-plyusy-i-minusy", clusterId: "gas-concrete-technology", type: "material-explainer", title: "Дом из газобетона: плюсы и минусы", h1: "Дом из газобетона: плюсы и минусы", targetKeyword: "дом из газобетона плюсы и минусы", status: "planned", priority: "P2" },
  { id: "t-014", slug: "karkasnyy-dom-ili-gazobeton", clusterId: "gas-concrete-technology", type: "comparison", title: "Каркасный дом или газобетон", h1: "Каркасный дом или газобетон — что выбрать", targetKeyword: "каркасный дом или газобетон", status: "planned", priority: "P2" },
  { id: "t-015", slug: "brus-ili-gazobeton", clusterId: "timber-house-technology", type: "comparison", title: "Брус или газобетон", h1: "Брус или газобетон — сравнение для частного дома", targetKeyword: "брус или газобетон", status: "planned", priority: "P2" },
  { id: "t-016", slug: "kak-vybrat-material-dlya-doma", clusterId: "frame-house-technology", type: "guide", title: "Как выбрать материал для дома", h1: "Как выбрать материал для частного дома", targetKeyword: "как выбрать материал для дома", status: "needs-keyword-data", priority: "P2" },
  { id: "t-017", slug: "chto-takoe-teplyy-kontur", clusterId: "engineering-systems", type: "process-explainer", title: "Что такое тёплый контур", h1: "Что такое тёплый контур дома", targetKeyword: "что такое теплый контур", status: "planned", priority: "P2" },
  { id: "t-018", slug: "chto-vhodit-v-dom-pod-klyuch", clusterId: "engineering-systems", type: "process-explainer", title: "Что входит в дом под ключ", h1: "Что входит в строительство дома под ключ", targetKeyword: "что входит в дом под ключ", status: "planned", priority: "P2" },
  // P3
  { id: "t-019", slug: "oshibki-utepleniya-krovli", clusterId: "roof-insulation", type: "mistakes", title: "Ошибки утепления кровли", h1: "Ошибки при утеплении кровли", targetKeyword: "ошибки утепления кровли", status: "needs-expert-review", priority: "P3" },
  { id: "t-020", slug: "paroizolyaciya-v-karkasnom-dome", clusterId: "vapor-barrier", type: "guide", title: "Пароизоляция в каркасном доме", h1: "Пароизоляция в каркасном доме", targetKeyword: "пароизоляция в каркасном доме", status: "needs-expert-review", priority: "P3" },
  { id: "t-021", slug: "ventilyaciya-krovli", clusterId: "ventilation", type: "how-to", title: "Вентиляция кровли", h1: "Вентиляция кровли в частном доме", targetKeyword: "вентиляция кровли", status: "needs-expert-review", priority: "P3" },
  { id: "t-022", slug: "kak-uteplit-steny-karkasnogo-doma", clusterId: "wall-insulation", type: "how-to", title: "Как утеплить стены каркасного дома", h1: "Как утеплить стены каркасного дома", targetKeyword: "как утеплить стены каркасного дома", status: "needs-expert-review", priority: "P3" },
  { id: "t-023", slug: "kak-uteplit-pol-v-derevyannom-dome", clusterId: "floor-insulation", type: "how-to", title: "Как утеплить пол в деревянном доме", h1: "Как утеплить пол в деревянном доме", targetKeyword: "как утеплить пол в деревянном доме", status: "needs-expert-review", priority: "P3" },
  { id: "t-024", slug: "chto-takoe-pirog-steny", clusterId: "wall-insulation", type: "guide", title: "Что такое пирог стены", h1: "Что такое пирог стены в частном доме", targetKeyword: "что такое пирог стены", status: "planned", priority: "P3" },
  { id: "t-025", slug: "chto-takoe-pirog-krovli", clusterId: "roof-insulation", type: "guide", title: "Что такое пирог кровли", h1: "Что такое пирог кровли", targetKeyword: "что такое пирог кровли", status: "planned", priority: "P3" },
  // P4
  { id: "t-026", slug: "kakoy-fundament-vybrat-dlya-doma", clusterId: "foundation-choice", type: "how-to", title: "Какой фундамент выбрать для дома", h1: "Какой фундамент выбрать для частного дома", targetKeyword: "какой фундамент выбрать для дома", status: "planned", priority: "P4" },
  { id: "t-027", slug: "fundament-dlya-karkasnogo-doma", clusterId: "foundation-choice", type: "guide", title: "Фундамент для каркасного дома", h1: "Какой фундамент подходит для каркасного дома", targetKeyword: "фундамент для каркасного дома", status: "needs-expert-review", priority: "P4" },
  { id: "t-028", slug: "fundament-dlya-doma-iz-brusa", clusterId: "foundation-choice", type: "guide", title: "Фундамент для дома из бруса", h1: "Фундамент для дома из бруса", targetKeyword: "фундамент для дома из бруса", status: "needs-expert-review", priority: "P4" },
  { id: "t-029", slug: "kak-uklon-uchastka-vliyaet-na-stroitelstvo", clusterId: "land-plot-check", type: "guide", title: "Как уклон участка влияет на строительство", h1: "Как уклон участка влияет на строительство дома", targetKeyword: "уклон участка строительство", status: "planned", priority: "P4" },
  { id: "t-030", slug: "kak-podezd-k-uchastku-vliyaet-na-smetu", clusterId: "land-plot-check", type: "cost-explainer", title: "Как подъезд к участку влияет на смету", h1: "Как подъезд к участку влияет на смету", targetKeyword: "подъезд к участку смета", status: "planned", priority: "P4" },
  { id: "t-031", slug: "kommunikacii-na-uchastke-pered-stroitelstvom", clusterId: "land-plot-check", type: "checklist", title: "Коммуникации на участке перед строительством", h1: "Коммуникации на участке перед строительством", targetKeyword: "коммуникации на участке", status: "planned", priority: "P4" },
  // P5
  { id: "t-032", slug: "kak-postroit-banyu-na-uchastke", clusterId: "bathhouse-building", type: "how-to", title: "Как построить баню на участке", h1: "Как построить баню на участке", targetKeyword: "как построить баню на участке", status: "planned", priority: "P5" },
  { id: "t-033", slug: "banya-iz-brusa-ili-karkasnaya", clusterId: "bathhouse-building", type: "comparison", title: "Баня из бруса или каркасная", h1: "Баня из бруса или каркасная — что выбрать", targetKeyword: "баня из бруса или каркасная", status: "planned", priority: "P5" },
  { id: "t-034", slug: "kak-vybrat-razmer-bani", clusterId: "bathhouse-building", type: "guide", title: "Как выбрать размер бани", h1: "Как выбрать размер бани для участка", targetKeyword: "как выбрать размер бани", status: "planned", priority: "P5" },
  { id: "t-035", slug: "oshibki-pri-stroitelstve-bani", clusterId: "bathhouse-building", type: "mistakes", title: "Ошибки при строительстве бани", h1: "Ошибки при строительстве бани", targetKeyword: "ошибки при строительстве бани", status: "draft", priority: "P5" },
  { id: "t-036", slug: "chto-uchest-pri-stroitelstve-bani-3-na-3", clusterId: "bathhouse-building", type: "guide", title: "Что учесть при строительстве бани 3×3", h1: "Что учесть при строительстве бани 3 на 3", targetKeyword: "баня 3 на 3 строительство", status: "planned", priority: "P5" },
  // P6
  { id: "t-037", slug: "chto-dolzhno-byt-v-dogovore-na-stroitelstvo-doma", clusterId: "contract-and-warranty", type: "checklist", title: "Что должно быть в договоре на строительство дома", h1: "Что должно быть в договоре на строительство дома", targetKeyword: "договор на строительство дома", status: "needs-expert-review", priority: "P6" },
  { id: "t-038", slug: "kak-kontrolirovat-stroitelstvo-doma", clusterId: "quality-control", type: "guide", title: "Как контролировать строительство дома", h1: "Как контролировать строительство дома", targetKeyword: "как контролировать строительство дома", status: "planned", priority: "P6" },
  { id: "t-039", slug: "kak-rabotayut-fotootchety-na-stroyke", clusterId: "quality-control", type: "process-explainer", title: "Как работают фотоотчёты на стройке", h1: "Как работают фотоотчёты на стройке", targetKeyword: "фотоотчеты на стройке", status: "planned", priority: "P6" },
  { id: "t-040", slug: "kak-prinimat-etapy-stroitelstva", clusterId: "quality-control", type: "checklist", title: "Как принимать этапы строительства", h1: "Как принимать этапы строительства дома", targetKeyword: "приемка этапов строительства", status: "planned", priority: "P6" },
  { id: "t-041", slug: "kakie-garantii-dolzhny-byt-na-dom", clusterId: "contract-and-warranty", type: "guide", title: "Какие гарантии должны быть на дом", h1: "Какие гарантии должны быть на дом", targetKeyword: "гарантии на строительство дома", status: "needs-expert-review", priority: "P6" },
  // P7
  { id: "t-042", slug: "chto-uchest-pri-stroitelstve-doma-v-irkutskoy-oblasti", clusterId: "winter-construction", type: "local-technical-guide", title: "Что учесть при строительстве дома в Иркутской области", h1: "Что учесть при строительстве дома в Иркутской области", targetKeyword: "строительство дома иркутская область", status: "needs-keyword-data", priority: "P7" },
  { id: "t-043", slug: "kak-sezon-vliyaet-na-stroitelstvo-v-irkutske", clusterId: "winter-construction", type: "local-technical-guide", title: "Как сезон влияет на строительство в Иркутске", h1: "Как сезон влияет на строительство в Иркутске", targetKeyword: "сезон строительство иркутск", status: "planned", priority: "P7" },
  { id: "t-044", slug: "kak-vybrat-dom-dlya-uchastka-v-irkutskoy-oblasti", clusterId: "land-plot-check", type: "local-technical-guide", title: "Как выбрать дом для участка в Иркутской области", h1: "Как выбрать дом для участка в Иркутской области", targetKeyword: "выбрать дом иркутская область", status: "planned", priority: "P7" },
  { id: "t-045", slug: "kak-podgotovitsya-k-stroitelstvu-doma-v-irkutske", clusterId: "winter-construction", type: "guide", title: "Как подготовиться к строительству дома в Иркутске", h1: "Как подготовиться к строительству дома в Иркутске", targetKeyword: "подготовка к строительству иркутск", status: "planned", priority: "P7" },
  // P8
  { id: "t-046", slug: "pochemu-smeta-mozhet-izmenitsya", clusterId: "estimate-reading", type: "cost-explainer", title: "Почему смета может измениться", h1: "Почему смета на строительство дома может измениться", targetKeyword: "почему меняется смета", status: "planned", priority: "P8" },
  { id: "t-047", slug: "kakie-rashody-chasto-zabyvayut-v-smete", clusterId: "estimate-reading", type: "mistakes", title: "Какие расходы часто забывают в смете", h1: "Какие расходы часто забывают в смете на дом", targetKeyword: "расходы в смете дом", status: "planned", priority: "P8" },
  { id: "t-048", slug: "korobka-teplyy-kontur-pod-klyuch-v-chem-raznica", clusterId: "engineering-systems", type: "comparison", title: "Коробка, тёплый контур, под ключ — в чём разница", h1: "Коробка, тёплый контур и дом под ключ — в чём разница", targetKeyword: "теплый контур под ключ разница", status: "planned", priority: "P8" },
  { id: "t-049", slug: "kak-sravnivat-smety-raznyh-podryadchikov", clusterId: "estimate-reading", type: "guide", title: "Как сравнивать сметы разных подрядчиков", h1: "Как сравнивать сметы разных подрядчиков", targetKeyword: "сравнить сметы подрядчиков", status: "planned", priority: "P8" },
  { id: "t-050", slug: "kak-poluchit-predvaritelnyy-raschet-doma", clusterId: "estimate-reading", type: "cost-explainer", title: "Как получить предварительный расчёт дома", h1: "Как получить предварительный расчёт строительства дома", targetKeyword: "предварительный расчет дома", status: "planned", priority: "P8" },
];

export function getTechnicalQueueItemBySlug(slug: string) {
  return technicalContentInitialQueue.find((q) => q.slug === slug);
}

export function getTechnicalQueueByCluster(clusterId: string) {
  return technicalContentInitialQueue.filter((q) => q.clusterId === clusterId);
}

export function getTechnicalQueueStats() {
  const byStatus: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  for (const q of technicalContentInitialQueue) {
    byStatus[q.status] = (byStatus[q.status] ?? 0) + 1;
    byPriority[q.priority] = (byPriority[q.priority] ?? 0) + 1;
  }
  return {
    total: technicalContentInitialQueue.length,
    byStatus,
    byPriority,
  };
}
